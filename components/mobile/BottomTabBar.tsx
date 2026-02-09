"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

interface BottomTabBarProps {
    activeTab: "calendar" | "journal" | "interpret";
    onTabChange: (tab: "calendar" | "journal" | "interpret") => void;
    onNewDream: () => void;
}

export default function BottomTabBar({ activeTab, onTabChange, onNewDream }: BottomTabBarProps) {
    const { t } = useLanguage();

    const tabs = [
        { id: "journal" as const, icon: JournalIcon, label: t("journal") || "Journal" },
        { id: "calendar" as const, icon: CalendarIcon, label: t("calendar") || "Calendar" },
        { id: "interpret" as const, icon: SparklesIcon, label: t("interpretation") || "Interpret" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Background blur + gradient - BUILD_v1.1 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-xl" />

            <div className="relative flex items-end justify-between px-6 pb-[env(safe-area-inset-bottom,8px)] pt-2">
                {/* Journal */}
                <TabButton
                    icon={tabs[0].icon}
                    label={tabs[0].label as string}
                    isActive={activeTab === tabs[0].id}
                    onClick={() => onTabChange(tabs[0].id)}
                />

                {/* Calendar */}
                <TabButton
                    icon={tabs[1].icon}
                    label={tabs[1].label as string}
                    isActive={activeTab === tabs[1].id}
                    onClick={() => onTabChange(tabs[1].id)}
                />

                {/* New Dream FAB - Center */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onNewDream}
                    className="relative -top-5 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/10"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </motion.button>

                {/* Interpret */}
                <TabButton
                    icon={tabs[2].icon}
                    label={tabs[2].label as string}
                    isActive={activeTab === tabs[2].id}
                    onClick={() => onTabChange(tabs[2].id)}
                />

                {/* Empty slot for balance if needed, or just 3 tabs + FAB */}
                <div className="w-12" />
            </div>
        </div>
    );
}

function TabButton({
    icon: Icon,
    label,
    isActive,
    onClick
}: {
    icon: React.FC<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="flex flex-col items-center gap-1 py-2 px-2 min-w-[64px]"
        >
            <Icon className={`w-6 h-6 transition-colors ${isActive ? "text-blue-500" : "text-white/40"}`} />
            <span className={`text-[10px] uppercase tracking-wider font-medium transition-colors ${isActive ? "text-blue-500" : "text-white/40"}`}>
                {label}
            </span>
        </motion.button>
    );
}

// Icons
function CalendarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}

function JournalIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5z" />
            <path d="M8 7h8M8 11h6" />
        </svg>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
    );
}
