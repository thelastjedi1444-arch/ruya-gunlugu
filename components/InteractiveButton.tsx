"use client";

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { motion } from "framer-motion";

interface InteractiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    isLoading?: boolean;
    variant?: "primary" | "secondary" | "ghost";
}

const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(
    ({ children, isLoading = false, variant = "secondary", className = "", disabled, ...props }, ref) => {
        const baseStyles = "touch-manipulation select-none";

        const variantStyles = {
            primary: "bg-white text-black hover:bg-white/90",
            secondary: "bg-[#1a1a1a] border border-white/10 text-white hover:bg-[#262626]",
            ghost: "bg-transparent border border-[#262626] text-muted hover:border-white/20 hover:text-white hover:bg-[#111]",
        };

        return (
            <motion.button
                ref={ref as any}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                disabled={disabled || isLoading}
                className={`${baseStyles} ${variantStyles[variant]} ${className} ${(disabled || isLoading) ? "opacity-50 cursor-not-allowed" : ""} transition-all`}
                {...(props as any)}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        <span className="sr-only">Loading...</span>
                    </div>
                ) : (
                    children
                )}
            </motion.button>
        );
    }
);

InteractiveButton.displayName = "InteractiveButton";

export default InteractiveButton;
