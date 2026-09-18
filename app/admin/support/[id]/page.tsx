'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  useSupportConversation,
  useReplySupportConversation,
  useResolveSupportConversation,
  useReopenSupportConversation,
} from '@/hooks/use-support'
import { useUser } from '@/hooks/use-users'
import { SupportMessage } from '@/lib/api/admin'

function getStatusBadgeColor(status: string) {
  return status === 'OPEN'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800'
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

export default function SupportConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data, isLoading, error } = useSupportConversation(id)
  const conversation = data?.conversation
  const messages = data?.messages ?? []

  // Detail page only, so one extra call is acceptable (not the N+1 risk a list-page
  // enrichment would be) — skip it entirely if there's no userId to look up.
  const { data: user } = useUser(conversation?.userId ?? '')

  const [replyBody, setReplyBody] = useState('')

  const replyMutation = useReplySupportConversation(id)
  const resolveMutation = useResolveSupportConversation()
  const reopenMutation = useReopenSupportConversation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading support conversation. Please try again.
      </div>
    )
  }

  const handleSend = () => {
    if (!replyBody.trim()) return
    replyMutation.mutate(replyBody, {
      onSuccess: () => setReplyBody(''),
    })
  }

  return (
    <div>
      <Link
        href="/admin/support"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Soporte
      </Link>

      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {conversation.phoneNumber}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeColor(conversation.status)}`}
              >
                {conversation.status}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  conversation.canReplyNow
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {conversation.canReplyNow ? 'Puede responder' : 'Ventana vencida'}
              </span>
            </div>
          </div>

          <div>
            {conversation.status === 'OPEN' ? (
              <button
                type="button"
                onClick={() => resolveMutation.mutate(id)}
                disabled={resolveMutation.isPending}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Marcar resuelto
              </button>
            ) : (
              <button
                type="button"
                onClick={() => reopenMutation.mutate(id)}
                disabled={reopenMutation.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Reabrir
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-gray-500">Usuario:</span>
            {conversation.userId ? (
              <p className="font-medium text-gray-900">
                {user ? (
                  <Link
                    href={`/admin/users/${conversation.userId}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                ) : (
                  <Link
                    href={`/admin/users/${conversation.userId}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {conversation.userId}
                  </Link>
                )}
              </p>
            ) : (
              <p className="font-medium text-gray-900">N/A</p>
            )}
          </div>
          <div>
            <span className="text-gray-500">Solicitud relacionada:</span>
            <p className="font-medium text-gray-900">
              {conversation.relatedRequestId ? (
                <Link
                  href={`/admin/requests/${conversation.relatedRequestId}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Ver solicitud
                </Link>
              ) : (
                'N/A'
              )}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Último entrante:</span>
            <p className="font-medium text-gray-900">
              {formatTimestamp(conversation.lastInboundAt) ?? 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Último saliente:</span>
            <p className="font-medium text-gray-900">
              {formatTimestamp(conversation.lastOutboundAt) ?? 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message: SupportMessage) => (
              <div
                key={message.id}
                className={`flex ${message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg rounded-lg px-4 py-2 ${
                    message.direction === 'OUTBOUND'
                      ? 'rounded-br-none bg-blue-600'
                      : 'rounded-bl-none bg-gray-100'
                  }`}
                >
                  <p
                    className={`whitespace-pre-wrap text-sm ${message.direction === 'OUTBOUND' ? 'text-white' : 'text-gray-900'}`}
                  >
                    {message.body}
                  </p>
                  <div
                    className={`mt-1 text-xs ${message.direction === 'OUTBOUND' ? 'text-blue-100' : 'text-gray-500'}`}
                  >
                    {formatTimestamp(message.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Responder</h2>
        <textarea
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          rows={3}
          maxLength={1500}
          disabled={!conversation.canReplyNow}
          placeholder="Escribir una respuesta..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
        />
        {!conversation.canReplyNow && (
          <p className="mt-2 text-sm text-gray-500">
            Pasaron más de 24hs desde el último mensaje del cliente, no se puede responder
            por WhatsApp hasta que escriba de nuevo.
          </p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSend}
            disabled={
              replyMutation.isPending || !replyBody.trim() || !conversation.canReplyNow
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
        {replyMutation.isError && (
          <p className="mt-2 text-sm text-red-600">
            {getErrorMessage(replyMutation.error, 'No se pudo enviar el mensaje')}
          </p>
        )}
      </div>
    </div>
  )
}
