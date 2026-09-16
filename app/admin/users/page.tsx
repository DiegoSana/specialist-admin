'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useUsers, useUpdateUserStatus } from '@/hooks/use-users'
import { User } from '@/lib/api/admin'

type TypeFilter = 'ALL' | 'CLIENT' | 'PROFESSIONAL' | 'COMPANY' | 'ADMIN'

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'CLIENT', label: 'Client' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'COMPANY', label: 'Company' },
  { value: 'ADMIN', label: 'Admin' },
]

function matchesTypeFilter(user: User, filter: TypeFilter) {
  switch (filter) {
    case 'CLIENT':
      return user.hasClientProfile
    case 'PROFESSIONAL':
      return user.hasProfessionalProfile
    case 'COMPANY':
      return user.hasCompanyProfile
    case 'ADMIN':
      return user.isAdmin
    default:
      return true
  }
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const limit = 10
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')

  // Debounce the search box before it hits the query key / backend `?search=` param.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data, isLoading, error } = useUsers(page, limit, search || undefined)
  const updateStatusMutation = useUpdateUserStatus()

  const filteredUsers = useMemo(
    () => data?.data.filter((user) => matchesTypeFilter(user, typeFilter)) ?? [],
    [data, typeFilter],
  )

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (
      confirm(
        `Are you sure you want to change this user's status to ${newStatus}?`,
      )
    ) {
      try {
        await updateStatusMutation.mutateAsync({
          id: userId,
          status: newStatus,
        })
      } catch (error) {
        alert('Failed to update user status')
      }
    }
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <div className="text-sm text-gray-600">
          Total: {data?.total ?? 0} users
          {typeFilter !== 'ALL' && ` (${filteredUsers.length} shown on this page)`}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 rounded-md bg-gray-100 p-1">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setTypeFilter(filter.value)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                typeFilter === filter.value
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          Error loading users. Please try again.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Profiles
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(user.status)}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <div className="flex gap-2">
                          {user.hasClientProfile && (
                            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                              Client
                            </span>
                          )}
                          {user.hasProfessionalProfile && (
                            <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-800">
                              Professional
                            </span>
                          )}
                          {user.hasCompanyProfile && (
                            <span className="rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-800">
                              Company
                            </span>
                          )}
                          {user.isAdmin && (
                            <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.status}
                            onChange={(e) =>
                              handleStatusChange(user.id, e.target.value)
                            }
                            disabled={updateStatusMutation.isPending}
                            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="BANNED">Banned</option>
                          </select>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {data.page} of {data.totalPages} ({data.total} total
                users)
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
        </>
      )}
    </div>
  )
}
