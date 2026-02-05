'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCompanies, useUpdateCompanyStatus } from '@/hooks/use-companies'
import { Company } from '@/lib/api/admin'

export default function CompaniesPage() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { data, isLoading, error } = useCompanies(page, limit)
  const updateStatusMutation = useUpdateCompanyStatus()

  const handleStatusChange = async (companyId: string, newStatus: string) => {
    if (
      confirm(
        `Are you sure you want to change this company's status to ${newStatus}?`,
      )
    ) {
      try {
        await updateStatusMutation.mutateAsync({
          id: companyId,
          status: newStatus,
        })
      } catch (error) {
        alert('Failed to update company status')
      }
    }
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
        Error loading companies. Please try again.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <div className="text-sm text-gray-600">
          Total: {data?.total ?? 0} companies
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Trades
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rating
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
            {data?.data.map((company: Company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {company.companyName || company.name}
                  </div>
                  {company.taxId && (
                    <div className="text-sm text-gray-500">
                      Tax ID: {company.taxId}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <div>{company.user?.email}</div>
                  {company.user?.firstName && company.user?.lastName && (
                    <div className="text-xs text-gray-500">
                      {company.user.firstName} {company.user.lastName}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {company.trades?.slice(0, 2).map((ct, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                      >
                        {ct.trade.name}
                      </span>
                    ))}
                    {company.trades && company.trades.length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{company.trades.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(company.status)}`}
                  >
                    {company.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {company.serviceProvider?.averageRating ? (
                    <div>
                      <span className="font-medium">
                        {company.serviceProvider.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {' '}
                        ({company.serviceProvider.totalReviews} reviews)
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No reviews</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(company.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <select
                      value={company.status}
                      onChange={(e) =>
                        handleStatusChange(company.id, e.target.value)
                      }
                      disabled={updateStatusMutation.isPending}
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="PENDING_VERIFICATION">
                        Pending Verification
                      </option>
                      <option value="ACTIVE">Active</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    <Link
                      href={`/admin/companies/${company.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {data.page} of {data.totalPages} ({data.total} total
            companies)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}



