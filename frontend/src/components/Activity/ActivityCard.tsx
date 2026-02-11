import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge } from '../Common';
import { Activity } from '../../services';

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'completed':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, any> = {
      'Technical': 'primary',
      'Cultural': 'secondary',
      'Sports': 'success',
      'Workshop': 'warning',
      'Seminar': 'info',
    };
    return colors[category] || 'primary';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
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

  const slotsPercentage = (activity.availableSlots / activity.capacity) * 100;
  const isAlmostFull = slotsPercentage < 20;

  return (
    <Link to={`/activities/${activity._id}`}>
      <Card hover glass className="h-full overflow-hidden">
        {/* Image */}
        {activity.posterImage && (
          <div className="relative -m-6 mb-4 h-48 overflow-hidden">
            <img
              src={activity.posterImage}
              alt={activity.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge variant={getCategoryColor(activity.category)}>
                {activity.category}
              </Badge>
              <Badge variant={getStatusColor(activity.status)}>
                {activity.status}
              </Badge>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {activity.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {activity.description}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4 mr-2 text-primary-500" />
              <span>{formatDate(activity.startDate)}</span>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <ClockIcon className="w-4 h-4 mr-2 text-primary-500" />
              <span>{formatTime(activity.startDate)}</span>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPinIcon className="w-4 h-4 mr-2 text-primary-500" />
              <span className="line-clamp-1">{activity.location}</span>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <UserGroupIcon className="w-4 h-4 mr-2 text-primary-500" />
              <span>
                {activity.availableSlots} / {activity.capacity} slots available
              </span>
            </div>
          </div>

          {/* Slots Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Availability</span>
              <span>{Math.round(slotsPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${slotsPercentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`h-full rounded-full ${
                  isAlmostFull
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-primary-500 to-secondary-500'
                }`}
              />
            </div>
          </div>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activity.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Organizer */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Organized by <span className="font-medium text-gray-700 dark:text-gray-300">{activity.createdBy?.name || 'Unknown'}</span>
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
