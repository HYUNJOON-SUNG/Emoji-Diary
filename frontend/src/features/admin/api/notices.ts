import { adminApiClient } from "@/shared/api/client"

const BASE_URL = "/notices"

/**
 * 공지사항 정보
 */
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

/**
 * 공지사항 목록 검색 조건
 */
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
    /**
     * 공지사항 목록 조회
     */
    getNotices: async (params: NoticeListParams): Promise<NoticeListResponse> => {
        const response = await adminApiClient.get(BASE_URL, {
            params: {
                page: params.page || 1,
                limit: params.size || 20,
            }
        })
        return response.data.data
    },

    /**
     * 공지사항 상세 조회
     */
    getNotice: async (id: string | number): Promise<Notice> => {
        const response = await adminApiClient.get(`${BASE_URL}/${id}`)
        return response.data.data
    },

    /**
     * 공지사항 생성
     */
    createNotice: async (data: Partial<Notice>): Promise<Notice> => {
        const response = await adminApiClient.post(BASE_URL, data)
        return response.data.data
    },

    /**
     * 공지사항 수정
     */
    updateNotice: async (id: string | number, data: Partial<Notice>): Promise<Notice> => {
        const response = await adminApiClient.put(`${BASE_URL}/${id}`, data)
        return response.data.data
    },

    /**
     * 공지사항 삭제
     */
    deleteNotice: async (id: string | number): Promise<void> => {
        await adminApiClient.delete(`${BASE_URL}/${id}`)
    },

    togglePin: async (id: string | number): Promise<Notice> => {
        throw new Error("Use updatePinStatus instead")
    },

    /**
     * 공지사항 고정 상태 변경
     */
    updatePinStatus: async (id: string | number, isPinned: boolean): Promise<Notice> => {
        const response = await adminApiClient.put(`${BASE_URL}/${id}/pin`, { isPinned })
        return response.data.data
    }
}
