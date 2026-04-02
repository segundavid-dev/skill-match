import { SwipeDirection, MatchStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { calculateMatchScore } from './matching.service';
import { sendEmail, emailTemplates } from '../utils/email';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface SwipeResult {
  swiped: boolean;
  direction: SwipeDirection;
  isMutualMatch: boolean;
  match?: {
    id: string;
    matchScore: number;
    explanation: string;
    chatRoomId?: string;
  };
}

export const swipeService = {
  /**
   * Record a volunteer swiping on an opportunity.
   * If the org has also expressed interest (via a RIGHT swipe on this volunteer),
   * or if it's a volunteer-initiated RIGHT swipe, create / update the Match record.
   * Returns whether a mutual match occurred.
   */
  async swipeOnOpportunity(
    userId: string,
    volunteerId: string,
    opportunityId: string,
    direction: SwipeDirection
  ): Promise<SwipeResult> {
    // Check opportunity exists
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { org: { include: { user: true } } },
    });
    if (!opportunity) throw new AppError('Opportunity not found', 404);

    // Idempotent swipe upsert
    await prisma.swipe.upsert({
      where: { userId_opportunityId_volunteerId: { userId, opportunityId, volunteerId } },
      update: { direction },
      create: { userId, volunteerId, opportunityId, direction },
    });

    if (direction === SwipeDirection.LEFT) {
      return { swiped: true, direction, isMutualMatch: false };
    }

    // RIGHT swipe — calculate score and upsert match
    const scoreData = await calculateMatchScore(volunteerId, opportunityId);

    const match = await prisma.match.upsert({
      where: { volunteerId_opportunityId: { volunteerId, opportunityId } },
      update: {
        matchScore: scoreData.total,
        scoreBreakdown: scoreData as any,
        status: MatchStatus.PENDING,
      },
      create: {
        volunteerId,
        opportunityId,
        matchScore: scoreData.total,
        scoreBreakdown: scoreData as any,
        status: MatchStatus.PENDING,
      },
    });

    // Check if org has already swiped RIGHT on this volunteer
    // (Org-side swiping is recorded as userId = org user, volunteerId = volunteer)
    const orgRightSwipe = await prisma.swipe.findFirst({
      where: {
        userId: opportunity.org.userId,
        volunteerId,
        direction: SwipeDirection.RIGHT,
      },
    });

    if (!orgRightSwipe) {
      return { swiped: true, direction, isMutualMatch: false };
    }

    // ── Mutual match! ─────────────────────────────────────────────────────
    const [updatedMatch] = await prisma.$transaction([
      prisma.match.update({
        where: { id: match.id },
        data: { status: MatchStatus.MUTUAL },
      }),
      prisma.opportunity.update({
        where: { id: opportunityId },
        data: { spotsFilled: { increment: 1 } },
      }),
    ]);

    // Create chat room for this match
    let chatRoomId: string | undefined;
    try {
      const existingRoom = await prisma.chatRoom.findUnique({ where: { matchId: match.id } });
      if (!existingRoom) {
        const room = await prisma.chatRoom.create({
          data: {
            matchId: match.id,
            participants: {
              create: [{ userId }, { userId: opportunity.org.userId }],
            },
          },
        });
        chatRoomId = room.id;
      } else {
        chatRoomId = existingRoom.id;
      }
    } catch (e) {
      logger.error('Chat room creation failed', { e });
    }

    // Send match notification email (non-blocking)
    const volUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { volunteerProfile: true },
    });
    if (volUser?.volunteerProfile) {
      const template = emailTemplates.newMatch(
        volUser.volunteerProfile.fullName,
        opportunity.org.name,
        opportunity.title,
        env.clientUrl
      );
      sendEmail({ to: volUser.email, ...template }).catch((e) =>
        logger.error('Match email failed', { e })
      );
    }

    return {
      swiped: true,
      direction,
      isMutualMatch: true,
      match: {
        id: updatedMatch.id,
        matchScore: updatedMatch.matchScore,
        explanation: scoreData.explanation,
        chatRoomId,
      },
    };
  },

  /**
   * Org swipes RIGHT on a volunteer for one of their opportunities.
   * Checks for mutual match in the same way.
   */
  async orgSwipeOnVolunteer(
    orgUserId: string,
    volunteerId: string,
    opportunityId: string,
    direction: SwipeDirection
  ): Promise<SwipeResult> {
    const volunteer = await prisma.volunteerProfile.findUnique({ where: { id: volunteerId } });
    if (!volunteer) throw new AppError('Volunteer not found', 404);

    await prisma.swipe.upsert({
      where: {
        userId_opportunityId_volunteerId: { userId: orgUserId, opportunityId, volunteerId },
      },
      update: { direction },
      create: { userId: orgUserId, volunteerId, opportunityId, direction },
    });

    if (direction === SwipeDirection.LEFT) {
      return { swiped: true, direction, isMutualMatch: false };
    }

    // Check if volunteer already swiped RIGHT
    const volunteerSwipe = await prisma.swipe.findFirst({
      where: {
        userId: volunteer.userId,
        opportunityId,
        direction: SwipeDirection.RIGHT,
      },
    });

    if (!volunteerSwipe) {
      return { swiped: true, direction, isMutualMatch: false };
    }

    // Both swiped right — update match to MUTUAL
    const match = await prisma.match.findUnique({
      where: { volunteerId_opportunityId: { volunteerId, opportunityId } },
    });

    if (!match) return { swiped: true, direction, isMutualMatch: false };

    const [updatedMatch] = await prisma.$transaction([
      prisma.match.update({
        where: { id: match.id },
        data: { status: MatchStatus.MUTUAL },
      }),
      prisma.opportunity.update({
        where: { id: opportunityId },
        data: { spotsFilled: { increment: 1 } },
      }),
    ]);

    let chatRoomId: string | undefined;
    try {
      const room = await prisma.chatRoom.upsert({
        where: { matchId: match.id },
        update: {},
        create: {
          matchId: match.id,
          participants: {
            create: [{ userId: volunteer.userId }, { userId: orgUserId }],
          },
        },
      });
      chatRoomId = room.id;
    } catch (e) {
      logger.error('Chat room upsert failed', { e });
    }

    return {
      swiped: true,
      direction,
      isMutualMatch: true,
      match: {
        id: updatedMatch.id,
        matchScore: updatedMatch.matchScore,
        explanation: 'Mutual interest confirmed!',
        chatRoomId,
      },
    };
  },
};
