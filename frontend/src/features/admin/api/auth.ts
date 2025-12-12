import axios from "@/lib/axios"

const BASE_URL = "/admin/auth"

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
        const response = await axios.post(BASE_URL + "/login", { email, password })
        return response.data
    },
    refresh: async (refreshToken: string): Promise<RefreshResponse> => {
        const response = await axios.post(BASE_URL + "/refresh", { refreshToken })
        return response.data
    },
    logout: async (token: string) => {
        await axios.post(
            BASE_URL + "/logout",
            {}, // Empty body as backend ignores it
            { headers: { Authorization: `Bearer ${token}` } }
        )
    },
}
