import api from './api';

export interface Activity {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  endDate?: string;
  location: string;
  maxParticipants: number;
  availableSlots: number;
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  tags: string[];
  imageUrl?: string;
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

export const activityService = {
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
  getActivity: async (id: string): Promise<Activity> => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  // Create new activity (faculty only)
  createActivity: async (data: Partial<Activity>): Promise<Activity> => {
    const response = await api.post('/activities', data);
    return response.data;
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
