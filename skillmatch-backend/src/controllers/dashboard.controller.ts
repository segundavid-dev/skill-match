import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const dashboardController = {
  async volunteerDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await prisma.volunteerProfile.findUnique({
        where: { userId },
        include: {
          skills: { include: { skill: true } },
          user: { include: { ratingsReceived: true } },
        },
      });
      if (!profile) throw new AppError('Volunteer profile not found', 404);

      const [matchCount, confirmedCount, completedCount, recentMatches, upcoming] = await Promise.all([
        prisma.match.count({ where: { volunteerId: profile.id } }),
        prisma.participation.count({ where: { volunteerId: profile.id, status: 'CONFIRMED' } }),
        prisma.participation.count({ where: { volunteerId: profile.id, status: 'COMPLETED' } }),
        prisma.match.findMany({
          where: { volunteerId: profile.id },
          include: {
            opportunity: {
              include: { org: { select: { name: true, logo: true } } },
            },
            chatRoom: { select: { id: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.participation.findMany({
          where: { volunteerId: profile.id, status: { in: ['CONFIRMED', 'PENDING'] } },
          include: {
            opportunity: {
              include: { org: { select: { name: true, logo: true } } },
            },
          },
          orderBy: { confirmedDate: 'asc' },
          take: 5,
        }),
      ]);

      const ratings = profile.user.ratingsReceived;
      const avgRating = ratings.length
        ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
        : 0;

      sendSuccess(res, {
        profile: {
          fullName: profile.fullName,
          avatar: profile.avatar,
          impactScore: profile.impactScore,
          skills: profile.skills.map((s) => s.skill.name),
        },
        stats: {
          totalMatches: matchCount,
          confirmed: confirmedCount,
          completed: completedCount,
          avgRating: Math.round(avgRating * 10) / 10,
        },
        recentMatches,
        upcomingOpportunities: upcoming,
      });
    } catch (err) { next(err); }
  },

  async orgDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const org = await prisma.organizationProfile.findUnique({ where: { userId } });
      if (!org) throw new AppError('Organization profile not found', 404);

      const [activeOpps, totalMatches, totalConfirmed, recentMatches, myOpportunities] = await Promise.all([
        prisma.opportunity.count({ where: { orgId: org.id, status: 'ACTIVE' } }),
        prisma.match.count({
          where: { opportunity: { orgId: org.id } },
        }),
        prisma.participation.count({
          where: { opportunity: { orgId: org.id }, status: { in: ['CONFIRMED', 'COMPLETED'] } },
        }),
        prisma.match.findMany({
          where: { opportunity: { orgId: org.id }, status: 'MUTUAL' },
          include: {
            volunteer: {
              include: {
                skills: { include: { skill: { select: { name: true } } } },
              },
            },
            opportunity: { select: { title: true } },
            chatRoom: { select: { id: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.opportunity.findMany({
          where: { orgId: org.id },
          include: {
            _count: { select: { matches: true, participations: true } },
            requiredSkills: { include: { skill: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

      sendSuccess(res, {
        org: { name: org.name, logo: org.logo, verifiedBadge: org.verifiedBadge },
        stats: {
          activeOpportunities: activeOpps,
          totalMatches,
          totalConfirmed,
          fillRate: activeOpps > 0 ? Math.round((totalConfirmed / Math.max(totalMatches, 1)) * 100) : 0,
        },
        recentMatches,
        opportunities: myOpportunities,
      });
    } catch (err) { next(err); }
  },
};
