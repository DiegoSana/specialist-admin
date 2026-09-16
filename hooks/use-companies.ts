'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, Company } from '@/lib/api/admin'

export function useCompany(id: string) {
  return useQuery<Company>({
    queryKey: ['admin', 'companies', id],
    queryFn: () => adminApi.getCompanyById(id),
    enabled: !!id,
  })
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateCompanyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] })
    },
  })
}



