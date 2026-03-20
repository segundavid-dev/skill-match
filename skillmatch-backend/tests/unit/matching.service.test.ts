/**
 * Unit tests for the SkillMatch matching algorithm.
 * These tests mock Prisma so no DB connection is needed.
 */
import { calculateMatchScore } from '../../src/services/matching.service';

// Mock prisma
jest.mock('../../src/config/prisma', () => ({
  prisma: {
    volunteerProfile: {
      findUnique: jest.fn(),
    },
    opportunity: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from '../../src/config/prisma';

const mockVolunteer = {
  id: 'vol_1',
  userId: 'user_1',
  fullName: 'Alex Johnson',
  location: 'Lagos, Nigeria',
  availability: ['weekends', 'evenings'],
  causes: ['Environment'],
  impactScore: 80,
  skills: [
    { skill: { name: 'Coding' } },
    { skill: { name: 'Data Analysis' } },
    { skill: { name: 'Teaching' } },
  ],
  ratingsGiven: [],
  user: {
    ratingsReceived: [
      { stars: 5 },
      { stars: 4 },
      { stars: 5 },
    ],
  },
};

const mockOpportunity = {
  id: 'opp_1',
  title: 'Deforestation Dashboard Developer',
  locationType: 'REMOTE',
  location: null,
  requiredSkills: [
    { skill: { name: 'Coding' } },
    { skill: { name: 'Data Analysis' } },
  ],
  org: { id: 'org_1', name: 'Green Earth Foundation' },
};

describe('calculateMatchScore', () => {
  beforeEach(() => {
    (prisma.volunteerProfile.findUnique as jest.Mock).mockResolvedValue(mockVolunteer);
    (prisma.opportunity.findUnique as jest.Mock).mockResolvedValue(mockOpportunity);
  });

  afterEach(() => jest.clearAllMocks());

  it('returns a high score when skills fully overlap and opportunity is remote', async () => {
    const result = await calculateMatchScore('vol_1', 'opp_1');
    expect(result.total).toBeGreaterThanOrEqual(85);
    expect(result.skillOverlap).toBe(100);
    expect(result.location).toBe(100); // remote
  });

  it('includes matched skill names in result', async () => {
    const result = await calculateMatchScore('vol_1', 'opp_1');
    expect(result.matchedSkills).toContain('Coding');
    expect(result.matchedSkills).toContain('Data Analysis');
  });

  it('returns partial score when only half skills match', async () => {
    (prisma.opportunity.findUnique as jest.Mock).mockResolvedValue({
      ...mockOpportunity,
      requiredSkills: [
        { skill: { name: 'Coding' } },
        { skill: { name: 'Legal Aid' } }, // volunteer doesn't have this
      ],
    });
    const result = await calculateMatchScore('vol_1', 'opp_1');
    expect(result.skillOverlap).toBe(50);
    expect(result.total).toBeLessThan(90);
  });

  it('gives lower location score for in-person opportunity with different city', async () => {
    (prisma.opportunity.findUnique as jest.Mock).mockResolvedValue({
      ...mockOpportunity,
      locationType: 'IN_PERSON',
      location: 'Abuja, Nigeria', // volunteer is in Lagos
    });
    const result = await calculateMatchScore('vol_1', 'opp_1');
    expect(result.location).toBeLessThan(100);
  });

  it('gives full availability score for flexible volunteer', async () => {
    (prisma.volunteerProfile.findUnique as jest.Mock).mockResolvedValue({
      ...mockVolunteer,
      availability: ['flexible'],
    });
    const result = await calculateMatchScore('vol_1', 'opp_1');
    expect(result.availability).toBe(100);
  });

  it('provides a human-readable explanation', async () => {
    const result = await calculateMatchScore('vol_1', 'opp_1');
    expect(result.explanation).toBeTruthy();
    expect(typeof result.explanation).toBe('string');
  });

  it('handles missing profiles gracefully', async () => {
    (prisma.volunteerProfile.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await calculateMatchScore('vol_404', 'opp_1');
    expect(result.total).toBe(0);
  });
});
