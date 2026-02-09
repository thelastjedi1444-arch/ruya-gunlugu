"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

export type DreamMood = "peaceful" | "vivid" | "anxious" | "strange" | "dark";

interface MoodSelectorProps {
    selectedMood?: DreamMood;
    onSelect: (mood: DreamMood) => void;
}

const moods: { id: DreamMood; icon: React.FC<{ className?: string; filled?: boolean }>; labelKey: string }[] = [
    { id: "peaceful", icon: PeacefulIcon, labelKey: "moodPeaceful" },
    { id: "vivid", icon: VividIcon, labelKey: "moodVivid" },
    { id: "anxious", icon: AnxiousIcon, labelKey: "moodAnxious" },
    { id: "strange", icon: StrangeIcon, labelKey: "moodStrange" },
    { id: "dark", icon: DarkIcon, labelKey: "moodDark" },
];

export default function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-3">
            <span className="text-xs text-white/60 uppercase tracking-widest font-bold block mb-4 mt-2">
                {t("moodOfDream")}
            </span>
            <div className="grid grid-cols-5 gap-3 w-full">
                {moods.map((mood) => {
                    const isSelected = selectedMood === mood.id;
                    const Icon = mood.icon;
                    return (
                        <motion.button
                            key={mood.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect(mood.id)}
                            className="flex flex-col items-center gap-2 w-full"
                        >
                            <motion.div
                                animate={{
                                    backgroundColor: isSelected ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.05)",
                                    scale: isSelected ? 1 : 0.95,
                                }}
                                className="w-full aspect-square rounded-2xl flex items-center justify-center"
                            >
                                <Icon
                                    className={`w-8 h-8 transition-colors ${isSelected ? "text-black" : "text-white/40"}`}
                                    filled={isSelected}
                                />
                            </motion.div>
                            <span className={`text-[10px] uppercase tracking-wider font-medium transition-colors ${isSelected ? "text-white" : "text-white/40"
                                }`}>
                                {(t(mood.labelKey as any) as string) || mood.id}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

// Mood Icons
function PeacefulIcon({ className, filled }: { className?: string; filled?: boolean }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM8.5 14a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
        </svg>
    );
}

function VividIcon({ className, filled }: { className?: string; filled?: boolean }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            <path d="M5 19l1 2 2-1-1-2-2 1zM17 17l1.5 3 3-1.5-1.5-3-3 1.5z" />
        </svg>
    );
}

function AnxiousIcon({ className, filled }: { className?: string; filled?: boolean }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.7 7.7a7.5 7.5 0 10-11.4 0" />
            <path d="M9 12c1.5-2 4.5-2 6 0" />
            <path d="M12 16v2" />
        </svg>
    );
}

function StrangeIcon({ className, filled }: { className?: string; filled?: boolean }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function DarkIcon({ className, filled }: { className?: string; filled?: boolean }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
    );
}
