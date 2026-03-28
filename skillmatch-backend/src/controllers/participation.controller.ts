import { Request, Response, NextFunction } from 'express';
import { ParticipationStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { sendSuccess, sendCreated, sendForbidden, sendNotFound } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const participationController = {
  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { opportunityId } = req.body;

      const profile = await prisma.volunteerProfile.findUnique({ where: { userId } });
      if (!profile) throw new AppError('Volunteer profile not found', 404);

      const opp = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
      if (!opp) throw new AppError('Opportunity not found', 404);
      if (opp.spotsFilled >= opp.spotsNeeded) throw new AppError('This opportunity is fully booked', 409);

      // Ensure there's a MUTUAL match
      const match = await prisma.match.findUnique({
        where: { volunteerId_opportunityId: { volunteerId: profile.id, opportunityId } },
      });
      if (!match || match.status !== 'MUTUAL') {
        throw new AppError('You must have a mutual match before confirming participation', 400);
      }

      const [participation] = await prisma.$transaction([
        prisma.participation.upsert({
          where: { volunteerId_opportunityId: { volunteerId: profile.id, opportunityId } },
          update: { status: ParticipationStatus.CONFIRMED, confirmedDate: new Date() },
          create: {
            volunteerId: profile.id,
            opportunityId,
            status: ParticipationStatus.CONFIRMED,
            confirmedDate: new Date(),
          },
        }),
        prisma.match.update({
          where: { id: match.id },
          data: { status: 'ACCEPTED' },
        }),
      ]);

      sendCreated(res, participation, 'Participation confirmed! 🎉');
    } catch (err) { next(err); }
  },

  async getMyParticipations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await prisma.volunteerProfile.findUnique({ where: { userId } });
      if (!profile) throw new AppError('Profile not found', 404);

      const { status } = req.query;
      const where: any = { volunteerId: profile.id };
      if (status) where.status = status;

      const participations = await prisma.participation.findMany({
        where,
        include: {
          opportunity: {
            include: {
              org: { select: { name: true, logo: true } },
              requiredSkills: { include: { skill: { select: { name: true } } } },
            },
          },
        },
        orderBy: { confirmedDate: 'asc' },
      });

      sendSuccess(res, participations);
    } catch (err) { next(err); }
  },

  async markComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const participation = await prisma.participation.findUnique({
        where: { id },
        include: { volunteer: true, opportunity: { include: { org: true } } },
      });
      if (!participation) return sendNotFound(res);

      // Only org or admin can mark complete
      const isOrg = participation.opportunity.org.userId === userId;
      if (!isOrg && req.user!.role !== 'ADMIN') return sendForbidden(res);

      const updated = await prisma.participation.update({
        where: { id },
        data: { status: ParticipationStatus.COMPLETED, completedDate: new Date() },
      });

      sendSuccess(res, updated, 'Participation marked as completed');
    } catch (err) { next(err); }
  },
};
