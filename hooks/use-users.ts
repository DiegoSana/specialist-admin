'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, User, PaginatedResponse } from '@/lib/api/admin'

export function useUsers(page = 1, limit = 10) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: ['admin', 'users', page, limit],
    queryFn: () => adminApi.getUsers(page, limit),
  })
}

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminApi.getUserById(id),
    enabled: !!id,
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useUpdateUserVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      emailVerified,
      phoneVerified,
    }: {
      id: string
      emailVerified?: boolean
      phoneVerified?: boolean
    }) => adminApi.updateUserVerification(id, { emailVerified, phoneVerified }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users', variables.id],
      })
    },
  })
}



