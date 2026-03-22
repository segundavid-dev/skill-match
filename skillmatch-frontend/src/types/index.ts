/* ─────────────────────────────────────────────────────────────────────────────
 * SkillMatch — Shared TypeScript types
 * Mirrors the backend Prisma schema for full-stack type safety.
 * ──────────────────────────────────────────────────────────────────────────── */

// ── Enums ──────────────────────────────────────────────────────────────────

export type Role = 'VOLUNTEER' | 'ORGANIZATION' | 'ADMIN';
export type SwipeDirection = 'LEFT' | 'RIGHT';
export type MatchStatus = 'PENDING' | 'MUTUAL' | 'ACCEPTED' | 'REJECTED';
export type LocationType = 'REMOTE' | 'IN_PERSON' | 'HYBRID';
export type OpportunityStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'FILLED';
export type ParticipationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type Availability = 'weekdays' | 'weekends' | 'evenings' | 'flexible';

// ── Auth ───────────────────────────────────────────────────────────────────

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    role: 'VOLUNTEER' | 'ORGANIZATION';
}

export interface AuthResponse {
    success: boolean;
    user: User;
    tokens: AuthTokens;
}

// ── User ───────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    email: string;
    role: Role;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
    volunteerProfile?: VolunteerProfile;
    orgProfile?: OrganizationProfile;
}

// ── Profiles ───────────────────────────────────────────────────────────────

export interface VolunteerProfile {
    id: string;
    userId: string;
    fullName: string;
    avatar?: string;
    bio?: string;
    location?: string;
    availability: Availability[];
    causes: string[];
    impactScore: number;
    skills?: Skill[];
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationProfile {
    id: string;
    userId: string;
    name: string;
    logo?: string;
    mission?: string;
    website?: string;
    location?: string;
    causeTags: string[];
    verifiedBadge: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVolunteerProfilePayload {
    fullName: string;
    bio?: string;
    location?: string;
    availability?: Availability[];
    causes?: string[];
    skillIds?: string[];
}

export interface CreateOrgProfilePayload {
    name: string;
    mission?: string;
    website?: string;
    location?: string;
    causeTags?: string[];
}

// ── Skills ─────────────────────────────────────────────────────────────────

export interface Skill {
    id: string;
    name: string;
    category?: string;
}

// ── Opportunities ──────────────────────────────────────────────────────────

export interface Opportunity {
    id: string;
    orgId: string;
    org?: OrganizationProfile;
    title: string;
    description: string;
    locationType: LocationType;
    location?: string;
    startDate?: string;
    endDate?: string;
    spotsNeeded: number;
    spotsFilled: number;
    status: OpportunityStatus;
    impactMetric?: string;
    requiredSkills?: Skill[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateOpportunityPayload {
    title: string;
    description: string;
    locationType: LocationType;
    location?: string;
    startDate?: string;
    endDate?: string;
    spotsNeeded?: number;
    impactMetric?: string;
    skillIds?: string[];
}

// ── Swipe & Match ──────────────────────────────────────────────────────────

export interface SwipePayload {
    opportunityId: string;
    volunteerId?: string;
    direction: SwipeDirection;
}

export interface Match {
    id: string;
    volunteerId: string;
    volunteer?: VolunteerProfile;
    opportunityId: string;
    opportunity?: Opportunity;
    status: MatchStatus;
    matchScore: number;
    createdAt: string;
    updatedAt: string;
    chatRoom?: ChatRoom;
}

// ── Chat ───────────────────────────────────────────────────────────────────

export interface ChatRoom {
    id: string;
    matchId: string;
    match?: Match;
    participants?: ChatParticipant[];
    messages?: Message[];
    createdAt: string;
    updatedAt: string;
}

export interface ChatParticipant {
    chatRoomId: string;
    userId: string;
    user?: User;
    joinedAt: string;
}

export interface Message {
    id: string;
    chatRoomId: string;
    senderId: string;
    sender?: User;
    content: string;
    read: boolean;
    createdAt: string;
}

export interface SendMessagePayload {
    content: string;
}

// ── Participation ──────────────────────────────────────────────────────────

export interface Participation {
    id: string;
    volunteerId: string;
    volunteer?: VolunteerProfile;
    opportunityId: string;
    opportunity?: Opportunity;
    status: ParticipationStatus;
    confirmedDate?: string;
    completedDate?: string;
    createdAt: string;
    updatedAt: string;
}

// ── Rating ─────────────────────────────────────────────────────────────────

export interface Rating {
    id: string;
    fromUserId: string;
    toUserId: string;
    stars: number;
    feedback?: string;
    createdAt: string;
}

export interface SubmitRatingPayload {
    toUserId: string;
    stars: number;
    feedback?: string;
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export interface VolunteerDashboard {
    totalMatches: number;
    activeParticipations: number;
    completedHours: number;
    impactScore: number;
    recentMatches: Match[];
    recentParticipations: Participation[];
}

export interface OrgDashboard {
    totalOpportunities: number;
    totalApplications: number;
    activeVolunteers: number;
    completedProjects: number;
    recentOpportunities: Opportunity[];
}

// ── API Response wrappers ──────────────────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// ── Health ──────────────────────────────────────────────────────────────────

export interface HealthCheck {
    success: boolean;
    status: 'healthy' | 'degraded';
    timestamp: string;
    version: string;
    services: {
        database: 'up' | 'down';
        redis: 'up' | 'down';
    };
}
