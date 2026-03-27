import { Request, Response, NextFunction } from 'express';
import { SwipeDirection } from '@prisma/client';
import { prisma } from '../config/prisma';
import { swipeService } from '../services/swipe.service';
import { buildFeedForVolunteer } from '../services/matching.service';
import { sendSuccess, sendBadRequest } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { getIO } from '../sockets';

export const swipeController = {
  async swipe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { opportunityId, volunteerId, direction } = req.body;

      if (!['LEFT', 'RIGHT'].includes(direction)) {
        return sendBadRequest(res, 'Direction must be LEFT or RIGHT');
      }

      let result;

      if (req.user!.role === 'VOLUNTEER') {
        const profile = await prisma.volunteerProfile.findUnique({ where: { userId } });
        if (!profile) throw new AppError('Volunteer profile not found', 404);
        result = await swipeService.swipeOnOpportunity(userId, profile.id, opportunityId, direction as SwipeDirection);
      } else {
        if (!volunteerId) return sendBadRequest(res, 'volunteerId is required for organization swipes');
        result = await swipeService.orgSwipeOnVolunteer(userId, volunteerId, opportunityId, direction as SwipeDirection);
      }

      // Emit real-time event if mutual match
      if (result.isMutualMatch && result.match) {
        const io = getIO();
        // Notify volunteer
        io.to(`user:${userId}`).emit('new_match', {
          match: result.match,
          event: 'match_confetti',
        });
        // Notify org
        if (volunteerId) {
          const vol = await prisma.volunteerProfile.findUnique({ where: { id: volunteerId } });
          if (vol) io.to(`user:${vol.userId}`).emit('new_match', { match: result.match, event: 'match_confetti' });
        }
      }

      sendSuccess(res, result, result.isMutualMatch ? "🎉 It's a Match!" : 'Swipe recorded');
    } catch (err) { next(err); }
  },

  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      if (req.user!.role !== 'VOLUNTEER') {
        return sendBadRequest(res, 'Feed is available for volunteers only');
      }

      const profile = await prisma.volunteerProfile.findUnique({ where: { userId } });
      if (!profile) throw new AppError('Volunteer profile not found. Please complete onboarding.', 404);

      const limit = Math.min(parseInt((req.query.limit as string) ?? '10'), 50);
      const feedItems = await buildFeedForVolunteer(profile.id, userId, limit);

      // Hydrate with full opportunity data
      const opportunities = await Promise.all(
        feedItems.map(async (item) => {
          const opp = await prisma.opportunity.findUnique({
            where: { id: item.opportunityId },
            include: {
              org: { select: { id: true, name: true, logo: true, verifiedBadge: true } },
              requiredSkills: { include: { skill: { select: { id: true, name: true } } } },
            },
          });
          return { ...opp, matchScore: item.score.total };
        })
      );

      sendSuccess(res, opportunities, 'Feed loaded');
    } catch (err) { next(err); }
  },

  async getMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { status, page = '1', limit = '20' } = req.query as Record<string, string>;

      const take = Math.min(parseInt(limit), 100);
      const skip = (parseInt(page) - 1) * take;

      let where: any;

      if (req.user!.role === 'ORGANIZATION') {
        const org = await prisma.organizationProfile.findUnique({ where: { userId } });
        if (!org) throw new AppError('Organization profile not found', 404);
        where = { opportunity: { orgId: org.id } };
      } else {
        const profile = await prisma.volunteerProfile.findUnique({ where: { userId } });
        if (!profile) throw new AppError('Volunteer profile not found', 404);
        where = { volunteerId: profile.id };
      }

      if (status) where.status = status;

      const [total, matches] = await Promise.all([
        prisma.match.count({ where }),
        prisma.match.findMany({
          where,
          include: {
            volunteer: {
              include: {
                skills: { include: { skill: { select: { id: true, name: true } } } },
              },
            },
            opportunity: {
              include: {
                org: { select: { id: true, name: true, logo: true } },
                requiredSkills: { include: { skill: { select: { name: true } } } },
              },
            },
            chatRoom: { select: { id: true } },
          },
          orderBy: { matchScore: 'desc' },
          take,
          skip,
        }),
      ]);

      sendSuccess(res, matches, 'Matches fetched', 200, { total, page: parseInt(page), limit: take });
    } catch (err) { next(err); }
  },
};
