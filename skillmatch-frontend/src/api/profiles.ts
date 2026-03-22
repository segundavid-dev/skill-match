import api from './axios';
import type {
    VolunteerProfile,
    OrganizationProfile,
    CreateVolunteerProfilePayload,
    CreateOrgProfilePayload,
    ApiResponse,
} from '../types';

export const volunteerApi = {
    getMyProfile: () =>
        api.get<ApiResponse<VolunteerProfile>>('/volunteer/profile'),

    createProfile: (payload: CreateVolunteerProfilePayload) =>
        api.post<ApiResponse<VolunteerProfile>>('/volunteer/profile', payload),

    updateProfile: (payload: Partial<CreateVolunteerProfilePayload>) =>
        api.put<ApiResponse<VolunteerProfile>>('/volunteer/profile', payload),

    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.post<ApiResponse<{ avatar: string }>>('/volunteer/profile/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    getProfileById: (id: string) =>
        api.get<ApiResponse<VolunteerProfile>>(`/volunteer/profile/${id}`),

    getRatings: (id: string) =>
        api.get(`/volunteer/profile/${id}/ratings`),
};

export const orgApi = {
    getMyProfile: () =>
        api.get<ApiResponse<OrganizationProfile>>('/org/profile'),

    createProfile: (payload: CreateOrgProfilePayload) =>
        api.post<ApiResponse<OrganizationProfile>>('/org/profile', payload),

    updateProfile: (payload: Partial<CreateOrgProfilePayload>) =>
        api.put<ApiResponse<OrganizationProfile>>('/org/profile', payload),

    uploadLogo: (file: File) => {
        const formData = new FormData();
        formData.append('logo', file);
        return api.post<ApiResponse<{ logo: string }>>('/org/profile/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    getProfileById: (id: string) =>
        api.get<ApiResponse<OrganizationProfile>>(`/org/profile/${id}`),
};
