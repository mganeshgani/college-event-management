import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Skeleton } from '../components/Common';
import { dashboardService } from '../services';
import { useAuthStore } from '../store/authStore';

export default function MyActivitiesPage() {
  const { user } = useAuthStore();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['myActivities'],
    queryFn: dashboardService.getMyActivities,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'success';
      case 'waitlisted':
        return 'warning';
      case 'attended':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">My Activities</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track all your {user?.role === 'student' ? 'enrolled' : 'organized'} activities
        </p>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <Skeleton variant="rectangular" height={150} />
            </Card>
          ))}
        </div>
      ) : !activities || activities.length === 0 ? (
        /* Empty State */
        <Card className="text-center py-16">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Activities Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {user?.role === 'student'
              ? "You haven't enrolled in any activities yet"
              : "You haven't created any activities yet"}
          </p>
          <Link to="/activities">
            <button className="btn-primary">
              {user?.role === 'student' ? 'Browse Activities' : 'Create Activity'}
            </button>
          </Link>
        </Card>
      ) : (
        /* Activities List */
        <div className="space-y-4">
          {activities.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/activities/${item.activityId._id}`}>
                <Card hover className="!p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Activity Image */}
                    {item.activityId.posterImage && (
                      <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.activityId.posterImage}
                          alt={item.activityId.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {item.activityId.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="primary">{item.activityId.category}</Badge>
                            <Badge variant={getStatusVariant(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="w-4 h-4 mr-2 text-primary-500" />
                          <span>{formatDate(item.activityId.startDate)}</span>
                        </div>

                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <ClockIcon className="w-4 h-4 mr-2 text-primary-500" />
                          <span>{formatTime(item.activityId.startDate)}</span>
                        </div>

                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPinIcon className="w-4 h-4 mr-2 text-primary-500" />
                          <span className="truncate">{item.activityId.location}</span>
                        </div>

                        <div className="text-gray-600 dark:text-gray-400">
                          <span className="text-xs">Enrolled on:</span>{' '}
                          {new Date(item.enrolledAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <button className="btn-outline px-6">
                        View Details
                      </button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {activities && activities.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card glass className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {activities.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
          </Card>

          <Card glass className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {activities.filter((a) => a.status === 'enrolled').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled</p>
          </Card>

          <Card glass className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {activities.filter((a) => a.status === 'attended').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Attended</p>
          </Card>

          <Card glass className="text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {activities.filter((a) => a.status === 'waitlisted').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Waitlisted</p>
          </Card>
        </div>
      )}
    </div>
  );
}
