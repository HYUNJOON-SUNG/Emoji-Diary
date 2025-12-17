import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"
import { Loader2 } from "lucide-react"

/**
 * ====================================================================================================
 * AdminButton 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자 페이지 전용 버튼 컴포넌트
 * - shadcn/ui Button을 기반으로 관리자 페이지 테마에 맞게 커스터마이징
 * - 로딩 상태 (isLoading) 내장 지원
 * 
 * @variants
 * - default: 인디고 배경 (기본 액션)
 * - destructive: 빨간색 배경 (삭제 등 위험 액션)
 * - outline: 테두리만 있는 스타일
 * - secondary: 회색 배경 (보조 액션)
 * - ghost: 투명 배경 (호버 시 배경색)
 * - link: 링크 스타일
 * - glass: 유리 질감 (특수 목적)
 * 
 * ====================================================================================================
 */

const adminButtonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20",
                destructive:
                    "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
                outline:
                    "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                secondary:
                    "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800",
                ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                link: "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-500",
                glass: "bg-white/70 backdrop-blur-md border border-white/20 hover:bg-white/90 text-slate-800 shadow-sm",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface AdminButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof adminButtonVariants> {
    asChild?: boolean
    isLoading?: boolean
}

const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
    ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(adminButtonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </Comp>
        )
    }
)
AdminButton.displayName = "AdminButton"

export { AdminButton, adminButtonVariants }
