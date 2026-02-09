"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

interface BottomTabBarProps {
    activeTab: "calendar" | "journal" | "interpret" | "settings";
    onTabChange: (tab: "calendar" | "journal" | "interpret" | "settings") => void;
    onNewDream: () => void;
}

export default function BottomTabBar({ activeTab, onTabChange, onNewDream }: BottomTabBarProps) {
    const { t } = useLanguage();

    const tabs = [
        { id: "journal" as const, icon: JournalIcon, label: t("journal") || "Journal" },
        { id: "calendar" as const, icon: CalendarIcon, label: t("calendar") || "Calendar" },
        { id: "interpret" as const, icon: SparklesIcon, label: t("interpretation") || "Interpret" },
        { id: "settings" as const, icon: SettingsIcon, label: t("settings") || "Settings" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden overflow-visible">
            {/* Glossy top border - BUILD_v1.2 */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent shadow-[0_-1px_10px_rgba(255,255,255,0.05)]" />

            {/* Background: Pure black for OLED + Strong backdrop blur */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />

            <div className="relative flex items-center justify-between px-4 pb-[env(safe-area-inset-bottom,12px)] pt-3 max-w-lg mx-auto">
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

                {/* New Dream FAB - Modern Floating Design */}
                <div className="relative -mt-12 mb-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={onNewDream}
                        className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] border border-white/20 transform -rotate-1 relative z-10"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-blue-400/20 blur-xl -z-10 animate-pulse" />
                    </motion.button>
                </div>

                {/* Interpret */}
                <TabButton
                    icon={tabs[2].icon}
                    label={tabs[2].label as string}
                    isActive={activeTab === tabs[2].id}
                    onClick={() => onTabChange(tabs[2].id)}
                />

                {/* Settings */}
                <TabButton
                    icon={tabs[3].icon}
                    label={tabs[3].label as string}
                    isActive={activeTab === tabs[3].id}
                    onClick={() => onTabChange(tabs[3].id)}
                />
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
            className="flex flex-col items-center gap-1.5 py-1 px-2 min-w-[64px] relative"
        >
            <Icon className={`w-6 h-6 transition-all duration-300 ${isActive ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "text-white/30"}`} />
            <span className={`text-[10px] uppercase tracking-widest font-bold transition-all duration-300 ${isActive ? "text-white" : "text-white/20"}`}>
                {label}
            </span>
            {isActive && (
                <motion.div
                    layoutId="tab-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_4px_rgba(96,165,250,0.8)]"
                />
            )}
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

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    );
}
