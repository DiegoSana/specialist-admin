'use client'

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
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

// The PUT /admin/requests/:id/status response is a flatter DTO shape than what
// GET /admin/requests/:id returns (which useRequest/the detail page render from) — don't
// merge it into the query cache. Just invalidate so the page refetches via the GET endpoint.
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
      statusReason,
    }: {
      id: string
      status: string
      statusReason?: string
    }) => adminApi.updateRequestStatus(id, status, statusReason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'requests'] })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'requests', variables.id],
      })
    },
  })
}

