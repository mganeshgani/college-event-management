import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { activityService } from '../services/activityService';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/UI/Select';
import TextArea from '../components/UI/TextArea';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface CreateActivityForm {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  department: string;
  category: string;
  posterImage: string;
  status: 'draft' | 'published';
}

const CreateActivityPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateActivityForm>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: 50,
    department: '',
    category: 'Academic',
    posterImage: '',
    status: 'draft',
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateActivityForm) => activityService.createActivity(data),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'faculty'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity created successfully!');
      navigate('/faculty/dashboard');
    },
    onError: (error: any) => {
      console.error('Create activity error:', error.response?.data);
      console.error('Validation details:', error.response?.data?.details);
      const details = error.response?.data?.details;
      const message = details?.[0]?.msg || error.response?.data?.error || 'Failed to create activity';
      toast.error(message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end <= start) {
      toast.error('End date must be after start date');
      return;
    }

    if (start < new Date()) {
      toast.error('Start date cannot be in the past');
      return;
    }

    // Convert dates to ISO8601 format and exclude empty posterImage
    const submitData: any = {
      ...formData,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };

    // Remove posterImage if empty
    if (!submitData.posterImage || submitData.posterImage.trim() === '') {
      delete submitData.posterImage;
    }

    createMutation.mutate(submitData);
  };

  const categories = [
    'Academic',
    'Cultural',
    'Sports',
    'Technical',
    'Social',
    'Workshop',
    'Seminar',
    'Competition',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/faculty/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold gradient-text mb-2">Create New Activity</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the details to create a new activity for students
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Activity Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter activity title"
                  required
                  minLength={3}
                  maxLength={200}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the activity..."
                  rows={5}
                  required
                  minLength={10}
                  maxLength={2000}
                />
              </div>

              {/* Category and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <Select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium mb-2">
                    Department *
                  </label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Start and End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                    Start Date & Time *
                  </label>
                  <Input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                    End Date & Time *
                  </label>
                  <Input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Location and Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-2">
                    Location *
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Main Auditorium"
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium mb-2">
                    Capacity *
                  </label>
                  <Input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min={1}
                    max={10000}
                    required
                  />
                </div>
              </div>

              {/* Poster Image URL */}
              <div>
                <label htmlFor="posterImage" className="block text-sm font-medium mb-2">
                  Poster Image URL (optional)
                </label>
                <Input
                  type="url"
                  id="posterImage"
                  name="posterImage"
                  value={formData.posterImage}
                  onChange={handleChange}
                  placeholder="https://example.com/poster.jpg"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-2">
                  Status *
                </label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="draft">Draft (Not visible to students)</option>
                  <option value="published">Published (Visible to students)</option>
                </Select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Activity'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/faculty/dashboard')}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateActivityPage;
