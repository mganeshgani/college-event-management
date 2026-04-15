import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Skeleton, Modal } from '../components/Common';
import ParticipantsList from '../components/Activity/ParticipantsList';
import { dashboardService, activityService } from '../services';
import toast from 'react-hot-toast';

export default function AdminActivitiesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [participantsModal, setParticipantsModal] = useState<{ isOpen: boolean; activityId: string; activityTitle: string }>({
    isOpen: false,
    activityId: '',
    activityTitle: '',
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; activityId: string | null; activityTitle: string }>({
    isOpen: false,
    activityId: null,
    activityTitle: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'activities', { page, search, status: statusFilter, category: categoryFilter, department: departmentFilter, faculty: facultyFilter }],
    queryFn: () =>
      dashboardService.getAdminActivities({
        page,
        limit: 15,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        department: departmentFilter || undefined,
        faculty: facultyFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => activityService.deleteActivity(id),
    onSuccess: () => {
      toast.success('Activity deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      setDeleteModal({ isOpen: false, activityId: null, activityTitle: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete activity');
    },
  });

  const handleDelete = () => {
    if (deleteModal.activityId) {
      deleteMutation.mutate(deleteModal.activityId);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setStatusFilter('');
    setCategoryFilter('');
    setDepartmentFilter('');
    setFacultyFilter('');
    setPage(1);
  };

  const activities = data?.activities || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };
  const facultyList = data?.facultyList || [];
  const hasActiveFilters = search || statusFilter || categoryFilter || departmentFilter || facultyFilter;

  const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">All Activities</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all activities across all faculty ({pagination.total} total)
            </p>
          </div>
          <Link to="/create-activity">
            <Button variant="primary" size="lg">
              + Create Activity
            </Button>
          </Link>
        </motion.div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search activities by title, description..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <Button type="submit" variant="primary" size="md">
                  Search
                </Button>
              </form>
              <Button
                variant="outline"
                size="md"
                leftIcon={<FunnelIcon className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
                className={hasActiveFilters ? 'border-primary-500 text-primary-600 dark:text-primary-400' : ''}
              >
                Filters {hasActiveFilters ? '●' : ''}
              </Button>
            </div>

            {/* Filter Row */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 dark:border-gray-800"
              >
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="technical">Technical</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={departmentFilter}
                  onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Science">Science</option>
                </select>

                <select
                  value={facultyFilter}
                  onChange={(e) => { setFacultyFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Faculty</option>
                  {facultyList.map((f: any) => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </Card>

        {/* Activities Table */}
        {isLoading ? (
          <Card>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={60} />
              ))}
            </div>
          </Card>
        ) : activities.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {hasActiveFilters ? 'No activities match your filters.' : 'No activities found.'}
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
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Activity</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Faculty</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Enrollment</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {activities.map((activity: any) => (
                      <tr key={activity._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {activity.posterImage ? (
                              <img src={activity.posterImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">{activity.title?.charAt(0)?.toUpperCase()}</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <Link to={`/activities/${activity._id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate block max-w-[200px]">
                                {activity.title}
                              </Link>
                              <p className="text-xs text-gray-400 truncate max-w-[200px]">{activity.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{activity.createdBy?.name || 'Unknown'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium">
                            {activity.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(activity.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden max-w-[80px]">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                                style={{ width: `${activity.capacity > 0 ? ((activity.enrollmentCount || 0) / activity.capacity) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {activity.enrollmentCount || 0}/{activity.capacity}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[activity.status] || statusColors.draft}`}>
                            {activity.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/activities/${activity._id}`}>
                              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="View">
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => setParticipantsModal({ isOpen: true, activityId: activity._id, activityTitle: activity.title })}
                              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Participants"
                            >
                              <UserGroupIcon className="w-4 h-4" />
                            </button>
                            <Link to={`/edit-activity/${activity._id}`}>
                              <button className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" title="Edit">
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, activityId: activity._id, activityTitle: activity.title })}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
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
                  Page {pagination.page} of {pagination.pages} · {pagination.total} activities
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

        {/* Participants Modal */}
        <Modal
          isOpen={participantsModal.isOpen}
          onClose={() => setParticipantsModal({ isOpen: false, activityId: '', activityTitle: '' })}
          title={`Participants — ${participantsModal.activityTitle}`}
          size="lg"
        >
          {participantsModal.activityId && (
            <ParticipantsList
              activityId={participantsModal.activityId}
              activityTitle={participantsModal.activityTitle}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, activityId: null, activityTitle: '' })}
          title="Delete Activity"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete <strong>{deleteModal.activityTitle}</strong>? This action cannot be undone and will remove all associated enrollment data.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ isOpen: false, activityId: null, activityTitle: '' })}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="!bg-red-600 hover:!bg-red-700"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
