'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi, DashboardStats } from '@/lib/api/admin'

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => adminApi.getDashboardStats(),
    staleTime: 30 * 1000, // 30 seconds
  })
}

