import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/shared/lib/utils"
import {
    LayoutDashboard,
    Megaphone,
    Settings,
    AlertOctagon,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AdminButton } from "../ui/admin-button"

interface SidebarProps {
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
    onLogout: () => void
}

export function AdminSidebar({ collapsed, setCollapsed, onLogout }: SidebarProps) {
    const location = useLocation()

    const navItems = [
        {
            title: "서비스 통계",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "공지사항 관리",
            href: "/admin/notices",
            icon: Megaphone,
        },
        {
            title: "시스템 설정",
            href: "/admin/settings",
            icon: Settings,
        },
        {
            title: "에러 로그",
            href: "/admin/logs",
            icon: AlertOctagon,
        },
    ]

    return (
        <motion.div
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            className="relative flex h-screen flex-col border-r border-slate-200 bg-white/80 backdrop-blur-xl z-20 shadow-xl shadow-slate-200/50"
        >
            {/* Logo Area */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent whitespace-nowrap"
                        >
                            Emoji Diary
                        </motion.span>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-full p-1.5 hover:bg-slate-100 text-slate-500 transition-colors"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.href)
                    const Icon = item.icon

                    return (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavIndicator"
                                            className="absolute inset-0 bg-indigo-50 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}

                                    <div className="relative z-10 flex items-center gap-3 w-full">
                                        <Icon
                                            size={22}
                                            className={cn(
                                                "transition-colors",
                                                isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                                            )}
                                        />

                                        <AnimatePresence mode="wait">
                                            {!collapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: "auto" }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className="whitespace-nowrap"
                                                >
                                                    {item.title}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            )}
                        </NavLink>
                    )
                })}
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={() => {
                        if (window.confirm("정말 로그아웃 하시겠습니까?")) {
                            onLogout()
                        }
                    }}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors group",
                        collapsed && "justify-center"
                    )}
                >
                    <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="whitespace-nowrap"
                            >
                                로그아웃
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.div>
    )
}
