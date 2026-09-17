'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi, EmailProviderStatus } from '@/lib/api/admin'

export function useEmailStatus() {
  return useQuery<EmailProviderStatus>({
    queryKey: ['admin', 'notifications', 'email-status'],
    queryFn: () => adminApi.getEmailStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes — this only changes on a Fly redeploy
  })
}
