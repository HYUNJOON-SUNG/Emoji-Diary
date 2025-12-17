import { User } from "lucide-react"
import { useAdminAuth } from "../../contexts/admin-auth-context"

export function AdminHeader() {
    const { user } = useAdminAuth()

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl z-10">
            <div className="flex items-center gap-4">
                {/* Breadcrumbs or Page Title could go here dynamically */}
                <div className="text-sm text-slate-500 font-medium">
                    관리자 콘솔
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Icons removed as per user request */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-sm font-semibold text-slate-900">{user?.name || "관리자 A"}</span>
                        <span className="text-xs text-slate-500">Admin</span>
                    </div>

                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 ring-2 ring-white shadow-sm">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    )
}
