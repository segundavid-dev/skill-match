import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendCreated, sendForbidden, sendNotFound } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const chatController = {
  async getMyChats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const rooms = await prisma.chatRoom.findMany({
        where: { participants: { some: { userId } } },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  role: true,
                  volunteerProfile: { select: { fullName: true, avatar: true } },
                  orgProfile: { select: { name: true, logo: true } },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          match: {
            include: {
              opportunity: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      sendSuccess(res, rooms, 'Chats fetched');
    } catch (err) { next(err); }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { roomId } = req.params;
      const { page = '1', limit = '50' } = req.query as Record<string, string>;

      // Verify user is participant
      const participant = await prisma.chatParticipant.findUnique({
        where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
      });
      if (!participant) return sendForbidden(res, 'You are not a member of this chat room');

      const take = Math.min(parseInt(limit), 100);
      const skip = (parseInt(page) - 1) * take;

      const [total, messages] = await Promise.all([
        prisma.message.count({ where: { chatRoomId: roomId } }),
        prisma.message.findMany({
          where: { chatRoomId: roomId },
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
          orderBy: { createdAt: 'desc' },
          take,
          skip,
        }),
      ]);

      // Mark messages as read
      await prisma.message.updateMany({
        where: { chatRoomId: roomId, senderId: { not: userId }, read: false },
        data: { read: true },
      });

      sendSuccess(res, messages.reverse(), 'Messages fetched', 200, {
        total, page: parseInt(page), limit: take,
      });
    } catch (err) { next(err); }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { roomId } = req.params;
      const { content } = req.body;

      const participant = await prisma.chatParticipant.findUnique({
        where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
      });
      if (!participant) return sendForbidden(res, 'You are not a member of this chat room');

      const message = await prisma.message.create({
        data: { chatRoomId: roomId, senderId: userId, content },
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

      // Update room's updatedAt so it sorts to top
      await prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });

      sendCreated(res, message, 'Message sent');
    } catch (err) { next(err); }
  },
};
