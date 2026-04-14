import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import {
  EnvelopeIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  KeyIcon,
  ShieldCheckIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Input } from '../components/Common';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authService.changePassword(passwordData.currentPassword, passwordData.newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setShowPasswordForm(false);
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
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <IdentificationIcon className="w-5 h-5 text-primary-500" />
              Account Information
            </h3>
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
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div variants={fadeUp} custom={3}>
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-primary-500" />
                Security
              </h3>
              {!showPasswordForm && (
                <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>
                  <KeyIcon className="w-4 h-4 mr-1.5 inline" />
                  Change Password
                </Button>
              )}
            </div>

            {showPasswordForm ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >
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
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setErrors({});
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={changePasswordMutation.isPending}
                  >
                    Update Password
                  </Button>
                </div>
              </motion.form>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <ShieldCheckIcon className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Password protected</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use a strong, unique password to keep your account secure.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
