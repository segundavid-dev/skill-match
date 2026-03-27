import api from './axios';
import type {
    Opportunity,
    CreateOpportunityPayload,
    ApiResponse,
    PaginatedResponse,
} from '../types';

export const opportunityApi = {
    /** Public — list all active opportunities */
    list: (params?: { page?: number; limit?: number; search?: string; locationType?: string; skillId?: string }) =>
        api.get<PaginatedResponse<Opportunity>>('/opportunities', { params }),

    /** Public — get a single opportunity by id */
    getById: (id: string) =>
        api.get<ApiResponse<Opportunity>>(`/opportunities/${id}`),

    /** Org only — list my posted opportunities */
    getMyOpportunities: () =>
        api.get<ApiResponse<Opportunity[]>>('/opportunities/me/list'),

    /** Org only — create a new opportunity */
    create: (payload: CreateOpportunityPayload) =>
        api.post<ApiResponse<Opportunity>>('/opportunities', payload),

    /** Org only — update an opportunity */
    update: (id: string, payload: Partial<CreateOpportunityPayload>) =>
        api.put<ApiResponse<Opportunity>>(`/opportunities/${id}`, payload),

    /** Delete an opportunity */
    remove: (id: string) =>
        api.delete(`/opportunities/${id}`),

    /** Org only — get applicants (matched volunteers) for an opportunity */
    getApplicants: (id: string) =>
        api.get<ApiResponse<{ opportunity: Opportunity; matches: any[] }>>(`/opportunities/${id}/applicants`),
};
