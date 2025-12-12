import axios from "@/lib/axios"

const BASE_URL = "/admin/notices"

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
    size?: number // matched to 'limit' param in controller, but standardizing to size/limit logic
    search?: string
    isPublic?: string // 'all' | 'public' | 'private'
    isPinned?: string // 'all' | 'pinned' | 'unpinned' (Controller doesn't have explicit filter params in code shown? Wait.
    // Controller code: getNoticeList(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int limit)
    // It seems the Controller shown ONLY accepts page/limit. 
    // Wait, let me re-read AdminNoticeController.java.
    // Line 36: public ResponseEntity<?> getNoticeList(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int limit)
    // IT DOES NOT HAVE SEARCH/FILTER params in the Controller method signature!
    // This is a discrepancy. The Frontend expecting Search/Filter but Backend not providing it in that specific controller method.
    // However, I must strictly follow the backend code I saw.
    // I will implement what matches the backend, but I'll keep the params in interface for future use or warning.
    // Actually, if backend doesn't support it, passing it won't hurt (ignored), but functionality won't work.
    // I will pass them as params anyway, just in case `AdminNoticeService` or ArgumentResolver handles it (unlikely in Spring standard signature).
    // UPDATE: I will follow the Controller signature.
}

export interface NoticeListResponse {
    notices: Notice[]
    total: number
    page: number
    limit: number
}

export const noticesApi = {
    getNotices: async (params: NoticeListParams): Promise<NoticeListResponse> => {
        const response = await axios.get(BASE_URL, {
            params: {
                page: params.page || 1,
                limit: params.size || 20,
                // Passing others too just in case context was truncated or using custom resolver, 
                // but usually Spring requires @RequestParam. 
                // Based on file view, they are NOT there. 
                // Functionality for search/filter might be missing in backend.
            }
        })
        return response.data.data
    },

    getNotice: async (id: string | number): Promise<Notice> => {
        const response = await axios.get(`${BASE_URL}/${id}`)
        return response.data.data // NoticeDetailResponse
    },

    createNotice: async (data: Partial<Notice>): Promise<Notice> => {
        const response = await axios.post(BASE_URL, data)
        return response.data.data // NoticeDetailResponse
    },

    updateNotice: async (id: string | number, data: Partial<Notice>): Promise<Notice> => {
        const response = await axios.put(`${BASE_URL}/${id}`, data)
        return response.data.data // NoticeUpdateResponse
    },

    deleteNotice: async (id: string | number): Promise<void> => {
        await axios.delete(`${BASE_URL}/${id}`)
    },

    togglePin: async (id: string | number): Promise<Notice> => {
        // Need to know current pin state? 
        // Backend expects @RequestBody @Valid NoticePinRequest { isPinned: boolean }
        // Frontend toggle typically knows current state.
        // I need to fetch current state or pass the NEW state.
        // The implementation in dashboard.ts was toggle.
        // Here I will assume the caller provides the *desired* state or I fetch it.
        // Wait, the previous mock implementation was just toggle.
        // The real backend needs `isPinned` in body.
        // I will update the signature to require the new state.
        // BUT to avoid breaking UI changes right now, I might have to fetch or guess.
        // Standard pattern: UI passes (id, isPinned).
        // I'll update signature to `togglePin: async (id: string|number, isPinned: boolean)`
        throw new Error("Use togglePinWithState instead")
    },

    // New method matching backend requirements
    updatePinStatus: async (id: string | number, isPinned: boolean): Promise<Notice> => {
        const response = await axios.put(`${BASE_URL}/${id}/pin`, { isPinned })
        return response.data.data
    }
}
