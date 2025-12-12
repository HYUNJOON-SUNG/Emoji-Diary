import { adminApiClient } from "@/services/api"

const BASE_URL = "/notices"

export interface Notice {
    id: number
    title: string
    content: string
    author: string
    createdAt: string
    views: number
    isPublic: boolean
    isPinned: boolean
}

export interface NoticeListParams {
    page?: number
    size?: number
    search?: string
    isPublic?: string
    isPinned?: string
}

export interface NoticeListResponse {
    notices: Notice[]
    total: number
    page: number
    limit: number
}

export const noticesApi = {
    getNotices: async (params: NoticeListParams): Promise<NoticeListResponse> => {
        const response = await adminApiClient.get(BASE_URL, {
            params: {
                page: params.page || 1,
                limit: params.size || 20,
            }
        })
        return response.data.data
    },

    getNotice: async (id: string | number): Promise<Notice> => {
        const response = await adminApiClient.get(`${BASE_URL}/${id}`)
        return response.data.data
    },

    createNotice: async (data: Partial<Notice>): Promise<Notice> => {
        const response = await adminApiClient.post(BASE_URL, data)
        return response.data.data
    },

    updateNotice: async (id: string | number, data: Partial<Notice>): Promise<Notice> => {
        const response = await adminApiClient.put(`${BASE_URL}/${id}`, data)
        return response.data.data
    },

    deleteNotice: async (id: string | number): Promise<void> => {
        await adminApiClient.delete(`${BASE_URL}/${id}`)
    },

    togglePin: async (id: string | number): Promise<Notice> => {
        throw new Error("Use updatePinStatus instead")
    },

    updatePinStatus: async (id: string | number, isPinned: boolean): Promise<Notice> => {
        const response = await adminApiClient.put(`${BASE_URL}/${id}/pin`, { isPinned })
        return response.data.data
    }
}
