import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest } from '../utils/response';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/upload';
import { AppError } from '../middleware/errorHandler';

const orgSelect = {
  id: true,
  name: true,
  logo: true,
  mission: true,
  website: true,
  location: true,
  causeTags: true,
  verifiedBadge: true,
  createdAt: true,
  user: { select: { email: true } },
  _count: { select: { opportunities: true } },
};

export const orgController = {
  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const existing = await prisma.organizationProfile.findUnique({ where: { userId } });
      if (existing) throw new AppError('Organization profile already exists', 409);

      const { name, mission, website, location, causeTags } = req.body;

      const profile = await prisma.organizationProfile.create({
        data: { userId, name, mission, website, location, causeTags: causeTags ?? [] },
        select: orgSelect,
      });

      sendCreated(res, profile, 'Organization profile created');
    } catch (err) { next(err); }
  },

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await prisma.organizationProfile.findUnique({
        where: { userId: req.user!.userId },
        select: orgSelect,
      });
      if (!profile) throw new AppError('Organization profile not found', 404);
      sendSuccess(res, profile);
    } catch (err) { next(err); }
  },

  async getProfileById(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await prisma.organizationProfile.findUnique({
        where: { id: req.params.id },
        select: orgSelect,
      });
      if (!profile) return sendNotFound(res);
      sendSuccess(res, profile);
    } catch (err) { next(err); }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, mission, website, location, causeTags } = req.body;
      const updated = await prisma.organizationProfile.update({
        where: { userId: req.user!.userId },
        data: {
          ...(name !== undefined && { name }),
          ...(mission !== undefined && { mission }),
          ...(website !== undefined && { website }),
          ...(location !== undefined && { location }),
          ...(causeTags !== undefined && { causeTags }),
        },
        select: orgSelect,
      });
      sendSuccess(res, updated, 'Profile updated');
    } catch (err) { next(err); }
  },

  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) return sendBadRequest(res, 'No image file provided');

      const profile = await prisma.organizationProfile.findUnique({ where: { userId: req.user!.userId } });
      if (!profile) throw new AppError('Organization profile not found', 404);

      if (profile.logoPublicId) await deleteFromCloudinary(profile.logoPublicId).catch(() => {});

      const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'logos', `org_${profile.id}`);

      const updated = await prisma.organizationProfile.update({
        where: { userId: req.user!.userId },
        data: { logo: url, logoPublicId: publicId },
        select: { id: true, logo: true },
      });

      sendSuccess(res, updated, 'Logo uploaded');
    } catch (err) { next(err); }
  },
};
