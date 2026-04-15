import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { act } from '@testing-library/react';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// Mock api to prevent real imports
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('@/services/authService', () => ({
  authService: { updateProfile: vi.fn() },
}));

function renderWithRouter(children: React.ReactNode, initialRoute = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        <Route path="/protected" element={children} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    });
  });

  it('shows loading spinner when not initialized', () => {
    act(() => {
      useAuthStore.setState({ isInitialized: false });
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    act(() => {
      useAuthStore.setState({ isAuthenticated: false, isInitialized: true });
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    act(() => {
      useAuthStore.setState({
        isAuthenticated: true,
        isInitialized: true,
        user: { id: '1', email: 'a@a.com', name: 'A', role: 'student' },
      });
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to unauthorized for wrong role', () => {
    act(() => {
      useAuthStore.setState({
        isAuthenticated: true,
        isInitialized: true,
        user: { id: '1', email: 'a@a.com', name: 'A', role: 'student' },
      });
    });

    renderWithRouter(
      <ProtectedRoute roles={['admin']}>
        <div>Admin Only</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  });

  it('renders for matching role', () => {
    act(() => {
      useAuthStore.setState({
        isAuthenticated: true,
        isInitialized: true,
        user: { id: '1', email: 'a@a.com', name: 'A', role: 'admin' },
      });
    });

    renderWithRouter(
      <ProtectedRoute roles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('allows multiple roles', () => {
    act(() => {
      useAuthStore.setState({
        isAuthenticated: true,
        isInitialized: true,
        user: { id: '1', email: 'a@a.com', name: 'A', role: 'faculty' },
      });
    });

    renderWithRouter(
      <ProtectedRoute roles={['faculty', 'admin']}>
        <div>Faculty or Admin</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Faculty or Admin')).toBeInTheDocument();
  });
});
