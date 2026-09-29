'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi, AdminVerificationConfig } from '@/lib/api/admin'

export function useVerificationConfig() {
  return useQuery<AdminVerificationConfig>({
    queryKey: ['admin', 'verification', 'config'],
    queryFn: () => adminApi.getVerificationConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes — this rarely changes
  })
}
