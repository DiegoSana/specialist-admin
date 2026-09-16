'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminApi,
  AdminWhatsAppConfig,
  PaginatedResponse,
  WhatsAppConversationSummary,
  WhatsAppInteraction,
} from '@/lib/api/admin'

export function useWhatsAppConfig() {
  return useQuery<AdminWhatsAppConfig>({
    queryKey: ['admin', 'whatsapp', 'config'],
    queryFn: () => adminApi.getWhatsAppConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes — this rarely changes
  })
}

export function useWhatsAppConversations(page = 1, limit = 20, search?: string) {
  return useQuery<PaginatedResponse<WhatsAppConversationSummary>>({
    queryKey: ['admin', 'whatsapp', 'conversations', page, limit, search],
    queryFn: () => adminApi.getWhatsAppConversations(page, limit, search),
  })
}

export function useWhatsAppThread(
  requestId: string,
  { poll }: { poll?: boolean } = {},
) {
  return useQuery<WhatsAppInteraction[]>({
    queryKey: ['admin', 'whatsapp', 'thread', requestId],
    queryFn: () => adminApi.getWhatsAppThread(requestId),
    enabled: !!requestId,
    // First use of interval polling in this repo: the thread can change from outside
    // this tab (a real WhatsApp reply, or a follow-up firing on schedule), so we poll
    // instead of relying purely on invalidation from local mutations.
    refetchInterval: poll ? 5000 : false,
  })
}

export function useSimulateWhatsAppReply(requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: string) => adminApi.simulateWhatsAppReply(requestId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'whatsapp', 'thread', requestId],
      })
    },
  })
}

export function useTriggerWhatsAppFollowUp(requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleName: string) =>
      adminApi.triggerWhatsAppFollowUp(requestId, ruleName),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'whatsapp', 'thread', requestId],
      })
    },
  })
}
