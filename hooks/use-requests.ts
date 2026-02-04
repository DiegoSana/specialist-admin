'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi, Request, PaginatedResponse } from '@/lib/api/admin'

export function useRequests(page = 1, limit = 10, status?: string) {
  return useQuery<PaginatedResponse<Request>>({
    queryKey: ['admin', 'requests', page, limit, status],
    queryFn: () => adminApi.getRequests(page, limit, status),
  })
}

export function useRequest(id: string) {
  return useQuery<Request>({
    queryKey: ['admin', 'requests', id],
    queryFn: () => adminApi.getRequestById(id),
    enabled: !!id,
  })
}



