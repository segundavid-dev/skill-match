import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../config/prisma';
import { redis, redisKeys, ONLINE_TTL } from '../config/redis';
import { logger } from '../utils/logger';

let io: Server;

// ── Socket auth middleware ────────────────────────────────────────────────────
async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) return next(new Error('Authentication token required'));

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, verified: true },
    });

    if (!user || !user.verified) return next(new Error('Unauthorized'));

    // Attach user to socket
    (socket as any).userId = user.id;
    (socket as any).role = user.role;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}

// ── Event handlers ────────────────────────────────────────────────────────────
function registerChatEvents(socket: Socket) {
  const userId = (socket as any).userId as string;

  // Join a chat room
  socket.on('joinRoom', async (roomId: string) => {
    try {
      const participant = await prisma.chatParticipant.findUnique({
        where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
      });
      if (!participant) {
        socket.emit('error', { message: 'You are not a participant of this room' });
        return;
      }
      socket.join(`room:${roomId}`);
      socket.emit('joinedRoom', { roomId });
      logger.debug(`User ${userId} joined room ${roomId}`);
    } catch (err) {
      logger.error('joinRoom error', { err });
    }
  });

  // Leave a chat room
  socket.on('leaveRoom', (roomId: string) => {
    socket.leave(`room:${roomId}`);
  });

  // Send a message via socket
  socket.on('sendMessage', async ({ roomId, content }: { roomId: string; content: string }) => {
    try {
      if (!content?.trim() || content.length > 2000) {
        socket.emit('error', { message: 'Invalid message content' });
        return;
      }

      const participant = await prisma.chatParticipant.findUnique({
        where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
      });
      if (!participant) {
        socket.emit('error', { message: 'Not a room member' });
        return;
      }

      const message = await prisma.message.create({
        data: { chatRoomId: roomId, senderId: userId, content: content.trim() },
        include: {
          sender: {
            select: {
              id: true,
              role: true,
              volunteerProfile: { select: { fullName: true, avatar: true } },
              orgProfile: { select: { name: true, logo: true } },
            },
          },
        },
      });

      await prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });

      // Broadcast to all room members (including sender for confirmation)
      io.to(`room:${roomId}`).emit('newMessage', message);
    } catch (err) {
      logger.error('sendMessage socket error', { err });
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
    socket.to(`room:${roomId}`).emit('userTyping', { userId, isTyping });
  });

  // Confirm opportunity from chat
  socket.on('confirmOpportunity', async ({ roomId, opportunityId }: { roomId: string; opportunityId: string }) => {
    try {
      io.to(`room:${roomId}`).emit('opportunityConfirmed', {
        opportunityId,
        confirmedBy: userId,
        message: 'Participation confirmed! 🎉',
      });
    } catch (err) {
      logger.error('confirmOpportunity socket error', { err });
    }
  });

  // Read receipts
  socket.on('markRead', async ({ roomId }: { roomId: string }) => {
    try {
      await prisma.message.updateMany({
        where: { chatRoomId: roomId, senderId: { not: userId }, read: false },
        data: { read: true },
      });
      socket.to(`room:${roomId}`).emit('messagesRead', { roomId, readBy: userId });
    } catch (err) {
      logger.error('markRead error', { err });
    }
  });
}

function registerPresenceEvents(socket: Socket) {
  const userId = (socket as any).userId as string;

  // Mark user online in Redis
  const setOnline = async () => {
    await redis.setex(redisKeys.onlineUser(userId), ONLINE_TTL, '1').catch(() => {});
    io.to(`user:${userId}`).emit('onlineStatus', { userId, online: true });
  };

  // Heartbeat to keep online status fresh
  socket.on('heartbeat', setOnline);

  socket.on('disconnect', async () => {
    await redis.del(redisKeys.onlineUser(userId)).catch(() => {});
    io.emit('onlineStatus', { userId, online: false });
    logger.debug(`User ${userId} disconnected`);
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
export function initSockets(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    logger.info(`Socket connected: ${userId}`);

    // Join personal room for DMs / notifications
    socket.join(`user:${userId}`);

    // Set online
    redis.setex(redisKeys.onlineUser(userId), ONLINE_TTL, '1').catch(() => {});

    registerChatEvents(socket);
    registerPresenceEvents(socket);
  });

  logger.info('Socket.io initialised');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialised — call initSockets first');
  return io;
}
