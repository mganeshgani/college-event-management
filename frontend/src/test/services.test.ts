import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock api module before importing services
vi.mock('@/services/api', () => {
  const mockApi = {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { default: mockApi };
});

import api from '@/services/api';
import { authService } from '@/services/authService';
import { activityService } from '@/services/activityService';

const mockApi = api as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('Auth Service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('login calls POST /auth/login', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { user: {}, accessToken: 'a', refreshToken: 'r' } });
    await authService.login({ email: 'a@a.com', password: 'pass' });
    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', { email: 'a@a.com', password: 'pass' });
  });

  it('register calls POST /auth/register', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { user: {}, accessToken: 'a', refreshToken: 'r' } });
    await authService.register({ email: 'a@a.com', password: 'p', name: 'N', role: 'student' });
    expect(mockApi.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({ email: 'a@a.com' }));
  });

  it('refresh calls POST /auth/refresh', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { accessToken: 'new' } });
    const res = await authService.refresh('rt');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'rt' });
    expect(res.accessToken).toBe('new');
  });

  it('logout calls POST /auth/logout', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });
    await authService.logout('rt');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'rt' });
  });

  it('getProfile calls GET /auth/profile', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { user: { name: 'A' } } });
    await authService.getProfile();
    expect(mockApi.get).toHaveBeenCalledWith('/auth/profile');
  });

  it('changePassword calls POST /auth/change-password', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });
    await authService.changePassword('old', 'new');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/change-password', { currentPassword: 'old', newPassword: 'new' });
  });

  it('updateProfile calls PATCH /auth/profile', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { user: { name: 'B' } } });
    await authService.updateProfile({ name: 'B' });
    expect(mockApi.patch).toHaveBeenCalledWith('/auth/profile', { name: 'B' });
  });

  it('forgotPassword calls POST /auth/forgot-password', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { message: 'ok' } });
    await authService.forgotPassword('a@a.com');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'a@a.com' });
  });
});

describe('Activity Service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('createActivity calls POST /activities', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { message: 'ok', activity: {} } });
    await activityService.createActivity({
      title: 'T', description: 'D', startDate: '2024-01-01', endDate: '2024-01-02',
      location: 'L', capacity: 10, department: 'CS', category: 'Technical', status: 'draft',
    });
    expect(mockApi.post).toHaveBeenCalledWith('/activities', expect.objectContaining({ title: 'T' }));
  });

  it('getActivities calls GET /activities with filters', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { data: [], pagination: {} } });
    await activityService.getActivities({ category: 'Technical', page: 2 });
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('category=Technical'));
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('page=2'));
  });

  it('getActivity calls GET /activities/:id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { activity: {}, isEnrolled: false } });
    await activityService.getActivity('abc123');
    expect(mockApi.get).toHaveBeenCalledWith('/activities/abc123');
  });

  it('updateActivity calls PUT /activities/:id', async () => {
    mockApi.put.mockResolvedValueOnce({ data: {} });
    await activityService.updateActivity('abc123', { title: 'Updated' });
    expect(mockApi.put).toHaveBeenCalledWith('/activities/abc123', { title: 'Updated' });
  });

  it('deleteActivity calls DELETE /activities/:id', async () => {
    mockApi.delete.mockResolvedValueOnce({ data: {} });
    await activityService.deleteActivity('abc123');
    expect(mockApi.delete).toHaveBeenCalledWith('/activities/abc123');
  });

  it('enrollActivity calls POST /activities/:id/enroll', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { message: 'enrolled' } });
    await activityService.enrollActivity('abc123');
    expect(mockApi.post).toHaveBeenCalledWith('/activities/abc123/enroll');
  });

  it('cancelEnrollment calls POST /activities/:id/cancel', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { message: 'cancelled' } });
    await activityService.cancelEnrollment('abc123');
    expect(mockApi.post).toHaveBeenCalledWith('/activities/abc123/cancel');
  });

  it('getParticipants calls GET /activities/:id/participants', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { participants: [] } });
    await activityService.getParticipants('abc123');
    expect(mockApi.get).toHaveBeenCalledWith('/activities/abc123/participants');
  });

  it('bulkUpdateStatus calls PATCH /activities/bulk/status', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { modifiedCount: 2 } });
    const res = await activityService.bulkUpdateStatus(['id1', 'id2'], 'published');
    expect(mockApi.patch).toHaveBeenCalledWith('/activities/bulk/status', { activityIds: ['id1', 'id2'], status: 'published' });
    expect(res.modifiedCount).toBe(2);
  });

  it('cloneActivity calls POST /activities/:id/clone', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { _id: 'newId', title: 'Copy of T' } });
    const res = await activityService.cloneActivity('abc123');
    expect(mockApi.post).toHaveBeenCalledWith('/activities/abc123/clone');
    expect(res.title).toBe('Copy of T');
  });
});
