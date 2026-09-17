'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, AttentionFlagSummary, PaginatedResponse } from '@/lib/api/admin'

export function useAttentionFlags(page = 1, limit = 20) {
  return useQuery<PaginatedResponse<AttentionFlagSummary>>({
    queryKey: ['admin', 'attention', page, limit],
    queryFn: () => adminApi.getAttentionFlags(page, limit),
  })
}

export function useResolveAttentionFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.resolveAttentionFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attention'] })
    },
  })
}
