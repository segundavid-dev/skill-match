import { Request, Response, NextFunction } from 'express';
import { OpportunityStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { sendSuccess, sendCreated, sendNotFound, sendForbidden } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

const oppInclude = {
  org: { select: { id: true, name: true, logo: true, verifiedBadge: true } },
  requiredSkills: { include: { skill: { select: { id: true, name: true } } } },
  _count: { select: { participations: true, matches: true } },
};

export const opportunityController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orgProfile = await prisma.organizationProfile.findUnique({
        where: { userId: req.user!.userId },
      });
      if (!orgProfile) throw new AppError('Organization profile not found. Please complete setup.', 404);

      const { title, description, locationType, location, startDate, endDate, spotsNeeded, impactMetric, skillIds } = req.body;

      const opp = await prisma.opportunity.create({
        data: {
          orgId: orgProfile.id,
          title,
          description,
          locationType,
          location,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          spotsNeeded: spotsNeeded ?? 1,
          impactMetric,
          requiredSkills: skillIds?.length
            ? { create: skillIds.map((skillId: string) => ({ skill: { connect: { id: skillId } } })) }
            : undefined,
        },
        include: oppInclude,
      });

      sendCreated(res, opp, 'Opportunity created');
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, locationType, skillId, search, page = '1', limit = '20' } = req.query as Record<string, string>;
      const take = Math.min(parseInt(limit), 100);
      const skip = (parseInt(page) - 1) * take;

      const where: any = { status: status ?? OpportunityStatus.ACTIVE };
      if (locationType) where.locationType = locationType;
      if (search) where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
      if (skillId) where.requiredSkills = { some: { skillId } };

      const [total, opportunities] = await Promise.all([
        prisma.opportunity.count({ where }),
        prisma.opportunity.findMany({ where, include: oppInclude, orderBy: { createdAt: 'desc' }, take, skip }),
      ]);

      sendSuccess(res, opportunities, 'Opportunities fetched', 200, {
        total, page: parseInt(page), limit: take, pages: Math.ceil(total / take),
      });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const opp = await prisma.opportunity.findUnique({ where: { id: req.params.id }, include: oppInclude });
      if (!opp) return sendNotFound(res, 'Opportunity not found');
      sendSuccess(res, opp);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const opp = await prisma.opportunity.findUnique({
        where: { id: req.params.id },
        include: { org: true },
      });
      if (!opp) return sendNotFound(res, 'Opportunity not found');
      if (opp.org.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
        return sendForbidden(res, 'You do not own this opportunity');
      }

      const { title, description, locationType, location, startDate, endDate, spotsNeeded, status, impactMetric, skillIds } = req.body;

      if (skillIds !== undefined) {
        await prisma.opportunitySkill.deleteMany({ where: { opportunityId: opp.id } });
        if (skillIds.length > 0) {
          await prisma.opportunitySkill.createMany({
            data: skillIds.map((skillId: string) => ({ opportunityId: opp.id, skillId })),
            skipDuplicates: true,
          });
        }
      }

      const updated = await prisma.opportunity.update({
        where: { id: req.params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(locationType !== undefined && { locationType }),
          ...(location !== undefined && { location }),
          ...(startDate !== undefined && { startDate: new Date(startDate) }),
          ...(endDate !== undefined && { endDate: new Date(endDate) }),
          ...(spotsNeeded !== undefined && { spotsNeeded }),
          ...(status !== undefined && { status }),
          ...(impactMetric !== undefined && { impactMetric }),
        },
        include: oppInclude,
      });

      sendSuccess(res, updated, 'Opportunity updated');
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const opp = await prisma.opportunity.findUnique({ where: { id: req.params.id }, include: { org: true } });
      if (!opp) return sendNotFound(res, 'Opportunity not found');
      if (opp.org.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
        return sendForbidden(res);
      }
      await prisma.opportunity.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, 'Opportunity deleted');
    } catch (err) { next(err); }
  },

  async getMyOpportunities(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await prisma.organizationProfile.findUnique({ where: { userId: req.user!.userId } });
      if (!org) throw new AppError('Organization profile not found', 404);
      const opps = await prisma.opportunity.findMany({
        where: { orgId: org.id },
        include: oppInclude,
        orderBy: { createdAt: 'desc' },
      });
      sendSuccess(res, opps);
    } catch (err) { next(err); }
  },
};
