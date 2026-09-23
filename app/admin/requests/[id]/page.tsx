'use client'

import { use } from 'react'
import { useRequest, useUpdateRequestStatus } from '@/hooks/use-requests'
import {
  REQUEST_STATUSES,
  getStatusBadgeColor,
  getStatusLabel,
} from '@/lib/request-status'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: request, isLoading, error } = useRequest(id)
  const updateStatusMutation = useUpdateRequestStatus()

  const handleStatusChange = async (newStatus: string) => {
    const confirmMessage =
      newStatus === 'PUBLISHED' && request?.provider
        ? `Are you sure you want to change this request's status to ${getStatusLabel(newStatus)}? This bypasses normal status transitions. It will also automatically unassign the current provider, make the request public again, and reset all interested providers back to selectable.`
        : `Are you sure you want to change this request's status to ${getStatusLabel(newStatus)}? This bypasses normal status transitions.`

    if (confirm(confirmMessage)) {
      try {
        await updateStatusMutation.mutateAsync({ id, status: newStatus })
      } catch {
        alert('Failed to update request status')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading request. Please try again.
      </div>
    )
  }

  const getProviderTypeBadgeColor = (type: 'PROFESSIONAL' | 'COMPANY') =>
    type === 'COMPANY'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-purple-100 text-purple-800'

  const getReviewStatusBadgeColor = (
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
  ) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-800'
    if (status === 'REJECTED') return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div>
      <Link
        href="/admin/requests"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
              request.isPublic
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {request.isPublic ? 'Public' : 'Direct'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/whatsapp/${request.id}`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <MessageSquare className="h-4 w-4" />
            View WhatsApp conversation
          </Link>
          <select
            value={request.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updateStatusMutation.isPending}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeColor(request.status)} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            {REQUEST_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
          {updateStatusMutation.isPending && (
            <span className="text-xs text-gray-500">Updating…</span>
          )}
          {updateStatusMutation.isError && (
            <span className="text-xs text-red-600">
              Failed to update status
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          {request.photos && request.photos.length > 0 && (
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Photos
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {request.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Request photo ${index + 1}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Client Info */}
          {request.client && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Client
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <p className="font-medium text-gray-900">
                    {request.client.firstName} {request.client.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="text-gray-900">{request.client.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Provider */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Provider
            </h2>
            {request.provider ? (
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <p className="font-medium text-gray-900">
                    {request.provider.name}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getProviderTypeBadgeColor(request.provider.type)}`}
                  >
                    {request.provider.type === 'COMPANY'
                      ? 'Company'
                      : 'Professional'}
                  </span>
                </div>
                {request.provider.trades && request.provider.trades.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Trades:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {request.provider.trades.map((trade) => (
                        <span
                          key={trade.id}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800"
                        >
                          {trade.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No provider assigned yet</p>
            )}
          </div>

          {/* Review */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Review
            </h2>
            {request.review ? (
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Rating:</span>
                  <p className="text-gray-900">
                    {'★'.repeat(request.review.rating)}
                    {'☆'.repeat(5 - request.review.rating)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Comment:</span>
                  <p className="text-gray-900">
                    {request.review.comment || (
                      <span className="text-gray-400">No comment</span>
                    )}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getReviewStatusBadgeColor(request.review.status)}`}
                  >
                    {request.review.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No review yet</p>
            )}
          </div>

          {/* Interested providers */}
          {request.interestedProviders && request.interestedProviders.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Interested providers
              </h2>
              <div className="space-y-3">
                {request.interestedProviders.map((interested) => (
                  <div
                    key={interested.id}
                    className="rounded-md border border-gray-200 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900">
                        {interested.provider?.displayName || 'Unknown provider'}
                      </p>
                      {interested.provider?.type && (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getProviderTypeBadgeColor(interested.provider.type)}`}
                        >
                          {interested.provider.type === 'COMPANY'
                            ? 'Company'
                            : 'Professional'}
                        </span>
                      )}
                    </div>
                    {interested.provider && (
                      <p className="mt-1 text-xs text-gray-500">
                        {interested.provider.averageRating.toFixed(1)} ★ (
                        {interested.provider.totalReviews} reviews)
                      </p>
                    )}
                    {interested.message && (
                      <p className="mt-2 text-sm text-gray-700">
                        {interested.message}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      Interested {new Date(interested.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {request.address && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Location
              </h2>
              <p className="text-gray-900">{request.address}</p>
            </div>
          )}

          {/* Dates */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Dates
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="text-gray-900">
                  {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <p className="text-gray-900">
                  {new Date(request.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
