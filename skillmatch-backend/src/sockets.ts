import { Server as IOServer } from 'socket.io';
import { prisma } from './config/prisma';
import { verifyAccessToken } from './utils/jwt';

let io: IOServer | null = null;

export function initIO(httpServer: any): IOServer {
  io = new IOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`[socket] connected: ${socket.id} (user: ${userId})`);

    // Auto-join user's personal room
    socket.join(`user:${userId}`);

    // Join a chat room
    socket.on('join_room', (roomId: string) => {
      socket.join(`chat:${roomId}`);
    });

    // Leave a chat room
    socket.on('leave_room', (roomId: string) => {
      socket.leave(`chat:${roomId}`);
    });

    // Handle sending messages via socket
    socket.on('send_message', async (data: { roomId: string; content: string }) => {
      try {
        // Verify user is participant
        const participant = await prisma.chatParticipant.findUnique({
          where: { chatRoomId_userId: { chatRoomId: data.roomId, userId } },
        });
        if (!participant) return;

        // Create message in DB
        const message = await prisma.message.create({
          data: { chatRoomId: data.roomId, senderId: userId, content: data.content },
          include: {
            sender: {
              select: {
                id: true,
                volunteerProfile: { select: { fullName: true, avatar: true } },
                orgProfile: { select: { name: true, logo: true } },
              },
            },
          },
        });

        // Update room timestamp
        await prisma.chatRoom.update({
          where: { id: data.roomId },
          data: { updatedAt: new Date() },
        });

        // Broadcast to everyone in the chat room
        io!.to(`chat:${data.roomId}`).emit('new_message', message);
      } catch (err) {
        console.error('[socket] send_message error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): IOServer {
  if (!io) {
    return {
      to: () => ({ emit: () => {} }),
    } as unknown as IOServer;
  }
  return io;
}
