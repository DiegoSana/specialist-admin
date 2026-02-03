'use client'

import { useDashboardStats } from '@/hooks/use-dashboard'
import { Users, FileText, Briefcase, Building2 } from 'lucide-react'

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats()

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
        Error loading dashboard stats. Please try again.
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Users Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.users.total ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                +{stats?.users.newLast7Days ?? 0} last 7 days
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Requests Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.requests.total ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                +{stats?.requests.newLast7Days ?? 0} last 7 days
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Professionals Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Professionals
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.professionals.verified ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {stats?.professionals.pending ?? 0} pending
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Companies Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Companies</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.companies.total ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {stats?.companies.verified ?? 0} verified
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Users Stats */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Users</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New (last 30 days)</span>
              <span className="font-semibold text-gray-900">
                {stats?.users.newLast30Days ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active (last 30 days)</span>
              <span className="font-semibold text-gray-900">
                {stats?.users.activeLast30Days ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Requests Stats */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Requests</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">
                {stats?.requests.byStatus.PENDING ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-semibold text-blue-600">
                {stats?.requests.byStatus.IN_PROGRESS ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Done</span>
              <span className="font-semibold text-green-600">
                {stats?.requests.byStatus.DONE ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

