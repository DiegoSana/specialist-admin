'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, InAppNotification } from '@/lib/api/admin'

const KEY = ['admin', 'my-notifications']

export function useMyNotifications() {
  return useQuery<InAppNotification[]>({
    queryKey: KEY,
    queryFn: () => adminApi.getNotifications(),
    // Notifications are created by backend events, not by actions in this tab.
    refetchInterval: 30000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => adminApi.markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}
