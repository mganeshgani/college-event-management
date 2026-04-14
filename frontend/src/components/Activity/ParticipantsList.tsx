import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityService } from '@/services';
import { UserGroupIcon, EnvelopeIcon, IdentificationIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import Skeleton from '@/components/Common/Skeleton';

interface ParticipantsListProps {
  activityId: string;
  activityTitle?: string;
}

export default function ParticipantsList({ activityId, activityTitle }: ParticipantsListProps) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('enrolled');

  const { data, isLoading, error } = useQuery({
    queryKey: ['participants', activityId, status, page],
    queryFn: () => activityService.getActivityParticipants(activityId, status, page, 50),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-6">
        <p className="text-red-700 dark:text-red-300">Error loading participants: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  const activity = data?.activity;
  const participants = data?.participants || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0, limit: 50 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-800/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Participants
            </h2>
          </div>
          {activity && (
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{activity.title || activityTitle}</p>
              <p className="text-base font-semibold text-primary-600 dark:text-primary-400">
                {activity.enrolledCount} / {activity.capacity} enrolled
              </p>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Enrolled</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {activity?.enrolledCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Slots</p>
            <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
              {activity?.availableSlots || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-3">
        {['enrolled', 'waitlisted', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              status === s
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Participants Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Enrolled Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                  </tr>
                ))
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No participants found</p>
                  </td>
                </tr>
              ) : (
                participants.map((participant: any) => (
                  <tr key={participant._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">{participant.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{participant.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <IdentificationIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          {participant.rollNumber || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BuildingLibraryIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {participant.department || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(participant.enrolledAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, pagination.total)} of {pagination.total} participants
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`
                    px-3 py-2 rounded-lg font-medium transition-all
                    ${
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
