'use client'

import { use } from 'react'
import { useRequest } from '@/hooks/use-requests'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: request, isLoading, error } = useRequest(id)

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
      case 'DONE':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeColor(request.status)}`}
        >
          {request.status}
        </span>
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

          {/* Location */}
          {request.location && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Location
              </h2>
              <div className="space-y-2">
                <p className="text-gray-900">{request.location.address}</p>
                <p className="text-gray-600">
                  {request.location.city}, {request.location.state}{' '}
                  {request.location.zipCode}
                </p>
              </div>
            </div>
          )}

          {/* Budget */}
          {request.budget && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Budget
              </h2>
              <p className="text-lg font-semibold text-gray-900">
                {request.budget.currency} {request.budget.min.toLocaleString()}
                {request.budget.max &&
                  ` - ${request.budget.max.toLocaleString()}`}
              </p>
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
