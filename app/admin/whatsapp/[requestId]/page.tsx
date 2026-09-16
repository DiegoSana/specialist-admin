'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  useWhatsAppConfig,
  useWhatsAppThread,
  useSimulateWhatsAppReply,
  useTriggerWhatsAppFollowUp,
} from '@/hooks/use-whatsapp'
import { useRequest } from '@/hooks/use-requests'
import { WhatsAppInteraction } from '@/lib/api/admin'

function getRequestStatusBadgeColor(status: string) {
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

function getProviderTypeBadgeColor(type: 'PROFESSIONAL' | 'COMPANY') {
  return type === 'COMPANY'
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-purple-100 text-purple-800'
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

function formatTimestamp(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleString()
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof (error.response.data as { message?: unknown }).message === 'string'
  ) {
    return (error.response.data as { message: string }).message
  }
  return fallback
}

export default function WhatsAppThreadPage({
  params,
}: {
  params: Promise<{ requestId: string }>
}) {
  const { requestId } = use(params)
  const { data: config } = useWhatsAppConfig()
  const { data: request } = useRequest(requestId)
  const { data: thread, isLoading, error } = useWhatsAppThread(requestId, {
    poll: true,
  })

  const [replyBody, setReplyBody] = useState('')
  const [selectedRule, setSelectedRule] = useState('')

  const simulateReply = useSimulateWhatsAppReply(requestId)
  const triggerFollowUp = useTriggerWhatsAppFollowUp(requestId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (error || !thread) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading WhatsApp thread. Please try again.
      </div>
    )
  }

  // Interactions come back most-recent-first from the backend; render oldest-first
  // like a normal chat thread.
  const orderedThread = [...thread].reverse()

  return (
    <div>
      <Link
        href="/admin/whatsapp"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to WhatsApp
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-gray-900">WhatsApp thread</h1>

      {request && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link
                href={`/admin/requests/${request.id}`}
                className="text-lg font-semibold text-blue-600 hover:text-blue-900"
              >
                {request.title}
              </Link>
              <div className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getRequestStatusBadgeColor(request.status)}`}
                >
                  {request.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-gray-500">Client:</span>
              <p className="font-medium text-gray-900">
                {request.client
                  ? `${request.client.firstName} ${request.client.lastName}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Provider:</span>
              {request.provider ? (
                <p className="font-medium text-gray-900">
                  {request.provider.name}{' '}
                  <span
                    className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getProviderTypeBadgeColor(request.provider.type)}`}
                  >
                    {request.provider.type === 'COMPANY'
                      ? 'Company'
                      : 'Professional'}
                  </span>
                </p>
              ) : (
                <p className="font-medium text-gray-900">N/A</p>
              )}
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium text-gray-900">
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Updated:</span>
              <p className="font-medium text-gray-900">
                {new Date(request.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow">
        {orderedThread.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          <div className="space-y-4">
            {orderedThread.map((interaction: WhatsAppInteraction) => (
              <div key={interaction.id} className="space-y-2">
                {interaction.messageContent && (
                  <div className="flex justify-start">
                    <div className="max-w-lg rounded-lg rounded-bl-none bg-gray-100 px-4 py-2">
                      <p className="whitespace-pre-wrap text-sm text-gray-900">
                        {interaction.messageContent}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${getMessageStatusBadgeColor(interaction.status)}`}
                        >
                          {interaction.status}
                        </span>
                        <span>
                          {interaction.direction === 'TO_CLIENT'
                            ? '→ cliente'
                            : '→ proveedor'}
                        </span>
                        {formatTimestamp(interaction.sentAt) && (
                          <span>enviado {formatTimestamp(interaction.sentAt)}</span>
                        )}
                        {formatTimestamp(interaction.deliveredAt) && (
                          <span>
                            entregado {formatTimestamp(interaction.deliveredAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {interaction.responseContent && (
                  <div className="flex justify-end">
                    <div className="max-w-lg rounded-lg rounded-br-none bg-blue-600 px-4 py-2">
                      <p className="whitespace-pre-wrap text-sm text-white">
                        {interaction.responseContent}
                      </p>
                      <div className="mt-1 text-xs text-blue-100">
                        {formatTimestamp(interaction.respondedAt) &&
                          `respondido ${formatTimestamp(interaction.respondedAt)}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {config?.devMode === true && (
        <div className="mt-6 space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Simular respuesta (dev mode)
            </h2>
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              rows={3}
              placeholder="Mensaje que el usuario habría respondido por WhatsApp"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!replyBody.trim()) return
                  simulateReply.mutate(replyBody, {
                    onSuccess: () => setReplyBody(''),
                  })
                }}
                disabled={simulateReply.isPending || !replyBody.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Enviar como si fuera el usuario
              </button>
            </div>
            {simulateReply.isError && (
              <p className="mt-2 text-sm text-red-600">
                {getErrorMessage(
                  simulateReply.error,
                  'No se pudo simular la respuesta',
                )}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Forzar seguimiento (dev mode)
            </h2>
            <select
              value={selectedRule}
              onChange={(e) => setSelectedRule(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seleccionar regla...</option>
              {(config.availableFollowUpRules || []).map((rule) => (
                <option key={rule} value={rule}>
                  {rule}
                </option>
              ))}
            </select>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!selectedRule) return
                  triggerFollowUp.mutate(selectedRule)
                }}
                disabled={triggerFollowUp.isPending || !selectedRule}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Forzar seguimiento ahora
              </button>
            </div>
            {triggerFollowUp.isError && (
              <p className="mt-2 text-sm text-red-600">
                {getErrorMessage(
                  triggerFollowUp.error,
                  'No se pudo forzar el seguimiento',
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
