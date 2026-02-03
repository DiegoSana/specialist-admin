'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, Professional, PaginatedResponse } from '@/lib/api/admin'

export function useProfessionals(page = 1, limit = 10) {
  return useQuery<PaginatedResponse<Professional>>({
    queryKey: ['admin', 'professionals', page, limit],
    queryFn: () => adminApi.getProfessionals(page, limit),
  })
}

export function useProfessional(id: string) {
  return useQuery<Professional>({
    queryKey: ['admin', 'professionals', id],
    queryFn: () => adminApi.getProfessionalById(id),
    enabled: !!id,
  })
}

export function useUpdateProfessionalStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateProfessionalStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'professionals'] })
    },
  })
}

