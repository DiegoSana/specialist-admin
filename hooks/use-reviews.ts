'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, Review } from '@/lib/api/admin'

export function usePendingReviews() {
  return useQuery<Review[]>({
    queryKey: ['admin', 'reviews', 'pending'],
    queryFn: adminApi.getPendingReviews,
  })
}

export function useApproveReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
  })
}

export function useRejectReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.rejectReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
  })
}
