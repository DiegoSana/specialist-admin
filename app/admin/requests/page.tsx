'use client'

import { useEffect, useState } from 'react'
import { useRequests } from '@/hooks/use-requests'
import { Request } from '@/lib/api/admin'
import Link from 'next/link'

const inputClass =
  'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

const thClass =
  'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'

export default function RequestsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [titleInput, setTitleInput] = useState('')
  const [clientInput, setClientInput] = useState('')
  const [providerInput, setProviderInput] = useState('')
  const [filters, setFilters] = useState({ title: '', client: '', provider: '' })
  const limit = 10

  // Debounce the text filters before they hit the query key / backend params.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters({
        title: titleInput.trim(),
        client: clientInput.trim(),
        provider: providerInput.trim(),
      })
      setPage(1)
    }, 350)
    return () => clearTimeout(timeout)
  }, [titleInput, clientInput, providerInput])

  const { data, isLoading, error } = useRequests(
    page,
    limit,
    statusFilter || undefined,
    {
      title: filters.title || undefined,
      client: filters.client || undefined,
      provider: filters.provider || undefined,
    },
  )

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

  const getProviderTypeBadgeColor = (type: 'PROFESSIONAL' | 'COMPANY') =>
    type === 'COMPANY'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-purple-100 text-purple-800'

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
        <div className="text-sm text-gray-600">
          Total: {data?.total ?? 0} requests
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className={inputClass}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          placeholder="Filter by title..."
          className={`${inputClass} w-full max-w-[14rem]`}
        />
        <input
          type="text"
          value={clientInput}
          onChange={(e) => setClientInput(e.target.value)}
          placeholder="Filter by client (name or email)..."
          className={`${inputClass} w-full max-w-[16rem]`}
        />
        <input
          type="text"
          value={providerInput}
          onChange={(e) => setProviderInput(e.target.value)}
          placeholder="Filter by provider..."
          className={`${inputClass} w-full max-w-[14rem]`}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          Error loading requests:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Title</th>
                  <th className={thClass}>Client</th>
                  <th className={thClass}>Provider</th>
                  <th className={thClass}>Created</th>
                  <th className={thClass}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {!data || !data.data || data.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No requests found
                    </td>
                  </tr>
                ) : (
                  data.data.map((request: Request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {request.description}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {request.client
                          ? `${request.client.firstName} ${request.client.lastName}`
                          : 'N/A'}
                        {request.client?.email && (
                          <div className="text-xs text-gray-500">
                            {request.client.email}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {request.provider ? (
                          <div>
                            <div className="font-medium">
                              {request.provider.name}
                            </div>
                            <span
                              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getProviderTypeBadgeColor(request.provider.type)}`}
                            >
                              {request.provider.type === 'COMPANY'
                                ? 'Company'
                                : 'Professional'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <Link
                          href={`/admin/requests/${request.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {data.page} of {data.totalPages} ({data.total}{' '}
                total requests)
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
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
                  disabled={page === data.totalPages}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
