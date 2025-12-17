import * as React from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useLocation } from "react-router-dom"
import { useAdminAuth } from "../../contexts/admin-auth-context"
import { AdminCard, AdminCardContent, AdminCardDescription, AdminCardHeader, AdminCardTitle } from "../../components/ui/admin-card"
import { AdminInput } from "../../components/ui/admin-input"
import { AdminButton } from "../../components/ui/admin-button"
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminLoginPage() {
    const { login, isAuthenticated } = useAdminAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            const from = (location.state as any)?.from?.pathname || "/admin/dashboard"
            navigate(from, { replace: true })
        }
    }, [isAuthenticated, navigate, location])

    const { register, handleSubmit } = useForm({
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        setError(null)
        try {
            await login(data.email, data.password)
        } catch (err: any) {
            setError(err.response?.data?.message || "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-200/40 blur-3xl" />
            <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md px-4"
            >
                <AdminCard className="border-slate-200 shadow-xl bg-white/80 backdrop-blur-md">
                    <AdminCardHeader className="space-y-1 text-center">
                        <AdminCardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            Emoji Diary Admin
                        </AdminCardTitle>
                        <AdminCardDescription>
                            관리자 계정으로 로그인하세요
                        </AdminCardDescription>
                    </AdminCardHeader>
                    <AdminCardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                            <div className="space-y-2">
                                <AdminInput
                                    type="email"
                                    placeholder="아이디(이메일)를 입력하세요"
                                    icon={<Mail size={18} />}
                                    {...register("email", { required: true })}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <AdminInput
                                        type={showPassword ? "text" : "password"}
                                        placeholder="비밀번호를 입력하세요"
                                        icon={<Lock size={18} />}
                                        className="pr-10"
                                        {...register("password", { required: true })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <AdminButton
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                isLoading={isLoading}
                            >
                                로그인
                            </AdminButton>
                        </form>
                    </AdminCardContent>
                </AdminCard>
            </motion.div>
        </div>
    )
}
