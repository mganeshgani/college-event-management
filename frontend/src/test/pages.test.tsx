import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from '@testing-library/react';
import { useAuthStore } from '@/store/authStore';

// ─── Mocks ──────────────────────────────────────────────────
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
  handleApiError: (error: any) => {
    if (error.response?.data?.error) return error.response.data.error;
    if (error.message) return error.message;
    return 'An unexpected error occurred';
  },
}));

vi.mock('@/services/authService', () => ({
  authService: { updateProfile: vi.fn() },
}));

// Mock the services barrel export that LoginPage uses
vi.mock('@/services', async () => {
  const actual = await vi.importActual('@/services/api');
  return {
    handleApiError: (error: any) => {
      if (error.response?.data?.error) return error.response.data.error;
      if (error.message) return error.message;
      return 'An unexpected error occurred';
    },
    authService: { updateProfile: vi.fn() },
    activityService: {},
    dashboardService: {},
    api: {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    },
  };
});

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...filterMotionProps(props)}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...filterMotionProps(props)}>{children}</button>,
    p: ({ children, ...props }: any) => <p {...filterMotionProps(props)}>{children}</p>,
    form: ({ children, ...props }: any) => <form {...filterMotionProps(props)}>{children}</form>,
    span: ({ children, ...props }: any) => <span {...filterMotionProps(props)}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Filter out framer-motion specific props to avoid DOM warnings
function filterMotionProps(props: Record<string, any>) {
  const {
    initial, animate, exit, transition, variants, whileHover, whileTap,
    whileFocus, whileInView, layout, layoutId, onAnimationStart,
    onAnimationComplete, ...rest
  } = props;
  return rest;
}

import api from '@/services/api';
import LoginPage from '@/pages/LoginPage';

const mockApi = api as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithProviders(ui: React.ReactElement, { route = '/' } = {}) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('renders login form', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('has link to register page', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/create one/i)).toBeInTheDocument();
  });

  it('has forgot password link', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    const user = userEvent.setup();
    mockApi.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByPlaceholderText('you@example.com'), 'bad@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('calls login on form submit', async () => {
    const user = userEvent.setup();
    mockApi.post.mockResolvedValueOnce({
      data: {
        user: { id: '1', email: 'test@test.com', name: 'Test', role: 'student' },
        accessToken: 'at',
        refreshToken: 'rt',
      },
    });

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'Test1234');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'Test1234',
      });
    });
  });
});
