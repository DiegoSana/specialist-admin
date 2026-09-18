'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  adminApi,
  Request,
  PaginatedResponse,
  RequestFilters,
} from '@/lib/api/admin'

export function useRequests(
  page = 1,
  limit = 10,
  status?: string,
  filters: RequestFilters = {},
) {
  return useQuery<PaginatedResponse<Request>>({
    queryKey: [
      'admin',
      'requests',
      page,
      limit,
      status,
      filters.title,
      filters.client,
      filters.provider,
    ],
    queryFn: () => adminApi.getRequests(page, limit, status, filters),
    placeholderData: keepPreviousData,
  })
}

export function useRequest(id: string) {
  return useQuery<Request>({
    queryKey: ['admin', 'requests', id],
    queryFn: () => adminApi.getRequestById(id),
    enabled: !!id,
  })
}



