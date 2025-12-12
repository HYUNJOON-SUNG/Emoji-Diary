import { adminApiClient } from "@/services/api"

const BASE_URL = "/auth"

export interface LoginResponse {
    success: boolean
    data: {
        accessToken: string
        refreshToken: string
        admin: {
            id: number
            email: string
            name: string
        }
    }
}

export interface RefreshResponse {
    success: boolean
    data: {
        accessToken: string
        refreshToken: string
    }
}

export const adminAuthApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await adminApiClient.post(BASE_URL + "/login", { email, password })
        return response.data
    },
    refresh: async (refreshToken: string): Promise<RefreshResponse> => {
        const response = await adminApiClient.post(BASE_URL + "/refresh", { refreshToken })
        return response.data
    },
    logout: async () => {
        await adminApiClient.post(BASE_URL + "/logout", {})
    },
}
