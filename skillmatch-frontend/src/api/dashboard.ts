import api from './axios';
import type {
    VolunteerDashboard,
    OrgDashboard,
    Participation,
    SubmitRatingPayload,
    Rating,
    Skill,
    ApiResponse,
    HealthCheck,
} from '../types';

export const dashboardApi = {
    volunteer: () =>
        api.get<ApiResponse<VolunteerDashboard>>('/dashboard/volunteer'),

    org: () =>
        api.get<ApiResponse<OrgDashboard>>('/dashboard/org'),
};

export const participationApi = {
    confirm: (opportunityId: string) =>
        api.post<ApiResponse<Participation>>('/participation/confirm', { opportunityId }),

    getMine: () =>
        api.get<ApiResponse<Participation[]>>('/participation/mine'),

    markComplete: (id: string) =>
        api.patch<ApiResponse<Participation>>(`/participation/${id}/complete`),
};

export const ratingApi = {
    submit: (payload: SubmitRatingPayload) =>
        api.post<ApiResponse<Rating>>('/rating/submit', payload),

    getForProfile: (id: string) =>
        api.get<ApiResponse<Rating[]>>(`/rating/profiles/${id}`),

    getSkills: () =>
        api.get<ApiResponse<Skill[]>>('/rating/skills'),
};

export const healthApi = {
    check: () =>
        api.get<HealthCheck>('/health', { baseURL: import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000' }),
};
