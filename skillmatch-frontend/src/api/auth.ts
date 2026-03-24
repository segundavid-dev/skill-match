import api from './axios';
import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    User,
} from '../types';

export const authApi = {
    register: (payload: RegisterPayload) =>
        api.post<AuthResponse>('/auth/register', payload),

    login: (payload: LoginPayload) =>
        api.post<AuthResponse>('/auth/login', payload),

    logout: (refreshToken: string) =>
        api.post('/auth/logout', { refreshToken }),

    refreshToken: (refreshToken: string) =>
        api.post('/auth/refresh-token', { refreshToken }),

    me: () =>
        api.get<{ success: boolean; message: string; data: User }>('/auth/me'),

    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),

    resetPassword: (token: string, password: string) =>
        api.post('/auth/reset-password', { token, password }),
};
