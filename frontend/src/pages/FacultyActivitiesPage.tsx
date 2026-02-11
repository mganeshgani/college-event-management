import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card, Button, Skeleton } from '../components/Common';
import Modal from '../components/Common/Modal';
import { activityService } from '../services';
import toast from 'react-hot-toast';

export default function FacultyActivitiesPage() {
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; activityId: string | null; activityTitle: string }>({
    isOpen: false,
    activityId: null,
    activityTitle: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['myActivities', 'faculty'],
    queryFn: () => activityService.getActivities({ limit: 100, myActivities: 'true' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => activityService.deleteActivity(id),
    onSuccess: () => {
      toast.success('Activity deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['myActivities'] });
      queryClient.invalidateQueries({ queryKey: ['facultyStats'] });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">My Activities</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all activities you've created
            </p>
          </div>
          <Link to="/create-activity">
            <Button variant="primary" size="lg" leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
              Create Activity
            </Button>
          </Link>
        </motion.div>

        {/* Activities List */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <Skeleton variant="rectangular" height={150} />
              </Card>
            ))}
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No activities yet. Create your first activity!
              </p>
              <Link to="/create-activity">
                <Button variant="primary">
                  <PlusCircleIcon className="w-5 h-5 mr-2 inline" />
                  Create Activity
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {data.data.map((activity) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card hover>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {activity.posterImage && (
                          <img
                            src={activity.posterImage}
                            alt={activity.title}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Link to={`/activities/${activity._id}`}>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                {activity.title}
                              </h3>
                            </Link>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              activity.status === 'published'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : activity.status === 'draft'
                                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                : activity.status === 'completed'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {activity.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>📅 {new Date(activity.startDate).toLocaleDateString()}</span>
                            <span>📍 {activity.location}</span>
                            <span>👥 {activity.availableSlots}/{activity.capacity} slots</span>
                            <span className="px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                              {activity.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/edit-activity/${activity._id}`}>
                        <Button variant="outline" size="sm" leftIcon={<PencilSquareIcon className="w-4 h-4" />}>
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<TrashIcon className="w-4 h-4" />}
                        onClick={() => setDeleteModal({ isOpen: true, activityId: activity._id, activityTitle: activity.title })}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, activityId: null, activityTitle: '' })}
          title="Delete Activity"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete <strong>{deleteModal.activityTitle}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ isOpen: false, activityId: null, activityTitle: '' })}
                disabled={deleteMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
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
