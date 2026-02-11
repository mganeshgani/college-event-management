import api from './api';

export interface DashboardStats {
  totalActivities?: number;
  publishedActivities?: number;
  totalEnrollments?: number;
  totalParticipants?: number;
  upcomingActivities?: number;
  enrolledActivities?: number;
  completedActivities?: number;
  availableActivities?: number;
}

export interface UserActivity {
  _id: string;
  activityId: {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    category: string;
    posterImage?: string;
    status: string;
  };
  userId: string;
  status: 'enrolled' | 'waitlisted' | 'cancelled';
  enrolledAt: string;
}

export const dashboardService = {
  // Get student dashboard stats
  getStudentStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/student');
    return response.data;
  },

  // Get faculty dashboard stats
  getFacultyStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/faculty');
    return response.data;
  },

  // Get admin dashboard stats
  getAdminStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  // Get user's enrolled activities
  getMyActivities: async (): Promise<UserActivity[]> => {
    const response = await api.get('/activities/my/enrollments');
    return response.data.enrollments || [];
  },

  // Get recommended activities for student
  getRecommendations: async (): Promise<any[]> => {
    const response = await api.get('/dashboard/recommendations');
    return response.data;
  },
};
