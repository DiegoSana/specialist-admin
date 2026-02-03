'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { LoginDTO, AuthResponse } from '@specialist/shared'

export function useAdminAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Check if user is authenticated and is admin
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    // Only check localStorage after mount
    setHasToken(!!localStorage.getItem('admin_token'))
  }, [])

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('Not authenticated')
      }
      const userData = await authApi.getMe()
      
      // Check if user is admin
      if (!userData.isAdmin) {
        throw new Error('Not an admin user')
      }
      
      return userData
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: hasToken, // Only run if token exists and component is mounted
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginDTO) => {
      const response = await authApi.login(credentials)
      
      // Store token
      localStorage.setItem('admin_token', response.accessToken)
      
      // Verify user is admin
      if (!response.user.isAdmin) {
        localStorage.removeItem('admin_token')
        throw new Error('User is not an admin')
      }
      
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'me'] })
      router.push('/admin/dashboard')
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      authApi.logout()
    },
    onSuccess: () => {
      queryClient.clear()
      router.push('/admin/login')
    },
  })

  return {
    user,
    isLoading,
    isAuthenticated: !!user && user.isAdmin,
    error,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  }
}

