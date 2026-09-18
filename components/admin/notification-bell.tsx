'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import {
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications'
import type { InAppNotification } from '@/lib/api/admin'

function targetFor(n: InAppNotification): string | null {
  if (n.data?.conversationId) return `/admin/support/${n.data.conversationId}`
  if (n.data?.requestId) return `/admin/requests/${n.data.requestId}`
  return null
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { data: notifications = [] } = useMyNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const unread = notifications.filter((n) => !n.readAt).length

  const handleClick = (n: InAppNotification) => {
    if (!n.readAt) markRead.mutate(n.id)
    const target = targetFor(n)
    if (target) {
      setOpen(false)
      router.push(target)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
        className="relative rounded-md p-2 text-gray-700 hover:bg-gray-100"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-96 rounded-md border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="text-xs text-blue-600 hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-gray-500">
                No tenés notificaciones
              </li>
            )}
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => handleClick(n)}
                  className={`w-full border-b px-4 py-3 text-left hover:bg-gray-50 ${
                    n.readAt ? '' : 'bg-blue-50'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-gray-600">{n.body}</p>}
                  <p className="mt-1 text-[11px] text-gray-400">
                    {new Date(n.createdAt).toLocaleString('es-AR')}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
