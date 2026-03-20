import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendCreated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const ratingController = {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const fromUserId = req.user!.userId;
      const { toUserId, stars, feedback } = req.body;

      if (fromUserId === toUserId) throw new AppError('You cannot rate yourself', 400);
      if (stars < 1 || stars > 5) throw new AppError('Stars must be between 1 and 5', 400);

      const toUser = await prisma.user.findUnique({
        where: { id: toUserId },
        include: { volunteerProfile: true, orgProfile: true },
      });
      if (!toUser) throw new AppError('User not found', 404);

      const rating = await prisma.rating.create({
        data: {
          fromUserId,
          toUserId,
          stars,
          feedback,
          volunteerProfileId: toUser.volunteerProfile?.id,
          orgProfileId: toUser.orgProfile?.id,
        },
      });

      // Recalculate impact score for volunteers
      if (toUser.volunteerProfile) {
        const allRatings = await prisma.rating.findMany({
          where: { toUserId },
          select: { stars: true },
        });
        const avg = allRatings.reduce((s, r) => s + r.stars, 0) / allRatings.length;
        const impactScore = Math.min(100, Math.round(avg * 20 + allRatings.length * 2));
        await prisma.volunteerProfile.update({
          where: { id: toUser.volunteerProfile.id },
          data: { impactScore },
        });
      }

      sendCreated(res, rating, 'Rating submitted. Thank you for your feedback!');
    } catch (err) { next(err); }
  },

  async getForProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: targetUserId } = req.params;

      const ratings = await prisma.rating.findMany({
        where: { toUserId: targetUserId },
        include: {
          fromUser: {
            select: {
              role: true,
              volunteerProfile: { select: { fullName: true, avatar: true } },
              orgProfile: { select: { name: true, logo: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const avg = ratings.length
        ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
        : 0;

      sendSuccess(res, {
        ratings,
        summary: {
          averageRating: Math.round(avg * 10) / 10,
          count: ratings.length,
          breakdown: [5, 4, 3, 2, 1].map((star) => ({
            stars: star,
            count: ratings.filter((r) => r.stars === star).length,
          })),
        },
      });
    } catch (err) { next(err); }
  },

  async getSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const skills = await prisma.skill.findMany({
        where: q ? { name: { contains: q as string, mode: 'insensitive' } } : undefined,
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, skills);
    } catch (err) { next(err); }
  },
};
