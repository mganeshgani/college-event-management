import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Card, Skeleton } from '../components/Common';
import { dashboardService } from '../services';

export default function ActivityAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => dashboardService.getActivityAnalytics(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><Skeleton variant="rectangular" height={120} /></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Analytics not available</p>
      </div>
    );
  }

  const { activity, stats, departmentBreakdown, enrollmentTimeline } = data;
  const maxDeptCount = Math.max(...departmentBreakdown.map((d: { count: number }) => d.count), 1);
  const fillRate = parseFloat(stats.occupancyRate);

  // SVG ring chart calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const enrolledDash = (stats.enrolled / stats.totalCapacity) * circumference;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">
          Analytics: {activity.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Detailed enrollment analytics and insights
        </p>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Enrolled', value: stats.enrolled, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Waitlisted', value: stats.waitlisted, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Fill Rate', value: `${fillRate}%`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`text-center ${item.bg}`}>
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enrollment Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <h3 className="text-lg font-semibold mb-4">Enrollment Over Time</h3>
            {enrollmentTimeline.length > 0 ? (
              <div className="space-y-3">
                {enrollmentTimeline.map((entry: { _id: string; count: number }, i: number) => {
                  const date = new Date(entry._id);
                  const formattedDate = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                  return (
                    <div key={entry._id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-16 flex-shrink-0">{formattedDate}</span>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max((entry.count / stats.totalCapacity) * 100, 5)}%` }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6 text-right">{entry.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No enrollment data yet</p>
            )}
          </Card>
        </motion.div>

        {/* Capacity Ring Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <h3 className="text-lg font-semibold mb-4">Capacity Usage</h3>
            <div className="flex items-center justify-center">
              <svg width="160" height="160" viewBox="0 0 160 160">
                {/* Background ring */}
                <circle
                  cx="80" cy="80" r={radius}
                  fill="none"
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-700"
                  strokeWidth="12"
                />
                {/* Enrolled ring */}
                <motion.circle
                  cx="80" cy="80" r={radius}
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - enrolledDash }}
                  transition={{ duration: 1, delay: 0.5 }}
                  transform="rotate(-90 80 80)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <text x="80" y="75" textAnchor="middle" className="fill-gray-900 dark:fill-white text-2xl font-bold">{stats.enrolled}</text>
                <text x="80" y="95" textAnchor="middle" className="fill-gray-500 text-xs">/ {stats.totalCapacity}</text>
              </svg>
            </div>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">Enrolled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                <span className="text-gray-600 dark:text-gray-400">Available</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Department Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Department Breakdown</h3>
          {departmentBreakdown.length > 0 ? (
            <div className="space-y-3">
              {departmentBreakdown.map((dept: { _id: string; count: number }, i: number) => (
                <div key={dept._id || 'unknown'} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-40 truncate flex-shrink-0">
                    {dept._id || 'Not specified'}
                  </span>
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(dept.count / maxDeptCount) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">{dept.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No enrollment data yet</p>
          )}
        </Card>
      </motion.div>

      {/* Quick Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <h3 className="text-lg font-semibold mb-4">Activity Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(activity.startDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserGroupIcon className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Total Capacity</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalCapacity}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{activity.status}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
