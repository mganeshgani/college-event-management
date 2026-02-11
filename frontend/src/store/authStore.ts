import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  rollNumber?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  initialize: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'faculty';
  department?: string;
  rollNumber?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
          });

          const { user, accessToken, refreshToken } = response.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          toast.success(`Welcome back, ${user.name}!`);
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Login failed';
          toast.error(message);
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true });
          const response = await axios.post(`${API_URL}/auth/register`, data);

          const { user, accessToken, refreshToken } = response.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          toast.success(`Account created successfully! Welcome, ${user.name}!`);
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Registration failed';
          toast.error(message);
          throw error;
        }
      },

      logout: () => {
        const { refreshToken } = get();

        if (refreshToken) {
          axios
            .post(`${API_URL}/auth/logout`, { refreshToken })
            .catch(() => {
              // Ignore errors during logout
            });
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        delete axios.defaults.headers.common['Authorization'];
        toast.success('Logged out successfully', { duration: 2000 });
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) throw new Error('No refresh token');

          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          set({ accessToken });

          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (error) {
          // If refresh fails, logout
          get().logout();
          throw error;
        }
      },

      initialize: () => {
        const { accessToken } = get();
        if (accessToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // Set up axios interceptor for token refresh
          axios.interceptors.response.use(
            (response) => response,
            async (error) => {
              const originalRequest = error.config;

              if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                  await get().refreshAccessToken();
                  return axios(originalRequest);
                } catch (refreshError) {
                  return Promise.reject(refreshError);
                }
              }

              return Promise.reject(error);
            }
          );
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
