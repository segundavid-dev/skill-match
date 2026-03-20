import { prisma } from '../config/prisma';

export interface ScoreBreakdown {
  skillOverlap: number;
  availability: number;
  location: number;
  pastRatings: number;
  total: number;
  explanation: string;
  matchedSkills: string[];
}

/**
 * Calculate how well a volunteer matches a given opportunity.
 *
 * Weights:
 *   Skill overlap   80 %
 *   Availability    10 %
 *   Location         5 %
 *   Past ratings     5 %
 */
export async function calculateMatchScore(
  volunteerId: string,
  opportunityId: string
): Promise<ScoreBreakdown> {
  const [volunteer, opportunity] = await Promise.all([
    prisma.volunteerProfile.findUnique({
      where: { id: volunteerId },
      include: {
        skills: { include: { skill: true } },
        ratingsGiven: true,
        user: { include: { ratingsReceived: true } },
      },
    }),
    prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        requiredSkills: { include: { skill: true } },
        org: true,
      },
    }),
  ]);

  if (!volunteer || !opportunity) {
    return { skillOverlap: 0, availability: 0, location: 0, pastRatings: 0, total: 0, explanation: 'Profiles not found', matchedSkills: [] };
  }

  // ── 1. Skill overlap (80 %) ──────────────────────────────────────────────
  const volunteerSkillNames = new Set(volunteer.skills.map((vs) => vs.skill.name.toLowerCase()));
  const requiredSkillNames = opportunity.requiredSkills.map((os) => os.skill.name.toLowerCase());
  const matchedSkillNames = requiredSkillNames.filter((s) => volunteerSkillNames.has(s));

  const skillScore =
    requiredSkillNames.length === 0
      ? 100
      : Math.round((matchedSkillNames.length / requiredSkillNames.length) * 100);

  // ── 2. Availability (10 %) ───────────────────────────────────────────────
  const hasFlexible = volunteer.availability.includes('flexible');
  const availScore = hasFlexible ? 100 : volunteer.availability.length > 0 ? 70 : 30;

  // ── 3. Location match (5 %) ──────────────────────────────────────────────
  let locationScore = 50;
  if (opportunity.locationType === 'REMOTE') {
    locationScore = 100;
  } else if (
    volunteer.location &&
    opportunity.location &&
    volunteer.location.toLowerCase().includes(opportunity.location.split(',')[0].toLowerCase())
  ) {
    locationScore = 100;
  } else if (volunteer.location) {
    locationScore = 40;
  }

  // ── 4. Past ratings (5 %) ────────────────────────────────────────────────
  const ratings = volunteer.user.ratingsReceived;
  const avgRating =
    ratings.length === 0
      ? 75
      : (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length) * 20;
  const ratingScore = Math.min(100, Math.round(avgRating));

  // ── Weighted total ───────────────────────────────────────────────────────
  const total = Math.round(
    skillScore * 0.8 + availScore * 0.1 + locationScore * 0.05 + ratingScore * 0.05
  );

  // ── Human-readable explanation ───────────────────────────────────────────
  const matchedDisplay = matchedSkillNames
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' + ');

  let explanation = '';
  if (total >= 90) explanation = `Exceptional match — ${matchedDisplay || 'strong profile'} are exactly what this org needs`;
  else if (total >= 75) explanation = `Great fit — shared skills in ${matchedDisplay || 'multiple areas'} and compatible availability`;
  else if (total >= 60) explanation = `Good potential — ${matchedDisplay ? `${matchedDisplay} overlap` : 'some alignment'} with this opportunity`;
  else explanation = `Partial match — you bring relevant experience, but there are some gaps`;

  return {
    skillOverlap: skillScore,
    availability: availScore,
    location: locationScore,
    pastRatings: ratingScore,
    total,
    explanation,
    matchedSkills: matchedSkillNames.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  };
}

/**
 * Build a ranked feed of opportunities for a volunteer.
 * Returns up to `limit` unswiped opportunities sorted by match score desc.
 */
export async function buildFeedForVolunteer(
  volunteerId: string,
  userId: string,
  limit = 10
): Promise<Array<{ opportunityId: string; score: ScoreBreakdown }>> {
  // Opportunities the volunteer already swiped
  const swiped = await prisma.swipe.findMany({
    where: { userId },
    select: { opportunityId: true },
  });
  const swipedIds = swiped.map((s) => s.opportunityId).filter(Boolean) as string[];

  // Active opportunities not yet swiped
  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: 'ACTIVE',
      id: { notIn: swipedIds },
    },
    select: { id: true },
    take: limit * 3, // over-fetch, then rank
  });

  // Score all candidates in parallel
  const scored = await Promise.all(
    opportunities.map(async (opp) => ({
      opportunityId: opp.id,
      score: await calculateMatchScore(volunteerId, opp.id),
    }))
  );

  return scored.sort((a, b) => b.score.total - a.score.total).slice(0, limit);
}
