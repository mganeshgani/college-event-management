import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Input, Skeleton } from '../components/Common';
import ActivityCard from '../components/Activity/ActivityCard';
import { activityService, ActivityFilters } from '../services';

export default function ActivitiesPage() {
  const [filters, setFilters] = useState<ActivityFilters>({
    page: 1,
    limit: 12,
    status: 'published',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activityService.getActivities(filters),
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchQuery, page: 1 }));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const categories = [
    'All',
    'Technical',
    'Cultural',
    'Sports',
    'Workshop',
    'Seminar',
    'Academic',
    'Competition',
    'Social',
    'Other',
  ];

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12, status: 'published' });
    setSearchQuery('');
  };

  const hasActiveFilters = !!filters.category || !!filters.search || !!filters.startDate;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white tracking-tight">Discover Events</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore upcoming events and activities happening on campus
        </p>
      </motion.div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-outline px-6 flex items-center ${showFilters ? '!border-primary-500 !text-primary-500' : ''}`}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>
        </div>

        {/* Expandable Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Filter Options</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date (from)
                    </label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, startDate: e.target.value || undefined, page: 1 }))
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date (to)
                    </label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, endDate: e.target.value || undefined, page: 1 }))
                      }
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilters((prev) => ({
                ...prev,
                category: category === 'All' ? undefined : category,
                page: 1,
              }))}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium ${
                (category === 'All' && !filters.category) || filters.category === category
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <Skeleton variant="rectangular" height={200} className="mb-4" />
              <Skeleton variant="text" lines={3} />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load activities. Please try again.</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No activities found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Showing {data.data.length} of {data.pagination.total} activities
          </div>

          {/* Activities Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {data.data.map((activity) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ActivityCard activity={activity} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                disabled={filters.page === 1}
                className="btn-outline px-4 py-2"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(data.pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  // Show first, last, and pages around current
                  if (
                    page === 1 ||
                    page === data.pagination.pages ||
                    Math.abs(page - (filters.page || 1)) <= 1
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setFilters((prev) => ({ ...prev, page }))}
                        className={`w-10 h-10 rounded-xl ${
                          filters.page === page
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (Math.abs(page - (filters.page || 1)) === 2) {
                    return <span key={page}>...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(data.pagination.pages, (prev.page || 1) + 1) }))}
                disabled={filters.page === data.pagination.pages}
                className="btn-outline px-4 py-2"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
