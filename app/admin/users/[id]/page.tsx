'use client'

import { use } from 'react'
import { useUser } from '@/hooks/use-users'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: user, isLoading, error } = useUser(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading user. Please try again.
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
      case 'BANNED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {user.firstName} {user.lastName}
        </h1>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeColor(user.status)}`}
        >
          {user.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Email:</span>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <span className="text-sm text-gray-500">Phone:</span>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">User ID:</span>
              <p className="font-mono text-sm text-gray-600">{user.id}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Profiles</h2>
          <div className="space-y-3">
            {user.hasClientProfile && (
              <span className="inline-block rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                Client Profile
              </span>
            )}
            {user.hasProfessionalProfile && (
              <span className="inline-block rounded bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                Professional Profile
              </span>
            )}
            {user.isAdmin && (
              <span className="inline-block rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                Admin
              </span>
            )}
            {!user.hasClientProfile &&
              !user.hasProfessionalProfile &&
              !user.isAdmin && (
                <p className="text-sm text-gray-500">No profiles</p>
              )}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Dates</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <p className="font-medium text-gray-900">
                {new Date(user.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
