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
  hasCompanyProfile?: boolean
  isAdmin: boolean
  emailVerified?: boolean
  phoneVerified?: boolean
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
  bio?: string | null
  city: string
  zone?: string | null
  address?: string | null
  phone?: string | null
  whatsapp?: string | null
  website?: string | null
  profileImage?: string | null
  gallery: string[]
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    status: string
  }
  trades?: Array<{
    trade: {
      id: string
      name: string
    }
    isPrimary?: boolean
  }>
  serviceProvider?: {
    id: string
    averageRating: number | null
    totalReviews: number
  }
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  userId: string
  status: string
  companyName: string
  name?: string // Alias for companyName
  taxId?: string | null
  description?: string | null
  address?: string | null
  city?: string | null
  phone?: string | null
  website?: string | null
  user?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    phone?: string | null
    status: string
  }
  trades?: Array<{
    trade: {
      id: string
      name: string
    }
  }>
  serviceProvider?: {
    id: string
    averageRating: number
    totalReviews: number
  }
  createdAt: string
  updatedAt?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AdminWhatsAppConfig {
  devMode: boolean
  availableFollowUpRules?: string[]
}

export interface WhatsAppConversationSummary {
  requestId: string
  requestTitle: string
  requestStatus: string
  clientName: string
  providerName: string | null
  lastMessagePreview: string
  lastMessageAt: string
  lastMessageDirection: string
  lastMessageStatus: string
}

export interface WhatsAppInteraction {
  id: string
  requestId: string
  interactionType: 'FOLLOW_UP' | 'RESPONSE' | 'STATUS_UPDATE'
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'RESPONDED' | 'FAILED'
  direction: 'TO_CLIENT' | 'TO_PROVIDER'
  channel: string
  messageTemplate: string
  messageContent: string
  responseContent: string | null
  responseIntent: string | null
  scheduledFor: string
  sentAt: string | null
  deliveredAt: string | null
  respondedAt: string | null
  twilioMessageSid: string | null
  twilioStatus: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export const adminApi = {
  // Dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/admin/dashboard/stats')
    return response.data
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

  updateUserVerification: async (
    id: string,
    data: { emailVerified?: boolean; phoneVerified?: boolean },
  ) => {
    const response = await api.put<User>(`/admin/users/${id}/verification`, data)
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
    const response = await api.get(`/admin/professionals?page=${page}&limit=${limit}`)
    
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
    const response = await api.get(`/admin/companies?page=${page}&limit=${limit}`)
    
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

  getCompanyById: async (id: string) => {
    const response = await api.get<Company>(`/admin/companies/${id}`)
    return response.data
  },

  updateCompanyStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/companies/${id}/status`, {
      status,
    })
    return response.data
  },

  // WhatsApp conversations
  getWhatsAppConfig: async (): Promise<AdminWhatsAppConfig> => {
    const response = await api.get<AdminWhatsAppConfig>('/admin/whatsapp/config')
    return response.data
  },

  getWhatsAppConversations: async (
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<PaginatedResponse<WhatsAppConversationSummary>> => {
    let url = `/admin/whatsapp/conversations?page=${page}&limit=${limit}`
    if (search) {
      url += `&search=${encodeURIComponent(search)}`
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

  getWhatsAppThread: async (requestId: string): Promise<WhatsAppInteraction[]> => {
    const response = await api.get<WhatsAppInteraction[]>(
      `/admin/whatsapp/conversations/${requestId}`,
    )
    return response.data
  },

  simulateWhatsAppReply: async (
    requestId: string,
    body: string,
  ): Promise<WhatsAppInteraction | null> => {
    const response = await api.post<WhatsAppInteraction | null>(
      `/admin/whatsapp/conversations/${requestId}/simulate-reply`,
      { body },
    )
    return response.data
  },

  triggerWhatsAppFollowUp: async (
    requestId: string,
    ruleName: string,
  ): Promise<{ interactionId: string }> => {
    const response = await api.post<{ interactionId: string }>(
      `/admin/whatsapp/conversations/${requestId}/trigger-followup`,
      { ruleName },
    )
    return response.data
  },
}
