'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminApi,
  PaginatedResponse,
  SupportConversation,
  SupportMessage,
} from '@/lib/api/admin'

export function useSupportConversations(
  status: 'OPEN' | 'RESOLVED' | 'ALL' = 'OPEN',
  page = 1,
  limit = 20,
) {
  return useQuery<PaginatedResponse<SupportConversation>>({
    queryKey: ['admin', 'support', 'conversations', status, page, limit],
    queryFn: () => adminApi.getSupportConversations(status, page, limit),
  })
}

export function useSupportConversation(id: string) {
  return useQuery<{ conversation: SupportConversation; messages: SupportMessage[] }>({
    queryKey: ['admin', 'support', 'conversations', id],
    queryFn: () => adminApi.getSupportConversation(id),
    enabled: !!id,
    // Same rationale as the request-thread WhatsApp view: a real WhatsApp reply can land
    // from outside this tab, so poll instead of relying purely on local invalidation.
    refetchInterval: 5000,
  })
}

export function useReplySupportConversation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (message: string) => adminApi.replySupportConversation(id, message),
    onSuccess: () => {
      // Invalidating the shared prefix also covers the specific
      // ['admin', 'support', 'conversations', id] detail query (partial key matching).
      queryClient.invalidateQueries({
        queryKey: ['admin', 'support', 'conversations'],
      })
    },
  })
}

export function useResolveSupportConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.resolveSupportConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support', 'conversations'] })
    },
  })
}

export function useReopenSupportConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.reopenSupportConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support', 'conversations'] })
    },
  })
}
