import * as React from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"

import { useAdminAuth } from "../../contexts/admin-auth-context"

export function AdminLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
    const navigate = useNavigate()
    const { logout } = useAdminAuth()

    const handleLogout = async () => {
        await logout()
        navigate("/admin/login")
    }

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
            <AdminSidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                onLogout={handleLogout}
            />
            <div className="flex flex-1 flex-col overflow-hidden relative">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
