'use client'

import { use } from 'react'
import { useProfessional, useUpdateProfessionalStatus } from '@/hooks/use-professionals'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: professional, isLoading, error } = useProfessional(id)
  const updateStatusMutation = useUpdateProfessionalStatus()

  const handleStatusChange = async (newStatus: string) => {
    if (
      confirm(
        `Are you sure you want to change this professional's status to ${newStatus}?`,
      )
    ) {
      try {
        await updateStatusMutation.mutateAsync({
          id: professional!.id,
          status: newStatus,
        })
      } catch (error) {
        alert('Failed to update professional status')
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

  if (error || !professional) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading professional. Please try again.
      </div>
    )
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <Link
        href="/admin/professionals"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Professionals
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {professional.user?.firstName} {professional.user?.lastName}
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={professional.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updateStatusMutation.isPending}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeColor(professional.status)} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Professional Information
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Professional ID:</span>
              <p className="font-mono text-sm text-gray-600">{professional.id}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status:</span>
              <p className="font-medium text-gray-900">{professional.status}</p>
            </div>
            {professional.bio && (
              <div>
                <span className="text-sm text-gray-500">Bio:</span>
                <p className="text-gray-900">{professional.bio}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">Location:</span>
              <p className="font-medium text-gray-900">
                {professional.city}
                {professional.zone && ` - ${professional.zone}`}
              </p>
              {professional.address && (
                <p className="text-sm text-gray-600">{professional.address}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            User Information
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Name:</span>
              <p className="font-medium text-gray-900">
                {professional.user?.firstName} {professional.user?.lastName}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email:</span>
              <p className="font-medium text-gray-900">
                {professional.user?.email}
              </p>
            </div>
            {(professional.user?.phone || professional.whatsapp) && (
              <div>
                <span className="text-sm text-gray-500">Phone / WhatsApp:</span>
                <p className="font-medium text-gray-900">
                  {professional.user?.phone || professional.whatsapp}
                </p>
              </div>
            )}
            {professional.website && (
              <div>
                <span className="text-sm text-gray-500">Website:</span>
                <a
                  href={professional.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-900"
                >
                  {professional.website}
                </a>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">User Status:</span>
              <p className="font-medium text-gray-900">
                {professional.user?.status}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Trades</h2>
          <div className="flex flex-wrap gap-2">
            {professional.trades && professional.trades.length > 0 ? (
              professional.trades.map((pt, idx) => (
                <span
                  key={idx}
                  className={`rounded px-3 py-1 text-sm font-medium ${
                    pt.isPrimary
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {pt.trade.name}
                  {pt.isPrimary && ' (Primary)'}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No trades assigned</p>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Reviews</h2>
          <div className="space-y-3">
            {professional.serviceProvider ? (
              <>
                <div>
                  <span className="text-sm text-gray-500">Average Rating:</span>
                  <p className="text-2xl font-bold text-gray-900">
                    {professional.serviceProvider.averageRating !== null
                      ? professional.serviceProvider.averageRating.toFixed(1)
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Total Reviews:</span>
                  <p className="font-medium text-gray-900">
                    {professional.serviceProvider.totalReviews}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No reviews yet</p>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Dates</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium text-gray-900">
                {new Date(professional.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <p className="font-medium text-gray-900">
                {new Date(professional.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {professional.gallery && professional.gallery.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Gallery</h2>
            <div className="grid grid-cols-2 gap-2">
              {professional.gallery.map((imageUrl, idx) => (
                <img
                  key={idx}
                  src={imageUrl}
                  alt={`Gallery ${idx + 1}`}
                  className="h-32 w-full rounded object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

