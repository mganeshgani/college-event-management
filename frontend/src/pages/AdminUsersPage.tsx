import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  EnvelopeIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Skeleton } from '../components/Common';
import { dashboardService } from '../services';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [roleConfirm, setRoleConfirm] = useState<{
    userId: string;
    userName: string;
    fromRole: string;
    toRole: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { page, search, role: roleFilter }],
    queryFn: () =>
      dashboardService.getAdminUsers({
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter || undefined,
      }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'student' | 'faculty' | 'admin' }) =>
      dashboardService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Role updated');
      setRoleConfirm(null);
    },
    onError: () => {
      toast.error('Failed to update role');
      setRoleConfirm(null);
    },
  });

  const handleRoleChange = (userId: string, userName: string, currentRole: string, newRole: string) => {
    if (newRole === currentRole) return;
    setRoleConfirm({ userId, userName, fromRole: currentRole, toRole: newRole });
  };

  const confirmRoleChange = () => {
    if (!roleConfirm) return;
    roleMutation.mutate({ userId: roleConfirm.userId, role: roleConfirm.toRole as 'student' | 'faculty' | 'admin' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setRoleFilter('');
    setPage(1);
  };

  const users = data?.users || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };
  const hasActiveFilters = search || roleFilter;

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    faculty: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    student: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">All Users</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all registered users ({pagination.total} total)
          </p>
        </motion.div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                Search
              </Button>
            </form>

            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admins</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </Card>

        {/* Users Table */}
        {isLoading ? (
          <Card>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={50} />
              ))}
            </div>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {hasActiveFilters ? 'No users match your filters.' : 'No users found.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-3 text-primary-600 dark:text-primary-400 hover:underline text-sm">
                  Clear filters
                </button>
              )}
            </div>
          </Card>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft bg-white dark:bg-gray-900/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Department</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users.map((user: any) => (
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">{user.name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                              {user.rollNumber && (
                                <p className="text-xs text-gray-400">{user.rollNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <BuildingLibraryIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{user.department || '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {user._id === currentUser?.id ? (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColors[user.role] || roleColors.student}`}>
                              {user.role} (you)
                            </span>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, user.name, user.role, e.target.value)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium capitalize border-0 cursor-pointer focus:ring-2 focus:ring-primary-500 ${roleColors[user.role] || roleColors.student}`}
                            >
                              <option value="student">Student</option>
                              <option value="faculty">Faculty</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {pagination.page} of {pagination.pages} · {pagination.total} users
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Role Change Confirmation Modal */}
      <AnimatePresence>
        {roleConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRoleConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Change User Role
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Change <span className="font-medium text-gray-900 dark:text-white">{roleConfirm.userName}</span>'s
                role from{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[roleConfirm.fromRole]}`}>
                  {roleConfirm.fromRole}
                </span>{' '}
                to{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[roleConfirm.toRole]}`}>
                  {roleConfirm.toRole}
                </span>
                ? This will force the user to log in again.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => setRoleConfirm(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={confirmRoleChange}
                  disabled={roleMutation.isPending}
                >
                  {roleMutation.isPending ? 'Updating...' : 'Confirm'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
