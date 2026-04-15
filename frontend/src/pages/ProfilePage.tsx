import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  EnvelopeIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  CalendarIcon,
  UserGroupIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Input } from '../components/Common';
import { useAuthStore } from '../store/authStore';
import { authService, dashboardService } from '../services';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', department: '', rollNumber: '' });

  // Fetch stats based on role
  const { data: studentStats } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: dashboardService.getStudentStats,
    enabled: user?.role === 'student',
  });

  const { data: facultyStats } = useQuery({
    queryKey: ['dashboard', 'faculty'],
    queryFn: dashboardService.getFacultyStats,
    enabled: user?.role === 'faculty',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; department?: string; rollNumber?: string }) => updateUser(data),
    onSuccess: () => {
      toast.success('Profile updated!');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    },
  });

  const startEditing = () => {
    setEditData({
      name: user?.name || '',
      department: user?.department || '',
      rollNumber: user?.rollNumber || '',
    });
    setIsEditing(true);
  };

  const handleProfileSave = () => {
    const updates: Record<string, string> = {};
    if (editData.name && editData.name !== user?.name) updates.name = editData.name;
    if (editData.department !== (user?.department || '')) updates.department = editData.department;
    if (user?.role === 'student' && editData.rollNumber !== (user?.rollNumber || '')) updates.rollNumber = editData.rollNumber;
    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      return;
    }
    updateProfileMutation.mutate(updates);
  };

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authService.changePassword(passwordData.currentPassword, passwordData.newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to change password';
      setErrors({ general: message });
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 8)
      newErrors.newPassword = 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword))
      newErrors.newPassword = 'Must contain uppercase, lowercase, and number';
    if (passwordData.newPassword !== passwordData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      changePasswordMutation.mutate();
    }
  };

  const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    student: {
      label: 'Student',
      color: 'text-primary-700 dark:text-primary-300',
      bg: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
    },
    faculty: {
      label: 'Faculty',
      color: 'text-secondary-700 dark:text-secondary-300',
      bg: 'bg-secondary-50 dark:bg-secondary-900/20 border-secondary-200 dark:border-secondary-800',
    },
    admin: {
      label: 'Administrator',
      color: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    },
  };

  const role = roleConfig[user?.role || 'student'];

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <motion.div initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={fadeUp} custom={0} className="mb-8">
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white tracking-tight">Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and security settings</p>
        </motion.div>

        {/* Profile Hero Card */}
        <motion.div variants={fadeUp} custom={1}>
          <Card className="mb-6 !p-0">
            {/* Banner */}
            <div className="h-28 rounded-t-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </div>
            {/* Avatar + Info */}
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center ring-4 ring-white dark:ring-gray-900 shadow-elevated flex-shrink-0">
                  <span className="text-3xl font-bold text-white font-display">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">{user?.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${role.bg} ${role.color}`}>
                  {role.label}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Details */}
        <motion.div variants={fadeUp} custom={2}>
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IdentificationIcon className="w-5 h-5 text-primary-500" />
                Account Information
              </h3>
              {!isEditing ? (
                <Button variant="ghost" size="sm" onClick={startEditing}>
                  <PencilIcon className="w-4 h-4 mr-1.5 inline" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" onClick={handleProfileSave} isLoading={updateProfileMutation.isPending}>Save</Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  minLength={2}
                  maxLength={100}
                />
                <Input
                  label="Department"
                  value={editData.department}
                  onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  maxLength={100}
                  placeholder="e.g., Computer Science"
                />
                {user?.role === 'student' && (
                  <Input
                    label="Roll Number"
                    value={editData.rollNumber}
                    onChange={(e) => setEditData({ ...editData, rollNumber: e.target.value })}
                    maxLength={50}
                    placeholder="e.g., BCA2024001"
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { icon: EnvelopeIcon, label: 'Email', value: user?.email },
                  { icon: AcademicCapIcon, label: 'Role', value: user?.role, capitalize: true },
                  user?.department ? { icon: BuildingOfficeIcon, label: 'Department', value: user.department } : null,
                  user?.rollNumber ? { icon: IdentificationIcon, label: 'Roll Number', value: user.rollNumber } : null,
                ].filter(Boolean) as { icon: React.ElementType; label: string; value?: string; capitalize?: boolean }[]).map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-[18px] h-[18px] text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 dark:text-gray-500">{item.label}</p>
                        <p className={`text-sm font-medium text-gray-900 dark:text-white truncate ${item.capitalize ? 'capitalize' : ''}`}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Account Statistics */}
        {user?.role === 'student' && studentStats && (
          <motion.div variants={fadeUp} custom={2.5}>
            <Card className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary-500" />
                Account Statistics
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{studentStats.enrolledActivities || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enrolled</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{studentStats.upcomingActivities || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upcoming</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{studentStats.completedActivities || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {user?.role === 'faculty' && facultyStats && (
          <motion.div variants={fadeUp} custom={2.5}>
            <Card className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-primary-500" />
                Account Statistics
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{facultyStats.totalActivities || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Events Created</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{facultyStats.totalParticipants || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Participants</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{facultyStats.publishedActivities || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Published</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Change Password */}
        <motion.div variants={fadeUp} custom={3}>
          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-primary-500" />
              Change Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                </div>
              )}

              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                error={errors.currentPassword}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                error={errors.newPassword}
                helperText="Min 8 chars, uppercase, lowercase, number"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                required
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={changePasswordMutation.isPending}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
