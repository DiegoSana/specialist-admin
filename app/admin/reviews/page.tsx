'use client'

import { useState } from 'react'
import {
  usePendingReviews,
  useApproveReview,
  useRejectReview,
  useFeatureReview,
} from '@/hooks/use-reviews'
import { Review, ReviewStatus } from '@/lib/api/admin'
import { ReviewDirection } from '@specialist/shared'

const DIRECTION_LABELS: Record<ReviewDirection, string> = {
  [ReviewDirection.CLIENT_TO_PROVIDER]: 'Cliente → Especialista',
  [ReviewDirection.PROVIDER_TO_CLIENT]: 'Especialista → Cliente',
}

const STATUS_TABS: { status: ReviewStatus; label: string }[] = [
  { status: ReviewStatus.PENDING, label: 'Pendientes' },
  { status: ReviewStatus.APPROVED, label: 'Aprobadas' },
  { status: ReviewStatus.REJECTED, label: 'Rechazadas' },
]

const STATUS_EMPTY_LABEL: Record<ReviewStatus, string> = {
  [ReviewStatus.PENDING]: 'No pending reviews.',
  [ReviewStatus.APPROVED]: 'No approved reviews.',
  [ReviewStatus.REJECTED]: 'No rejected reviews.',
}

export default function ReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>(
    ReviewStatus.PENDING,
  )
  const { data: reviews, isLoading, error } = usePendingReviews(statusFilter)
  const approveMutation = useApproveReview()
  const rejectMutation = useRejectReview()
  const featureMutation = useFeatureReview()

  const handleApprove = async (id: string) => {
    if (confirm('Approve this review?')) {
      try {
        await approveMutation.mutateAsync(id)
      } catch (error) {
        alert('Failed to approve review')
      }
    }
  }

  const handleReject = async (id: string) => {
    if (confirm('Reject this review?')) {
      try {
        await rejectMutation.mutateAsync(id)
      } catch (error) {
        alert('Failed to reject review')
      }
    }
  }

  const handleToggleFeature = async (review: Review) => {
    try {
      await featureMutation.mutateAsync({
        id: review.id,
        isFeatured: !review.isFeatured,
      })
    } catch (error) {
      alert('Failed to update featured status')
    }
  }

  const isMutating = (id: string) =>
    (approveMutation.isPending && approveMutation.variables === id) ||
    (rejectMutation.isPending && rejectMutation.variables === id) ||
    (featureMutation.isPending && featureMutation.variables?.id === id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading pending reviews. Please try again.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        <div className="text-sm text-gray-600">
          {reviews?.length ?? 0} review{reviews?.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.status}
            onClick={() => setStatusFilter(tab.status)}
            className={
              statusFilter === tab.status
                ? 'border-b-2 border-blue-600 px-3 py-2 text-sm font-medium text-blue-600'
                : 'border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {reviews && reviews.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
          {STATUS_EMPTY_LABEL[statusFilter]}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {reviews?.map((review: Review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {DIRECTION_LABELS[review.direction]}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {review.reviewer
                      ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
                      : review.reviewerId}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {review.professional?.user
                      ? `${review.professional.user.firstName} ${review.professional.user.lastName}`
                      : review.professionalId || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </td>
                  <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                    {review.comment || (
                      <span className="text-gray-400">No comment</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      {review.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(review.id)}
                            disabled={isMutating(review.id)}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(review.id)}
                            disabled={isMutating(review.id)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {review.status === 'APPROVED' && (
                        <button
                          onClick={() => handleToggleFeature(review)}
                          disabled={isMutating(review.id)}
                          className={
                            review.isFeatured
                              ? 'text-amber-600 hover:text-amber-900 disabled:opacity-50'
                              : 'text-gray-500 hover:text-gray-900 disabled:opacity-50'
                          }
                        >
                          {review.isFeatured ? '★ Destacada' : '☆ Destacar'}
                        </button>
                      )}
                      {review.status === 'REJECTED' && (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
