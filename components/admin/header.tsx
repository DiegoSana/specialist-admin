'use client'

import { useAdminAuth } from '@/hooks/use-admin-auth'
import { LogOut, User } from 'lucide-react'

interface AdminHeaderProps {
  user: any
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { logout } = useAdminAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User className="h-4 w-4" />
          <span>
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-gray-500">({user?.email})</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  )
}

