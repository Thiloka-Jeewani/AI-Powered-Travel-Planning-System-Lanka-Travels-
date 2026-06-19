import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

export interface InputProps extends React.ComponentProps<"input"> {
    error?: string;
    success?: boolean;
    icon?: React.ReactNode;
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, success, icon, variant = "default", size = "md", ...props }, ref) => {
        const sizeClasses = {
            sm: "h-8 px-3 text-sm",
            md: "h-10 px-3 py-2 text-base md:text-sm",
            lg: "h-12 px-4 py-3 text-lg md:text-base"
        };

        const variantClasses = {
            default: "border-input bg-background",
            outline: "border-2 border-orange-300 bg-transparent",
            ghost: "border-0 bg-transparent focus-visible:ring-0"
        };

        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex w-full rounded-md ring-offset-background",
                        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
                        "placeholder:text-muted-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-all duration-200",
                        sizeClasses[size],
                        variantClasses[variant],
                        icon && "pl-10",
                        error && "border-red-500 focus-visible:ring-red-200",
                        success && "border-green-500 focus-visible:ring-green-200",
                        className
                    )}
                    ref={ref}
                    {...props}
                />

                {error && (
                    <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>{error}</span>
                    </div>
                )}

                {success && !error && (
                    <div className="flex items-center gap-1 mt-1 text-green-500 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        <span>Valid</span>
                    </div>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };