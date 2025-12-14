import { cn } from "@/shared/lib/utils"

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
