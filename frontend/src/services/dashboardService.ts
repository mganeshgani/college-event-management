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

export interface AdminDashboardResponse {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalFaculty: number;
    totalActivities: number;
    publishedActivities: number;
    totalEnrollments: number;
  };
  departmentStats: Array<{
    _id: string;
    count: number;
    totalCapacity: number;
    enrolledCount: number;
  }>;
  categoryStats: Array<{
    _id: string;
    count: number;
  }>;
  recentUsers: any[];
  recentActivities: any[];
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
  getAdminStats: async (): Promise<AdminDashboardResponse> => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  // Get user's enrolled activities
  getMyActivities: async (): Promise<UserActivity[]> => {
    const response = await api.get('/activities/my/enrollments');
    return response.data.enrollments || [];
  },

  // Get activity analytics (faculty/admin)
  getActivityAnalytics: async (id: string) => {
    const response = await api.get(`/dashboard/analytics/${id}`);
    return response.data;
  },

  // Admin: Get all users with filters
  getAdminUsers: async (filters?: { role?: string; search?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') params.append(key, String(value));
      });
    }
    const response = await api.get(`/dashboard/admin/users?${params.toString()}`);
    return response.data;
  },

  // Admin: Get all activities across all faculty
  getAdminActivities: async (filters?: { status?: string; category?: string; department?: string; faculty?: string; search?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') params.append(key, String(value));
      });
    }
    const response = await api.get(`/dashboard/admin/activities?${params.toString()}`);
    return response.data;
  },

  // Admin: Update user role
  updateUserRole: async (userId: string, role: 'student' | 'faculty' | 'admin') => {
    const response = await api.patch(`/dashboard/admin/users/${userId}/role`, { role });
    return response.data;
  },
};
