import { api } from '@/lib/api'

export interface DashboardStats {
  users: {
    total: number
    newLast7Days: number
    newLast30Days: number
    activeLast30Days: number
  }
  requests: {
    total: number
    byStatus: {
      PENDING: number
      ACCEPTED: number
      IN_PROGRESS: number
      DONE: number
      CANCELLED: number
    }
    newLast7Days: number
    newLast30Days: number
  }
  professionals: {
    total: number
    verified: number
    pending: number
    suspended: number
  }
  companies: {
    total: number
    verified: number
    pending: number
    suspended: number
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  status: string
  createdAt: string
  updatedAt: string
  hasClientProfile: boolean
  hasProfessionalProfile: boolean
  isAdmin: boolean
}

export interface Request {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
  clientId: string
  client?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  address?: string | null
  photos?: string[]
  trade?: {
    id: string
    name: string
  }
}

export interface Professional {
  id: string
  userId: string
  status: string
  tradeId: string
  trade?: {
    id: string
    name: string
  }
  user?: User
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  userId: string
  status: string
  name: string
  user?: User
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const adminApi = {
  // Dashboard stats (we'll calculate from existing endpoints for now)
  getDashboardStats: async (): Promise<DashboardStats> => {
    // For now, we'll fetch users and calculate basic stats
    // In the future, this should be a dedicated endpoint
    const [usersRes] = await Promise.all([
      api.get<PaginatedResponse<User>>('/admin/users?limit=1000'),
    ])

    const users = usersRes.data.data
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const newLast7Days = users.filter(
      (u) => new Date(u.createdAt) >= last7Days,
    ).length
    const newLast30Days = users.filter(
      (u) => new Date(u.createdAt) >= last30Days,
    ).length
    const activeLast30Days = users.filter(
      (u) => u.status === 'ACTIVE' && new Date(u.updatedAt) >= last30Days,
    ).length

    return {
      users: {
        total: usersRes.data.total,
        newLast7Days,
        newLast30Days,
        activeLast30Days,
      },
      requests: {
        total: 0,
        byStatus: {
          PENDING: 0,
          ACCEPTED: 0,
          IN_PROGRESS: 0,
          DONE: 0,
          CANCELLED: 0,
        },
        newLast7Days: 0,
        newLast30Days: 0,
      },
      professionals: {
        total: 0,
        verified: 0,
        pending: 0,
        suspended: 0,
      },
      companies: {
        total: 0,
        verified: 0,
        pending: 0,
        suspended: 0,
      },
    }
  },

  // Users
  getUsers: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<User>>(
      `/admin/users?page=${page}&limit=${limit}`,
    )
    return response.data
  },

  getUserById: async (id: string) => {
    const response = await api.get<User>(`/admin/users/${id}`)
    return response.data
  },

  updateUserStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/users/${id}/status`, { status })
    return response.data
  },

  // Requests (using admin endpoint)
  getRequests: async (page = 1, limit = 10, status?: string) => {
    let url = `/admin/requests?page=${page}&limit=${limit}`
    if (status) {
      url += `&status=${status}`
    }
    const response = await api.get(url)
    
    // Transform backend response format to match our interface
    const backendData = response.data
    return {
      data: backendData.data || [],
      total: backendData.meta?.total || 0,
      page: backendData.meta?.page || page,
      limit: backendData.meta?.limit || limit,
      totalPages: backendData.meta?.totalPages || 0,
    }
  },

  getRequestById: async (id: string) => {
    const response = await api.get<Request>(`/requests/${id}`)
    return response.data
  },

  // Professionals
  getProfessionals: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<Professional>>(
      `/admin/professionals?page=${page}&limit=${limit}`,
    )
    return response.data
  },

  getProfessionalById: async (id: string) => {
    const response = await api.get<Professional>(`/admin/professionals/${id}`)
    return response.data
  },

  updateProfessionalStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/professionals/${id}/status`, {
      status,
    })
    return response.data
  },

  // Companies
  getCompanies: async (page = 1, limit = 10) => {
    const response = await api.get<PaginatedResponse<Company>>(
      `/admin/companies?page=${page}&limit=${limit}`,
    )
    return response.data
  },

  getCompanyById: async (id: string) => {
    const response = await api.get<Company>(`/admin/companies/${id}`)
    return response.data
  },
}
