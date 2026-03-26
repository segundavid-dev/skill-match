import api from './axios';
import type {
    SwipePayload,
    Match,
    Opportunity,
    ApiResponse,
} from '../types';

export const swipeApi = {
    /** Submit a swipe (LEFT or RIGHT) */
    swipe: (payload: SwipePayload) =>
        api.post<ApiResponse<{ match?: Match }>>('/swipe', payload),

    /** Get the discovery feed (unswiped opportunities) */
    getFeed: () =>
        api.get<ApiResponse<Opportunity[]>>('/swipe/feed'),

    /** Get all matches for the current user */
    getMatches: () =>
        api.get<ApiResponse<Match[]>>('/swipe/matches'),

    /** Org swipes on a volunteer for an opportunity */
    orgSwipe: (payload: { opportunityId: string; volunteerId: string; direction: 'LEFT' | 'RIGHT' }) =>
        api.post<ApiResponse<{ match?: Match; isMutualMatch?: boolean }>>('/swipe', payload),
};
