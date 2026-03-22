/* ─────────────────────────────────────────────────────────────────────────────
 * API barrel export — single import point for all API services
 * Usage: import { authApi, opportunityApi } from '@/api';
 * ──────────────────────────────────────────────────────────────────────────── */

export { default as api } from './axios';
export { authApi } from './auth';
export { opportunityApi } from './opportunities';
export { volunteerApi, orgApi } from './profiles';
export { swipeApi } from './swipe';
export { chatApi } from './chat';
export { dashboardApi, participationApi, ratingApi, healthApi } from './dashboard';
