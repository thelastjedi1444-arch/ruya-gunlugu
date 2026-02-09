"use client";

import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";
import { DreamMood } from "./MoodSelector";

interface DreamListItemProps {
    id: string;
    title: string;
    preview: string;
    date: string;
    mood?: DreamMood;
    hasInterpretation?: boolean;
    onClick: () => void;
}

export default function DreamListItem({
    id,
    title,
    preview,
    date,
    mood,
    hasInterpretation,
    onClick,
}: DreamListItemProps) {
    const { language } = useLanguage();
    const dateLocale = language === "tr" ? tr : enUS;
    const parsedDate = parseISO(date);
    const timeString = format(parsedDate, "HH:mm", { locale: dateLocale });

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full flex items-start gap-4 p-4 bg-[#111] rounded-2xl border border-white/5 text-left active:bg-white/5 transition-colors"
        >
            {/* Mood Icon */}
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <MoodIcon mood={mood} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">{title}</h3>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider flex-shrink-0">
                        {timeString}
                    </span>
                </div>
                <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
                    {preview}
                </p>
            </div>
        </motion.button>
    );
}

function MoodIcon({ mood }: { mood?: DreamMood }) {
    const iconClass = "w-5 h-5 text-white/40";

    switch (mood) {
        case "peaceful":
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17.5 19a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM8.5 14a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
                </svg>
            );
        case "vivid":
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                </svg>
            );
        case "anxious":
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17.7 7.7a7.5 7.5 0 10-11.4 0M9 12c1.5-2 4.5-2 6 0M12 16v2" />
                </svg>
            );
        case "strange":
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
            );
        case "dark":
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
            );
        default:
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                </svg>
            );
    }
}
