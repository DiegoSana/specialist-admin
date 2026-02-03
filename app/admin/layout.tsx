'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated } = useAdminAuth()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Don't redirect if already on login page
    if (pathname === '/admin/login') {
      return
    }

    // Only redirect after component is mounted
    if (!mounted) {
      return
    }

    // Check if there's a token first
    const token = localStorage.getItem('admin_token')
    
    // If no token, redirect immediately (don't wait for query)
    if (!token) {
      router.push('/admin/login')
      return
    }

    // Wait for auth check to complete only if token exists
    if (isLoading) {
      return
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, isLoading, pathname, router, mounted])

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null
  }

  // Show loading state
  if (isLoading && pathname !== '/admin/login') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render layout on login page
  if (pathname === '/admin/login' || !isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

