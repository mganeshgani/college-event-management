import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlusCircleIcon,
  ServerIcon,
  SignalIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, Skeleton, Button } from '../components/Common';
import { dashboardService } from '../services';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardService.getAdminStats,
  });

  const stats = data?.stats;
  const departmentStats = data?.departmentStats || [];
  const categoryStats = data?.categoryStats || [];
  const recentActivities = data?.recentActivities || [];

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'from-primary-500 to-primary-600',
      sub: `${stats?.totalStudents || 0} students, ${stats?.totalFaculty || 0} faculty`,
      link: '/admin/users',
    },
    {
      title: 'Total Activities',
      value: stats?.totalActivities || 0,
      icon: CalendarDaysIcon,
      color: 'from-blue-500 to-cyan-500',
      sub: `${stats?.publishedActivities || 0} published`,
      link: '/admin/activities',
    },
    {
      title: 'Total Enrollments',
      value: stats?.totalEnrollments || 0,
      icon: CheckCircleIcon,
      color: 'from-green-500 to-emerald-500',
      sub: 'Active enrollments',
      link: '/admin/activities',
    },
    {
      title: 'Students',
      value: stats?.totalStudents || 0,
      icon: AcademicCapIcon,
      color: 'from-indigo-500 to-primary-500',
      sub: 'Registered students',
      link: '/admin/users',
    },
  ];

  const categoryEmojis: Record<string, string> = {
    Academic: '📚',
    Cultural: '🎭',
    Sports: '🏅',
    Technical: '💻',
    Social: '🤝',
    Workshop: '🔧',
    Seminar: '🎓',
    Competition: '🏆',
    Other: '📌',
  };

  const categoryColors: Record<string, string> = {
    Academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    Cultural: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-300 dark:border-pink-700',
    Sports: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    Technical: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    Social: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700',
    Workshop: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    Seminar: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    Competition: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700',
    Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">System-wide overview and management</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/activities">
              <Button variant="outline" size="md" leftIcon={<CalendarDaysIcon className="w-4 h-4" />}>
                All Activities
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline" size="md" leftIcon={<UsersIcon className="w-4 h-4" />}>
                All Users
              </Button>
            </Link>
            <Link to="/create-activity">
              <Button variant="primary" size="md" leftIcon={<PlusCircleIcon className="w-4 h-4" />}>
                Create
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid — clickable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton variant="rectangular" height={100} />
                </Card>
              ))
            : statCards.map((stat, i) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={stat.link}>
                    <Card className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.sub}</p>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        View details <ArrowRightIcon className="w-3 h-3" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Department Stats — animated bars */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-primary-500" />
                Department Breakdown
              </h3>
              <Link to="/admin/activities" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View all <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
            {departmentStats.length > 0 ? (
              <div className="space-y-3">
                {departmentStats.map((dept: { _id: string; count: number; enrolledCount: number }, idx: number) => {
                  const maxCount = Math.max(...departmentStats.map((d: { count: number }) => d.count));
                  return (
                    <div key={dept._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{dept._id || 'Uncategorized'}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {dept.count} events · {dept.enrolledCount} enrolled
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(dept.count / maxCount) * 100}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No department data available</p>
            )}
          </Card>

          {/* Category Stats — emoji chips with colors */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-primary-500" />
                Category Distribution
              </h3>
              <Link to="/admin/activities" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View all <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
            {categoryStats.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categoryStats.map((cat: { _id: string; count: number }) => (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-3 rounded-xl border text-center ${categoryColors[cat._id] || categoryColors.Other}`}
                  >
                    <span className="text-2xl">{categoryEmojis[cat._id] || '📌'}</span>
                    <p className="text-2xl font-bold mt-1">{cat.count}</p>
                    <p className="text-xs mt-0.5 opacity-80">{cat._id}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No category data available</p>
            )}
          </Card>
        </div>

        {/* System Health Summary */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ServerIcon className="w-5 h-5 text-primary-500" />
            System Health
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <ServerIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Database</p>
                <p className="text-xs text-green-600 dark:text-green-400">Connected ✓</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <SignalIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">API</p>
                <p className="text-xs text-green-600 dark:text-green-400">Operational ✓</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Last Activity</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {recentActivities.length > 0
                    ? new Date(recentActivities[0].createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'No data'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
