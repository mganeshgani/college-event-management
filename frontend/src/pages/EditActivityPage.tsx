import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '../components/Common';
import TextArea from '../components/UI/TextArea';
import Select from '../components/UI/Select';
import { activityService } from '../services';
import toast from 'react-hot-toast';
import type { CreateActivityData } from '../services/activityService';

export default function EditActivityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activityService.getActivityById(id!),
    enabled: !!id,
  });

  const [formData, setFormData] = useState<CreateActivityData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: 0,
    department: '',
    category: 'Academic',
    posterImage: '',
    status: 'draft',
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title,
        description: activity.description,
        startDate: new Date(activity.startDate).toISOString().slice(0, 16),
        endDate: new Date(activity.endDate).toISOString().slice(0, 16),
        location: activity.location,
        capacity: activity.capacity,
        department: activity.department,
        category: activity.category,
        posterImage: activity.posterImage || '',
        status: activity.status,
      });
    }
  }, [activity]);

  const mutation = useMutation({
    mutationFn: (data: CreateActivityData) => activityService.updateActivity(id!, data),
    onSuccess: () => {
      toast.success('Activity updated successfully');
      queryClient.invalidateQueries({ queryKey: ['myActivities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      navigate('/faculty/my-activities');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update activity');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const dataToSubmit = { ...formData };
    dataToSubmit.startDate = new Date(formData.startDate).toISOString();
    dataToSubmit.endDate = new Date(formData.endDate).toISOString();

    if (!dataToSubmit.posterImage || dataToSubmit.posterImage.trim() === '') {
      delete dataToSubmit.posterImage;
    }

    mutation.mutate(dataToSubmit);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading activity...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Edit Activity</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update activity details and settings
          </p>
        </motion.div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Activity Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Tech Symposium 2024"
            />

            <TextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Provide a detailed description of the activity..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Start Date & Time"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                required
              />

              <Input
                label="End Date & Time"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Main Auditorium"
              />

              <Input
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                required
                min={1}
                placeholder="e.g., 100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                placeholder="e.g., Computer Science"
              />

              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                options={[
                  { value: 'Academic', label: 'Academic' },
                  { value: 'Technical', label: 'Technical' },
                  { value: 'Cultural', label: 'Cultural' },
                  { value: 'Sports', label: 'Sports' },
                  { value: 'Workshop', label: 'Workshop' },
                  { value: 'Seminar', label: 'Seminar' },
                  { value: 'Competition', label: 'Competition' },
                  { value: 'Social', label: 'Social' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>

            <Input
              label="Poster Image URL (Optional)"
              name="posterImage"
              type="url"
              value={formData.posterImage}
              onChange={handleChange}
              placeholder="https://example.com/poster.jpg"
            />

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'completed', label: 'Completed' },
              ]}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/faculty/my-activities')}
                disabled={mutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
                className="flex-1"
              >
                {mutation.isPending ? 'Updating...' : 'Update Activity'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
