"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <div className="flex items-center gap-1 bg-[#1a1a1a] border border-white/10 rounded-full p-1 shadow-lg shadow-black/30 relative">
            <button
                onClick={() => setLanguage("tr")}
                onMouseEnter={() => setHovered("tr")}
                onMouseLeave={() => setHovered(null)}
                className={`group relative px-4 py-1.5 rounded-full text-xs font-bold tracking-widest transition-colors duration-300 ${language === "tr"
                    ? "text-white"
                    : "text-white/40 hover:text-white/80"
                    }`}
            >
                {/* Active Indicator */}
                {language === "tr" && (
                    <motion.div
                        layoutId="language-active"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}

                {/* Hover Indicator */}
                {hovered === "tr" && language !== "tr" && (
                    <motion.div
                        layoutId="language-hover"
                        className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    />
                )}

                <span className="relative z-10">TR</span>
            </button>

            <button
                onClick={() => setLanguage("en")}
                onMouseEnter={() => setHovered("en")}
                onMouseLeave={() => setHovered(null)}
                className={`group relative px-4 py-1.5 rounded-full text-xs font-bold tracking-widest transition-colors duration-300 ${language === "en"
                    ? "text-white"
                    : "text-white/40 hover:text-white/80"
                    }`}
            >
                {/* Active Indicator */}
                {language === "en" && (
                    <motion.div
                        layoutId="language-active"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}

                {/* Hover Indicator */}
                {hovered === "en" && language !== "en" && (
                    <motion.div
                        layoutId="language-hover"
                        className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    />
                )}

                <span className="relative z-10">EN</span>
            </button>
        </div>
    );
}
