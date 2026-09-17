'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react'
import { useAttentionFlags, useResolveAttentionFlag } from '@/hooks/use-attention'
import { AttentionFlagSummary } from '@/lib/api/admin'

function getReasonBadgeColor(reason: string) {
  switch (reason) {
    case 'AT_RISK':
      return 'bg-yellow-100 text-yellow-800'
    case 'ABANDONED':
      return 'bg-red-100 text-red-800'
    case 'ESCALATED':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getReasonLabel(reason: string) {
  switch (reason) {
    case 'AT_RISK':
      return 'En riesgo'
    case 'ABANDONED':
      return 'Abandonado'
    case 'ESCALATED':
      return 'Escalado'
    default:
      return reason
  }
}

export default function AttentionPage() {
  const [page, setPage] = useState(1)
  const limit = 20
  const { data, isLoading, error } = useAttentionFlags(page, limit)
  const resolveMutation = useResolveAttentionFlag()

  const handleResolve = async (id: string) => {
    if (confirm('¿Marcar como resuelto?')) {
      try {
        await resolveMutation.mutateAsync(id)
      } catch (error) {
        alert('No se pudo marcar como resuelto')
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

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading attention flags:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Requiere atención</h1>
        <div className="text-sm text-gray-600">
          Total: {data?.total ?? 0} solicitud{data?.total === 1 ? '' : 'es'}
        </div>
      </div>

      {data && data.data.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
          Nada requiere atención por ahora.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Detalle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data?.data.map((flag: AttentionFlagSummary) => (
                <tr key={flag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/whatsapp/${flag.requestId}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-900"
                    >
                      {flag.requestTitle}
                    </Link>
                    <div className="text-xs text-gray-400">{flag.requestStatus}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getReasonBadgeColor(flag.reason)}`}
                    >
                      {getReasonLabel(flag.reason)}
                    </span>
                  </td>
                  <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                    {flag.detail || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(flag.createdAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => handleResolve(flag.id)}
                      disabled={
                        resolveMutation.isPending &&
                        resolveMutation.variables === flag.id
                      }
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      Marcar resuelto
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
