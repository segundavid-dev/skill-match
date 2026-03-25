import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function initIO(httpServer: any): IOServer {
  io = new IOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // User joins their personal room for targeted events
    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    // Join a chat room
    socket.on('join_room', (roomId: string) => {
      socket.join(`chat:${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): IOServer {
  if (!io) {
    // Return a no-op mock if IO not initialized yet
    return {
      to: () => ({ emit: () => {} }),
    } as unknown as IOServer;
  }
  return io;
}
