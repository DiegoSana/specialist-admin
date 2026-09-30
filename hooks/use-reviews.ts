'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, Review } from '@/lib/api/admin'
import type { ReviewFeatureInput } from '@specialist/shared'

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

export function useFeatureReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string } & ReviewFeatureInput) =>
      adminApi.featureReview(id, { isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
  })
}
