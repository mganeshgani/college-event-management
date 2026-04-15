import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminActivitiesPage from './pages/AdminActivitiesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import MyActivitiesPage from './pages/MyActivitiesPage';
import FacultyActivitiesPage from './pages/FacultyActivitiesPage';
import CreateActivityPage from './pages/CreateActivityPage';
import EditActivityPage from './pages/EditActivityPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ActivityAnalyticsPage from './pages/ActivityAnalyticsPage';

import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { useEffect } from 'react';

function App() {
  const { theme } = useThemeStore();
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'dark:!bg-gray-900 dark:!text-white',
          style: {
            background: theme === 'dark' ? '#111827' : '#fff',
            color: theme === 'dark' ? '#f3f4f6' : '#111827',
            borderRadius: '14px',
            padding: '14px 16px',
            border: theme === 'dark' ? '1px solid rgba(55, 65, 81, 0.6)' : '1px solid rgba(229, 231, 235, 0.8)',
            boxShadow: theme === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.06)',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: theme === 'dark' ? '#111827' : '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: theme === 'dark' ? '#111827' : '#fff',
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="activities/:id" element={<ActivityDetailPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />

          {/* Protected: Any authenticated user */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Student Routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-activities"
            element={
              <ProtectedRoute roles={['student']}>
                <MyActivitiesPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Faculty Routes */}
          <Route
            path="faculty/dashboard"
            element={
              <ProtectedRoute roles={['faculty', 'admin']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="faculty/my-activities"
            element={
              <ProtectedRoute roles={['faculty', 'admin']}>
                <FacultyActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-activity"
            element={
              <ProtectedRoute roles={['faculty', 'admin']}>
                <CreateActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit-activity/:id"
            element={
              <ProtectedRoute roles={['faculty', 'admin']}>
                <EditActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="activity/:id/analytics"
            element={
              <ProtectedRoute roles={['faculty', 'admin']}>
                <ActivityAnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/activities"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
