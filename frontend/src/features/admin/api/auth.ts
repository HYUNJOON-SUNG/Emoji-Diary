import { adminApiClient } from "@/shared/api/client"

/**
 * 기본 인증 API URL
 */
const BASE_URL = "/auth"

/**
 * 관리자 로그인 응답 데이터
 */
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

/**
 * 토큰 갱신 응답 데이터
 */
export interface RefreshResponse {
    success: boolean
    data: {
        accessToken: string
        refreshToken: string
    }
}

/**
 * 관리자 인증 API
 * - 로그인, 토큰 갱신, 로그아웃 기능 제공
 */
export const adminAuthApi = {
    /**
     * 관리자 로그인
     * @param email - 이메일
     * @param password - 비밀번호
     * @returns 로그인 성공 시 토큰 및 관리자 정보 반환
     */
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await adminApiClient.post(BASE_URL + "/login", { email, password })
        return response.data
    },

    /**
     * 액세스 토큰 갱신
     * @param refreshToken - 리프레시 토큰
     * @returns 새로운 액세스 토큰 및 리프레시 토큰 반환
     */
    refresh: async (refreshToken: string): Promise<RefreshResponse> => {
        const response = await adminApiClient.post(BASE_URL + "/refresh", { refreshToken })
        return response.data
    },

    /**
     * 관리자 로그아웃
     * - 서버 측 세션 또는 쿠키 정리 (필요 시)
     */
    logout: async () => {
        await adminApiClient.post(BASE_URL + "/logout", {})
    },
}
