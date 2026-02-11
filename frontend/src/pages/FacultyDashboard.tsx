import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PlusCircleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CheckCircleIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Skeleton } from '../components/Common';
import ActivityCard from '../components/Activity/ActivityCard';
import { dashboardService, activityService } from '../services';

export default function FacultyDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'faculty'],
    queryFn: dashboardService.getFacultyStats,
  });

  const { data: myActivities } = useQuery({
    queryKey: ['activities', 'my'],
    queryFn: () => activityService.getActivities({ limit: 6 }),
  });

  const statCards = [
    {
      title: 'Total Activities',
      value: (stats?.stats?.published || 0) + (stats?.stats?.draft || 0) + (stats?.stats?.completed || 0),
      icon: CalendarDaysIcon,
      color: 'from-primary-500 to-secondary-500',
    },
    {
      title: 'Published',
      value: stats?.stats?.published || 0,
      icon: CheckCircleIcon,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Participants',
      value: stats?.stats?.totalEnrollments || 0,
      icon: UserGroupIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Enrollments',
      value: stats?.stats?.totalEnrollments || 0,
      icon: DocumentChartBarIcon,
      color: 'from-pink-500 to-rose-500',
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
          <h1 className="text-4xl font-bold gradient-text mb-2">Faculty Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
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
              <Card glass hover>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/create-activity">
          <Card hover className="text-center cursor-pointer">
            <PlusCircleIcon className="w-12 h-12 mx-auto mb-3 text-primary-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Create New Activity
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set up a new event for students
            </p>
          </Card>
        </Link>

        <Link to="/activities">
          <Card hover className="text-center cursor-pointer">
            <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              View All Activities
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse all campus activities
            </p>
          </Card>
        </Link>

        <Link to="/my-activities">
          <Card hover className="text-center cursor-pointer">
            <DocumentChartBarIcon className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Activity Reports
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View enrollment analytics
            </p>
          </Card>
        </Link>
      </div>

      {/* My Activities */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Activities
          </h2>
          <Link to="/my-activities" className="text-primary-600 hover:text-primary-700 font-medium">
            Manage All →
          </Link>
        </div>

        {myActivities?.data && myActivities.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myActivities.data.map((activity) => (
              <ActivityCard key={activity._id} activity={activity} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <CalendarDaysIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Activities Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by creating your first activity
              </p>
              <Link to="/create-activity">
                <Button variant="primary">
                  <PlusCircleIcon className="w-5 h-5 mr-2 inline" />
                  Create Activity
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
