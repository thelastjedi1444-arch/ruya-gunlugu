"use client";

import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";
import { DreamMood } from "./MoodSelector";
import { useState } from "react";
import { Dream } from "@/lib/storage";

interface DreamDetailViewProps {
    dream: Dream | null;
    onClose: () => void;
    onInterpret: (dreamId: string) => Promise<void>;
}

export default function DreamDetailView({ dream, onClose, onInterpret }: DreamDetailViewProps) {
    const { t, language } = useLanguage();
    const [isInterpreting, setIsInterpreting] = useState(false);

    if (!dream) return null;

    const dateLocale = language === "tr" ? tr : enUS;

    const handleInterpretClick = async () => {
        setIsInterpreting(true);
        await onInterpret(dream.id);
        setIsInterpreting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,12px)+12px)] pb-4 bg-black/80 backdrop-blur-md sticky top-0 z-10">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="text-center">
                    <span className="block text-xs text-white/40 uppercase tracking-widest">
                        {format(parseISO(dream.date), "MMMM d, yyyy", { locale: dateLocale })}
                    </span>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-32">
                <h1 className="text-2xl font-serif text-white mb-6 leading-tight">
                    {dream.title || t("untitledDream")}
                </h1>

                {dream.mood && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
                        {/* You can verify mood icon here later */}
                        <span className="text-sm text-white/70 capitalize">{dream.mood}</span>
                    </div>
                )}

                <div className="prose prose-invert prose-lg max-w-none mb-12">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {dream.text}
                    </p>
                </div>

                {/* Interpretation Section */}
                <div className="border-t border-white/10 pt-8 mt-8">
                    <h3 className="text-lg font-serif text-purple-300 mb-4 flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                            <circle cx="12" cy="12" r="2" />
                        </svg>
                        {t("interpretation") || "Interpretation"}
                    </h3>

                    {dream.interpretation ? (
                        <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-6">
                            <p className="text-purple-100/80 leading-relaxed">
                                {dream.interpretation}
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handleInterpretClick}
                            disabled={isInterpreting}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isInterpreting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Interpreting...
                                </>
                            ) : (
                                <>
                                    <span>Interpret Dream</span>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
