import api from './api';

export interface Activity {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  availableSlots: number;
  department: string;
  posterImage?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    department?: string;
  };
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFilters {
  category?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  myActivities?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface CreateActivityData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  department: string;
  category: string;
  posterImage?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
}

export const activityService = {
  // Create new activity (faculty only)
  createActivity: async (data: CreateActivityData): Promise<{ message: string; activity: Activity }> => {
    const response = await api.post('/activities', data);
    return response.data;
  },

  // Get all activities with filters
  getActivities: async (filters?: ActivityFilters): Promise<PaginatedResponse<Activity>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await api.get(`/activities?${params.toString()}`);
    return response.data;
  },

  // Get single activity by ID
  getActivity: async (id: string): Promise<{ activity: Activity; isEnrolled: boolean }> => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  // Get single activity by ID (simplified)
  getActivityById: async (id: string): Promise<Activity> => {
    const response = await api.get(`/activities/${id}`);
    return response.data.activity;
  },

  // Update activity (faculty only)
  updateActivity: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  },

  // Delete activity (faculty only)
  deleteActivity: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },

  // Enroll in activity (student only)
  enrollActivity: async (id: string): Promise<{ message: string }> => {
    const response = await api.post(`/activities/${id}/enroll`);
    return response.data;
  },

  // Cancel enrollment (student only)
  cancelEnrollment: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/activities/${id}/enroll`);
    return response.data;
  },

  // Get participants of an activity (faculty only)
  getParticipants: async (id: string) => {
    const response = await api.get(`/activities/${id}/participants`);
    return response.data;
  },

  // Export participants as CSV (faculty only)
  exportParticipants: async (id: string): Promise<Blob> => {
    const response = await api.get(`/activities/${id}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
