'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react'
import { useSupportConversations } from '@/hooks/use-support'
import { SupportConversation } from '@/lib/api/admin'

type StatusFilter = 'OPEN' | 'RESOLVED' | 'ALL'

const tabs: { value: StatusFilter; label: string }[] = [
  { value: 'OPEN', label: 'Abiertas' },
  { value: 'RESOLVED', label: 'Resueltas' },
  { value: 'ALL', label: 'Todas' },
]

function getStatusBadgeColor(status: string) {
  return status === 'OPEN'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800'
}

function formatRelativeTime(iso: string | null) {
  if (!iso) return '—'
  const date = new Date(iso)
  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)

  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute')
  }
  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour')
  }
  const diffDays = Math.round(diffHours / 24)
  return rtf.format(diffDays, 'day')
}

export default function SupportConversationsPage() {
  const [status, setStatus] = useState<StatusFilter>('OPEN')
  const [page, setPage] = useState(1)
  const limit = 20
  const { data, isLoading, error } = useSupportConversations(status, page, limit)

  const handleTabChange = (value: StatusFilter) => {
    setStatus(value)
    setPage(1)
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
        Error loading support conversations:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Soporte</h1>
        <div className="text-sm text-gray-600">
          Total: {data?.total ?? 0} conversaciones
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              status === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Puede responder
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Último mensaje entrante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Último mensaje saliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Solicitud
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {!data || !data.data || data.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No hay conversaciones
                </td>
              </tr>
            ) : (
              data.data.map((conversation: SupportConversation) => (
                <tr key={conversation.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/admin/support/${conversation.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-900"
                    >
                      {conversation.phoneNumber}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeColor(conversation.status)}`}
                    >
                      {conversation.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        conversation.canReplyNow
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {conversation.canReplyNow ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatRelativeTime(conversation.lastInboundAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatRelativeTime(conversation.lastOutboundAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {conversation.relatedRequestId ? (
                      <Link
                        href={`/admin/requests/${conversation.relatedRequestId}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver solicitud
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
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
            Showing page {data.page} of {data.totalPages} ({data.total} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
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
