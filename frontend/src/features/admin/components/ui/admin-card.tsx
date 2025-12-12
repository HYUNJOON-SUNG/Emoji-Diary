import * as React from "react"
import { cn } from "@/lib/utils"

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
