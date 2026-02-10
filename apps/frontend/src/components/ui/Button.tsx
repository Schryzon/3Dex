import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'md', ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

        const variants = {
            default: "bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-600",
            primary: "bg-yellow-400 text-black hover:bg-yellow-300 focus:ring-yellow-500",
            secondary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
            ghost: "bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white focus:ring-gray-600",
            danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        }

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2 text-base",
            lg: "px-6 py-3 text-lg",
        }

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
