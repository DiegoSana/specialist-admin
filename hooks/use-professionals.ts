'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, Professional } from '@/lib/api/admin'

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'professionals'] })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'professionals', variables.id],
      })
    },
  })
}
