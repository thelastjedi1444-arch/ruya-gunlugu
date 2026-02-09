"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

interface BottomTabBarProps {
    activeTab: "calendar" | "journal" | "stats" | "settings";
    onTabChange: (tab: "calendar" | "journal" | "stats" | "settings") => void;
    onNewDream: () => void;
}

export default function BottomTabBar({ activeTab, onTabChange, onNewDream }: BottomTabBarProps) {
    const { t } = useLanguage();

    const tabs = [
        { id: "calendar" as const, icon: CalendarIcon, label: t("calendar") || "Calendar" },
        { id: "journal" as const, icon: JournalIcon, label: t("journal") || "Journal" },
        { id: "stats" as const, icon: StatsIcon, label: t("stats") || "Stats" },
        { id: "settings" as const, icon: SettingsIcon, label: t("settings") || "Settings" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Background blur + gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-xl" />

            <div className="relative flex items-end justify-around px-4 pb-[env(safe-area-inset-bottom,8px)] pt-2">
                {/* Left tabs */}
                {tabs.slice(0, 2).map((tab) => (
                    <TabButton
                        key={tab.id}
                        icon={tab.icon}
                        label={tab.label as string}
                        isActive={activeTab === tab.id}
                        onClick={() => onTabChange(tab.id)}
                    />
                ))}

                {/* Center FAB */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onNewDream}
                    className="relative -top-4 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </motion.button>

                {/* Right tabs */}
                {tabs.slice(2).map((tab) => (
                    <TabButton
                        key={tab.id}
                        icon={tab.icon}
                        label={tab.label as string}
                        isActive={activeTab === tab.id}
                        onClick={() => onTabChange(tab.id)}
                    />
                ))}
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
            className="flex flex-col items-center gap-1 py-2 px-4"
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

function StatsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    );
}
