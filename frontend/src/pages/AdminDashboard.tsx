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
  const recentUsers = data?.recentUsers || [];
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
          {/* Department Stats */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5 text-primary-500" />
              Department Breakdown
            </h3>
            {departmentStats.length > 0 ? (
              <div className="space-y-3">
                {departmentStats.map((dept: any) => {
                  const maxCount = Math.max(...departmentStats.map((d: any) => d.count));
                  return (
                    <div key={dept._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{dept._id || 'Uncategorized'}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {dept.count} events · {dept.enrolledCount} enrolled
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all"
                          style={{ width: `${(dept.count / maxCount) * 100}%` }}
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

          {/* Category Stats */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-primary-500" />
              Category Distribution
            </h3>
            {categoryStats.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {categoryStats.map((cat: any) => (
                  <div
                    key={cat._id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center"
                  >
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{cat.count}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat._id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No category data available</p>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h3>
              <Link to="/admin/users" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View all <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentUsers.slice(0, 8).map((u: any) => (
                <div key={u._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{u.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activities */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
              <Link to="/admin/activities" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View all <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivities.slice(0, 8).map((a: any) => (
                <div key={a._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                    <CalendarDaysIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/activities/${a._id}`} className="text-sm font-medium text-gray-900 dark:text-white truncate block hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {a.title}
                    </Link>
                    <p className="text-xs text-gray-400 truncate">by {a.createdBy?.name || 'Unknown'}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      a.status === 'published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : a.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
