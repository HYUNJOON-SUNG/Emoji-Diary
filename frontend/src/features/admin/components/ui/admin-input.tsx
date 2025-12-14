import * as React from "react"
import { cn } from "@/shared/lib/utils"

export interface AdminInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode
}

const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
    ({ className, type, icon, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-10 w-full rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                        icon && "pl-10",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
AdminInput.displayName = "AdminInput"

export { AdminInput }
