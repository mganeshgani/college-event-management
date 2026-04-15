import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PlusCircleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CheckCircleIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Skeleton } from '../components/Common';
import { dashboardService } from '../services';

export default function FacultyDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'faculty'],
    queryFn: dashboardService.getFacultyStats,
  });

  const statCards = [
    {
      title: 'Total Activities',
      value: stats?.totalActivities || 0,
      icon: CalendarDaysIcon,
      color: 'from-primary-500 to-secondary-500',
    },
    {
      title: 'Published',
      value: stats?.publishedActivities || 0,
      icon: CheckCircleIcon,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Participants',
      value: stats?.totalParticipants || 0,
      icon: UserGroupIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Enrollments',
      value: stats?.totalEnrollments || 0,
      icon: DocumentChartBarIcon,
      color: 'from-secondary-500 to-teal-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white tracking-tight">Faculty Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your activities and track engagement
          </p>
        </div>
        <Link to="/create-activity">
          <Button variant="primary" size="lg" leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
            Create Activity
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <Skeleton variant="rectangular" height={100} />
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/faculty/my-activities">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shrink-0">
                  <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                    My Events
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage all your events
                  </p>
                </div>
                {stats?.totalActivities != null && (
                  <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold text-sm">
                    {stats.totalActivities}
                  </span>
                )}
              </div>
            </Card>
          </Link>

          <Link to="/create-activity">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
                  <PlusCircleIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                    Create New Event
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set up a new event for students
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/faculty/my-activities">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <DocumentChartBarIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                    Participant Reports
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access participants from your events page
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
