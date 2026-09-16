'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react'
import { useWhatsAppConversations } from '@/hooks/use-whatsapp'
import { WhatsAppConversationSummary } from '@/lib/api/admin'

function getStatusBadgeColor(status: string) {
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

function getMessageStatusBadgeColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'SENT':
      return 'bg-blue-100 text-blue-800'
    case 'DELIVERED':
      return 'bg-indigo-100 text-indigo-800'
    case 'RESPONDED':
      return 'bg-green-100 text-green-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatRelativeTime(iso: string) {
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

export default function WhatsAppConversationsPage() {
  const [page, setPage] = useState(1)
  const limit = 20
  const { data, isLoading, error } = useWhatsAppConversations(page, limit)

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
        Error loading WhatsApp conversations:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp</h1>
        <div className="text-sm text-gray-600">
          Total: {data?.total ?? 0} conversations
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Request
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Last message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {!data || !data.data || data.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No conversations found
                </td>
              </tr>
            ) : (
              data.data.map((conversation: WhatsAppConversationSummary) => (
                <tr key={conversation.requestId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/whatsapp/${conversation.requestId}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-900"
                    >
                      {conversation.requestTitle}
                    </Link>
                    <div className="mt-1">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeColor(conversation.requestStatus)}`}
                      >
                        {conversation.requestStatus}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {conversation.clientName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {conversation.providerName || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 font-medium ${conversation.lastMessageDirection === 'TO_CLIENT' ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'}`}
                      >
                        {conversation.lastMessageDirection === 'TO_CLIENT'
                          ? '→ cliente'
                          : '→ proveedor'}
                      </span>
                      <span
                        className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getMessageStatusBadgeColor(conversation.lastMessageStatus)}`}
                      >
                        {conversation.lastMessageStatus}
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-1 text-sm text-gray-700">
                      {conversation.lastMessagePreview}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatRelativeTime(conversation.lastMessageAt)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Link
                      href={`/admin/whatsapp/${conversation.requestId}`}
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

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {data.page} of {data.totalPages} ({data.total} total
            conversations)
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
