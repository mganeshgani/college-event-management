import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import { act } from '@testing-library/react';

// Mock api module
vi.mock('@/services/api', () => {
  const mockApi = {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { default: mockApi };
});

// Mock authService
vi.mock('@/services/authService', () => ({
  authService: {
    updateProfile: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import mocked modules
import api from '@/services/api';
import { authService } from '@/services/authService';

const mockApi = api as unknown as { post: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> };

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset Zustand store state
    act(() => {
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
      });
    });
    vi.clearAllMocks();
  });

  // ─── INITIAL STATE ─────────────────────────────────────────
  describe('initial state', () => {
    it('starts with no user', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  // ─── LOGIN ──────────────────────────────────────────────────
  describe('login', () => {
    it('sets user and tokens on successful login', async () => {
      const mockUser = { id: '1', email: 'test@test.com', name: 'Test', role: 'student' };
      mockApi.post.mockResolvedValueOnce({
        data: { user: mockUser, accessToken: 'access123', refreshToken: 'refresh123' },
      });

      const user = await useAuthStore.getState().login('test@test.com', 'Test1234');

      expect(user).toEqual(mockUser);
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('access123');
      expect(state.refreshToken).toBe('refresh123');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('sets isLoading during login', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => { resolvePromise = resolve; });
      mockApi.post.mockReturnValueOnce(promise);

      const loginPromise = useAuthStore.getState().login('t@t.com', 'pass');

      expect(useAuthStore.getState().isLoading).toBe(true);

      resolvePromise!({
        data: { user: { id: '1', email: 't@t.com', name: 'T', role: 'student' }, accessToken: 'a', refreshToken: 'r' },
      });
      await loginPromise;

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('throws and resets isLoading on login failure', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(
        useAuthStore.getState().login('bad@test.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');

      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  // ─── REGISTER ───────────────────────────────────────────────
  describe('register', () => {
    it('sets user on successful registration', async () => {
      const mockUser = { id: '2', email: 'new@test.com', name: 'New User', role: 'student' };
      mockApi.post.mockResolvedValueOnce({
        data: { user: mockUser, accessToken: 'at', refreshToken: 'rt' },
      });

      const user = await useAuthStore.getState().register({
        email: 'new@test.com',
        password: 'Strong123',
        name: 'New User',
        role: 'student',
      });

      expect(user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('resets isLoading on registration failure', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Email exists'));

      await expect(
        useAuthStore.getState().register({
          email: 'dup@test.com',
          password: 'Strong123',
          name: 'Dup',
          role: 'student',
        })
      ).rejects.toThrow('Email exists');

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  // ─── LOGOUT ─────────────────────────────────────────────────
  describe('logout', () => {
    it('clears all auth state', () => {
      // Pre-mock the post to return a promise
      mockApi.post.mockResolvedValue({});
      
      // Set up authenticated state
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'a@a.com', name: 'A', role: 'student' },
          accessToken: 'token',
          refreshToken: 'rtoken',
          isAuthenticated: true,
        });
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('calls API logout endpoint', () => {
      mockApi.post.mockResolvedValue({});
      
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'a@a.com', name: 'A', role: 'student' },
          accessToken: 'token',
          refreshToken: 'rtoken',
          isAuthenticated: true,
        });
      });

      useAuthStore.getState().logout();

      expect(mockApi.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'rtoken' });
    });
  });

  // ─── REFRESH ────────────────────────────────────────────────
  describe('refreshAccessToken', () => {
    it('updates access token on success', async () => {
      act(() => {
        useAuthStore.setState({ refreshToken: 'validRefresh', isAuthenticated: true });
      });
      mockApi.post.mockResolvedValueOnce({ data: { accessToken: 'newAccess' } });

      const token = await useAuthStore.getState().refreshAccessToken();

      expect(token).toBe('newAccess');
      expect(useAuthStore.getState().accessToken).toBe('newAccess');
    });

    it('clears auth state on refresh failure', async () => {
      act(() => {
        useAuthStore.setState({
          refreshToken: 'expired',
          isAuthenticated: true,
          user: { id: '1', email: 'a@a.com', name: 'A', role: 'student' },
        });
      });
      mockApi.post.mockRejectedValueOnce(new Error('expired'));

      await expect(useAuthStore.getState().refreshAccessToken()).rejects.toThrow();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('throws without refresh token', async () => {
      await expect(useAuthStore.getState().refreshAccessToken()).rejects.toThrow('No refresh token');
    });
  });

  // ─── UPDATE USER ────────────────────────────────────────────
  describe('updateUser', () => {
    it('updates user in store', async () => {
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'a@a.com', name: 'Old', role: 'student' },
          isAuthenticated: true,
        });
      });

      const updatedUser = { id: '1', email: 'a@a.com', name: 'Updated', role: 'student' };
      (authService.updateProfile as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ user: updatedUser });

      await useAuthStore.getState().updateUser({ name: 'Updated' });

      expect(useAuthStore.getState().user!.name).toBe('Updated');
    });
  });

  // ─── REDIRECT PATH ─────────────────────────────────────────
  describe('getRedirectPath', () => {
    it('returns /login when no user', () => {
      expect(useAuthStore.getState().getRedirectPath()).toBe('/login');
    });

    it('returns /dashboard for students', () => {
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'a@a.com', name: 'A', role: 'student' },
        });
      });
      expect(useAuthStore.getState().getRedirectPath()).toBe('/dashboard');
    });

    it('returns /faculty/dashboard for faculty', () => {
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'a@a.com', name: 'A', role: 'faculty' },
        });
      });
      expect(useAuthStore.getState().getRedirectPath()).toBe('/faculty/dashboard');
    });

    it('returns /admin/dashboard for admin', () => {
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'a@a.com', name: 'A', role: 'admin' },
        });
      });
      expect(useAuthStore.getState().getRedirectPath()).toBe('/admin/dashboard');
    });
  });

  // ─── INITIALIZE ─────────────────────────────────────────────
  describe('initialize', () => {
    it('sets isInitialized to true', () => {
      expect(useAuthStore.getState().isInitialized).toBe(false);
      useAuthStore.getState().initialize();
      expect(useAuthStore.getState().isInitialized).toBe(true);
    });
  });
});
