import * as React from "react"
import { adminAuthApi, LoginResponse } from "../api/auth"

interface AdminUser {
    id: number
    email: string
    name: string
}

interface AdminAuthContextType {
    user: AdminUser | null
    accessToken: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    isAuthenticated: boolean
}

const AdminAuthContext = React.createContext<AdminAuthContextType | undefined>(
    undefined
)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<AdminUser | null>(null)
    const [accessToken, setAccessToken] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        // 초기 로드 시 로컬 스토리지 확인
        const storedToken = localStorage.getItem("admin_access_token")
        const storedUser = localStorage.getItem("admin_user")

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser))
                setAccessToken(storedToken)
            } catch (e) {
                console.error("Failed to parse stored user", e)
                localStorage.removeItem("admin_user")
                localStorage.removeItem("admin_access_token")
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        try {
            const response = await adminAuthApi.login(email, password)
            const { accessToken, refreshToken, admin } = response.data

            localStorage.setItem("admin_access_token", accessToken)
            localStorage.setItem("admin_refresh_token", refreshToken)
            localStorage.setItem("admin_user", JSON.stringify(admin))

            setAccessToken(accessToken)
            setUser(admin)
        } catch (error) {
            console.error("Login failed", error)
            throw error
        }
    }

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("admin_refresh_token")
            const token = localStorage.getItem("admin_access_token")

            if (token) {
                await adminAuthApi.logout(token)
            }
        } catch (error) {
            console.error("Logout failed", error)
        } finally {
            localStorage.removeItem("admin_access_token")
            localStorage.removeItem("admin_refresh_token")
            localStorage.removeItem("admin_user")
            setAccessToken(null)
            setUser(null)
        }
    }

    const value = {
        user,
        accessToken,
        isLoading,
        login,
        logout,
        isAuthenticated: !!accessToken,
    }

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    )
}

export function useAdminAuth() {
    const context = React.useContext(AdminAuthContext)
    if (context === undefined) {
        throw new Error("useAdminAuth must be used within a AdminAuthProvider")
    }
    return context
}
