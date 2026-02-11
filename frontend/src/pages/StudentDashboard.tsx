import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Card, Skeleton } from '../components/Common';
import ActivityCard from '../components/Activity/ActivityCard';
import { dashboardService, activityService } from '../services';

export default function StudentDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: dashboardService.getStudentStats,
  });

  const { data: activities } = useQuery({
    queryKey: ['activities', 'upcoming'],
    queryFn: () => activityService.getActivities({ status: 'published', limit: 3 }),
  });

  const { data: myActivities } = useQuery({
    queryKey: ['myActivities'],
    queryFn: dashboardService.getMyActivities,
  });

  const statCards = [
    {
      title: 'Enrolled Activities',
      value: stats?.stats?.enrolled || 0,
      icon: AcademicCapIcon,
      color: 'from-primary-500 to-secondary-500',
    },
    {
      title: 'Upcoming Events',
      value: stats?.upcomingEnrollments?.length || 0,
      icon: CalendarDaysIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Completed',
      value: stats?.stats?.completed || 0,
      icon: CheckCircleIcon,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Available',
      value: stats?.recommendedActivities?.length || 0,
      icon: SparklesIcon,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Student Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your activities and discover new events
        </p>
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

      {/* My Recent Activities */}
      {myActivities && myActivities.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Enrolled Activities
            </h2>
            <Link to="/my-activities" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myActivities.slice(0, 3).map((item) => (
              <Card key={item._id} glass>
                <Link to={`/activities/${item.activity._id}`}>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'enrolled'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : item.status === 'waitlisted'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {item.activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(item.activity.date).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      📍 {item.activity.location}
                    </p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Activities */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Discover New Activities
          </h2>
          <Link to="/activities" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>

        {activities?.data && activities.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.data.map((activity) => (
              <ActivityCard key={activity._id} activity={activity} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No upcoming activities available
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
