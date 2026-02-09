"use client";

import { motion } from "framer-motion";

interface MobileHeaderProps {
    title: string;
    mode?: "default" | "entry";
    onMenuClick?: () => void;
    onSearchClick?: () => void;
    onCancel?: () => void;
    onSave?: () => void;
    saveDisabled?: boolean;
}

export default function MobileHeader({
    title,
    mode = "default",
    onMenuClick,
    onSearchClick,
    onCancel,
    onSave,
    saveDisabled = false,
}: MobileHeaderProps) {
    if (mode === "entry") {
        return (
            <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                <div className="relative flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onCancel}
                        className="text-white/70 text-base font-medium"
                    >
                        Cancel
                    </motion.button>

                    <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                        {title}
                    </span>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onSave}
                        disabled={saveDisabled}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${saveDisabled
                                ? "bg-white/10 text-white/30"
                                : "bg-white text-black"
                            }`}
                    >
                        Save
                    </motion.button>
                </div>
            </header>
        );
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <div className="relative flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-white/60"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                </motion.button>

                <h1 className="text-lg font-semibold text-white">{title}</h1>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onSearchClick}
                    className="p-2 -mr-2 text-white/60"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                </motion.button>
            </div>
        </header>
    );
}
