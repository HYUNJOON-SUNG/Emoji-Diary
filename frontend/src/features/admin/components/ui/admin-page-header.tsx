import { cn } from "@/shared/lib/utils"

/**
 * ====================================================================================================
 * AdminPageHeader 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자 페이지 상단 타이틀 및 액션 버튼 영
 * - 페이지 제목 및 간단한 설명 표시
 * - 우측 상단에 액션 버튼(예: 추가, 저장 등) 배치 지원
 * 
 * @props
 * - title: 페이지 제목 (필수)
 * - description: 페이지 설명 (선택)
 * - action: 우측 상단 액션 컴포넌트 (선택)
 * 
 * ====================================================================================================
 */

interface AdminPageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    action?: React.ReactNode
}

export function AdminPageHeader({
    title,
    description,
    action,
    className,
    ...props
}: AdminPageHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500",
                className
            )}
            {...props}
        >
            <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {title}
                </h1>
                {description && (
                    <p className="text-base text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                )}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
    )
}
