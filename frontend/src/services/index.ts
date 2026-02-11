export { authService } from './authService';
export { activityService } from './activityService';
export { dashboardService } from './dashboardService';
export { default as api, handleApiError } from './api';

export type { LoginCredentials, RegisterData, AuthResponse } from './authService';
export type { Activity, ActivityFilters, PaginatedResponse } from './activityService';
export type { DashboardStats, UserActivity } from './dashboardService';
