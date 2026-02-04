'use client'

import { use } from 'react'
import { useCompany, useUpdateCompanyStatus } from '@/hooks/use-companies'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: company, isLoading, error } = useCompany(id)
  const updateStatusMutation = useUpdateCompanyStatus()

  const handleStatusChange = async (newStatus: string) => {
    if (
      confirm(
        `Are you sure you want to change this company's status to ${newStatus}?`,
      )
    ) {
      try {
        await updateStatusMutation.mutateAsync({
          id: company!.id,
          status: newStatus,
        })
      } catch (error) {
        alert('Failed to update company status')
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

  if (error || !company) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading company. Please try again.
      </div>
    )
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'VERIFIED':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING_VERIFICATION':
        return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <Link
        href="/admin/companies"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Companies
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {company.companyName || company.name}
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={company.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updateStatusMutation.isPending}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeColor(company.status)} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="ACTIVE">Active</option>
            <option value="VERIFIED">Verified</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Company Information
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Company ID:</span>
              <p className="font-mono text-sm text-gray-600">{company.id}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status:</span>
              <p className="font-medium text-gray-900">
                {company.status.replace('_', ' ')}
              </p>
            </div>
            {company.companyName && (
              <div>
                <span className="text-sm text-gray-500">Company Name:</span>
                <p className="font-medium text-gray-900">{company.companyName}</p>
              </div>
            )}
            {company.taxId && (
              <div>
                <span className="text-sm text-gray-500">Tax ID:</span>
                <p className="font-medium text-gray-900">{company.taxId}</p>
              </div>
            )}
            {company.description && (
              <div>
                <span className="text-sm text-gray-500">Description:</span>
                <p className="text-gray-900">{company.description}</p>
              </div>
            )}
            {(company.city || company.address) && (
              <div>
                <span className="text-sm text-gray-500">Location:</span>
                {company.city && (
                  <p className="font-medium text-gray-900">{company.city}</p>
                )}
                {company.address && (
                  <p className="text-sm text-gray-600">{company.address}</p>
                )}
              </div>
            )}
            {company.phone && (
              <div>
                <span className="text-sm text-gray-500">Phone:</span>
                <p className="font-medium text-gray-900">{company.phone}</p>
              </div>
            )}
            {company.website && (
              <div>
                <span className="text-sm text-gray-500">Website:</span>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-900"
                >
                  {company.website}
                </a>
              </div>
            )}
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
                {company.user?.firstName} {company.user?.lastName}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email:</span>
              <p className="font-medium text-gray-900">{company.user?.email}</p>
            </div>
            {company.user?.phone && (
              <div>
                <span className="text-sm text-gray-500">Phone:</span>
                <p className="font-medium text-gray-900">{company.user.phone}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">User Status:</span>
              <p className="font-medium text-gray-900">{company.user?.status}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Trades</h2>
          <div className="flex flex-wrap gap-2">
            {company.trades && company.trades.length > 0 ? (
              company.trades.map((ct, idx) => (
                <span
                  key={idx}
                  className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {ct.trade.name}
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
            {company.serviceProvider ? (
              <>
                <div>
                  <span className="text-sm text-gray-500">Average Rating:</span>
                  <p className="text-2xl font-bold text-gray-900">
                    {company.serviceProvider.averageRating.toFixed(1)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Total Reviews:</span>
                  <p className="font-medium text-gray-900">
                    {company.serviceProvider.totalReviews}
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
                {new Date(company.createdAt).toLocaleString()}
              </p>
            </div>
            {company.updatedAt && (
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <p className="font-medium text-gray-900">
                  {new Date(company.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

