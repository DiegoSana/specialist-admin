'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, Review, ReviewStatus } from '@/lib/api/admin'
import type { ReviewFeatureInput } from '@specialist/shared'

// `status` filters the moderation queue (PENDING/APPROVED/REJECTED); omit for the default
// PENDING behavior this hook always had. Query key includes the filter so each status has its
// own cache entry, while `invalidateQueries({ queryKey: ['admin', 'reviews'] })` below still
// invalidates all of them via TanStack Query's prefix matching.
export function usePendingReviews(status?: ReviewStatus) {
  return useQuery<Review[]>({
    queryKey: ['admin', 'reviews', status ?? ReviewStatus.PENDING],
    queryFn: () => adminApi.getPendingReviews(status),
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
