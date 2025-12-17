import * as React from "react"
import { cn } from "@/shared/lib/utils"

/**
 * ====================================================================================================
 * AdminCard 컴포넌트
 * ====================================================================================================
 * 
 * @description
 * 관리자 페이지 전용 카드 컨테이너 컴포넌트
 * - 데이터를 섹션별로 구분하여 표시할 때 사용
 * - 배경 블러(backdrop-blur) 및 그림자 효과 적용
 * 
 * @components
 * - AdminCard: 메인 컨테이너
 * - AdminCardHeader: 헤더 영역 (Title, Description 포함)
 * - AdminCardTitle: 카드 제목
 * - AdminCardDescription: 카드 부가 설명
 * - AdminCardContent: 본문 영역
 * - AdminCardFooter: 하단 액션 영역
 * 
 * ====================================================================================================
 */

const AdminCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-950 shadow-sm transition-all hover:shadow-md",
            className
        )}
        {...props}
    />
))
AdminCard.displayName = "AdminCard"

const AdminCardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
AdminCardHeader.displayName = "AdminCardHeader"

const AdminCardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-2xl font-semibold leading-none tracking-tight text-slate-900",
            className
        )}
        {...props}
    />
))
AdminCardTitle.displayName = "AdminCardTitle"

const AdminCardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-500", className)}
        {...props}
    />
))
AdminCardDescription.displayName = "AdminCardDescription"

const AdminCardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
AdminCardContent.displayName = "AdminCardContent"

const AdminCardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
AdminCardFooter.displayName = "AdminCardFooter"

export {
    AdminCard,
    AdminCardHeader,
    AdminCardFooter,
    AdminCardTitle,
    AdminCardDescription,
    AdminCardContent,
}
