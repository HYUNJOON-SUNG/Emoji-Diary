import { adminApiClient } from "@/services/api"

const BASE_URL = "/error-logs"

export type ErrorLevel = "INFO" | "WARN" | "ERROR"

export interface ErrorLogItem {
    id: number
    timestamp: string
    level: ErrorLevel
    message: string
    endpoint: string // Was requestPath/path in mock
    userId?: number
}

export interface ErrorLogSummary {
    error: number
    warn: number
    info: number
}

export interface ErrorLogListResponse {
    logs: ErrorLogItem[]
    total: number
    summary: ErrorLogSummary
}

export interface ErrorLogDetailResponse {
    id: number
    timestamp: string
    level: ErrorLevel
    message: string
    errorCode?: string
    endpoint: string
    userId?: number
    stackTrace?: string
}

export interface SystemErrorListParams {
    page?: number
    size?: number
    level?: string
    search?: string
    startDate?: string
    endDate?: string
}

export const systemErrorsApi = {
    getSystemErrors: async (params: SystemErrorListParams): Promise<ErrorLogListResponse> => {
        const response = await adminApiClient.get(BASE_URL, {
            params: {
                page: params.page || 1,
                limit: params.size || 20,
                level: params.level,
                search: params.search,
                startDate: params.startDate,
                endDate: params.endDate
            }
        })
        return response.data.data
    },

    getSystemError: async (id: number | string): Promise<ErrorLogDetailResponse> => {
        const response = await adminApiClient.get(`${BASE_URL}/${id}`)
        return response.data.data
    },
}
