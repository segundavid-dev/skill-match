import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest } from '../utils/response';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/upload';
import { AppError } from '../middleware/errorHandler';

const volunteerSelect = {
  id: true,
  fullName: true,
  avatar: true,
  bio: true,
  location: true,
  availability: true,
  causes: true,
  impactScore: true,
  createdAt: true,
  skills: { include: { skill: { select: { id: true, name: true, category: true } } } },
  user: { select: { email: true, verified: true } },
};

export const volunteerController = {
  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const existing = await prisma.volunteerProfile.findUnique({ where: { userId } });
      if (existing) throw new AppError('Profile already exists. Use PUT to update.', 409);

      const { fullName, bio, location, availability, causes, skillIds } = req.body;

      const profile = await prisma.volunteerProfile.create({
        data: {
          userId,
          fullName,
          bio,
          location,
          availability: availability ?? [],
          causes: causes ?? [],
          skills: skillIds?.length
            ? { create: skillIds.map((skillId: string) => ({ skill: { connect: { id: skillId } } })) }
            : undefined,
        },
        select: volunteerSelect,
      });

      sendCreated(res, profile, 'Volunteer profile created');
    } catch (err) { next(err); }
  },

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await prisma.volunteerProfile.findUnique({ where: { userId }, select: volunteerSelect });
      if (!profile) throw new AppError('Profile not found. Please complete onboarding.', 404);
      sendSuccess(res, profile);
    } catch (err) { next(err); }
  },

  async getProfileById(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await prisma.volunteerProfile.findUnique({
        where: { id: req.params.id },
        select: volunteerSelect,
      });
      if (!profile) return sendNotFound(res);
      sendSuccess(res, profile);
    } catch (err) { next(err); }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { fullName, bio, location, availability, causes, skillIds } = req.body;

      const profile = await prisma.volunteerProfile.findUnique({ where: { userId } });
      if (!profile) throw new AppError('Profile not found', 404);

      // Update skills: replace all
      if (skillIds !== undefined) {
        await prisma.volunteerSkill.deleteMany({ where: { volunteerId: profile.id } });
        if (skillIds.length > 0) {
          await prisma.volunteerSkill.createMany({
            data: skillIds.map((skillId: string) => ({ volunteerId: profile.id, skillId })),
            skipDuplicates: true,
          });
        }
      }

      const updated = await prisma.volunteerProfile.update({
        where: { userId },
        data: {
          ...(fullName !== undefined && { fullName }),
          ...(bio !== undefined && { bio }),
          ...(location !== undefined && { location }),
          ...(availability !== undefined && { availability }),
          ...(causes !== undefined && { causes }),
        },
        select: volunteerSelect,
      });

      sendSuccess(res, updated, 'Profile updated');
    } catch (err) { next(err); }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) return sendBadRequest(res, 'No image file provided');

      const userId = req.user!.userId;
      const profile = await prisma.volunteerProfile.findUnique({ where: { userId } });
      if (!profile) throw new AppError('Profile not found', 404);

      // Delete old avatar from Cloudinary
      if (profile.avatarPublicId) {
        await deleteFromCloudinary(profile.avatarPublicId).catch(() => {});
      }

      const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'avatars', `vol_${profile.id}`);

      const updated = await prisma.volunteerProfile.update({
        where: { userId },
        data: { avatar: url, avatarPublicId: publicId },
        select: { id: true, avatar: true },
      });

      sendSuccess(res, updated, 'Avatar uploaded');
    } catch (err) { next(err); }
  },

  async getRatings(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await prisma.volunteerProfile.findUnique({ where: { id: req.params.id } });
      if (!profile) return sendNotFound(res);

      const ratings = await prisma.rating.findMany({
        where: { toUserId: profile.userId },
        include: { fromUser: { select: { orgProfile: { select: { name: true, logo: true } } } } },
        orderBy: { createdAt: 'desc' },
      });

      const avg = ratings.length
        ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
        : 0;

      sendSuccess(res, { ratings, averageRating: Math.round(avg * 10) / 10, count: ratings.length });
    } catch (err) { next(err); }
  },
};
