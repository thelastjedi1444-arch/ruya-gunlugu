"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";
import MobileHeader from "./MobileHeader";
import MoodSelector, { DreamMood } from "./MoodSelector";

interface DreamEntryViewProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dream: { text: string; mood?: DreamMood }) => void;
    initialText?: string;
    initialMood?: DreamMood;
}

export default function DreamEntryView({
    isOpen,
    onClose,
    onSave,
    initialText = "",
    initialMood,
}: DreamEntryViewProps) {
    const { t, language } = useLanguage();
    const [text, setText] = useState(initialText);
    const [mood, setMood] = useState<DreamMood | undefined>(initialMood);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dateLocale = language === "tr" ? tr : enUS;

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 300);
        }
    }, [isOpen]);

    useEffect(() => {
        setText(initialText);
        setMood(initialMood);
    }, [initialText, initialMood]);

    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    const handleSave = () => {
        if (text.trim()) {
            onSave({ text: text.trim(), mood });
            setText("");
            setMood(undefined);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed inset-0 z-[100] bg-black md:hidden flex flex-col"
                >
                    {/* Header */}
                    <MobileHeader
                        title={t("newEntry") as string || "NEW ENTRY"}
                        mode="entry"
                        onCancel={onClose}
                        onSave={handleSave}
                        saveDisabled={!text.trim()}
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto pt-[calc(env(safe-area-inset-top,12px)+56px)] pb-20 px-5">
                        {/* Date Display */}
                        <div className="mb-6">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">
                                {format(new Date(), "MMMM yyyy", { locale: dateLocale }).toUpperCase()}
                            </p>
                            <h2 className="text-2xl font-bold text-white">
                                {format(new Date(), "EEEE, MMM d", { locale: dateLocale })}
                            </h2>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10 mb-6" />

                        {/* Mood Selector */}
                        <div className="mb-6">
                            <MoodSelector selectedMood={mood} onSelect={setMood} />
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10 mb-6" />

                        {/* Narrative */}
                        <div className="flex-1">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold block mb-3">
                                {t("theNarrative") || "THE NARRATIVE"}
                            </span>
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={t("dreamPlaceholder") as string || "I found myself walking through a forest of glass..."}
                                className="w-full bg-transparent text-white/80 text-lg leading-relaxed placeholder:text-white/20 resize-none focus:outline-none min-h-[200px]"
                            />
                        </div>
                    </div>

                    {/* Bottom Toolbar */}
                    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/5">
                        <div className="flex items-center justify-between px-5 py-3 pb-[calc(env(safe-area-inset-bottom,8px)+12px)]">
                            <div className="flex items-center gap-4">
                                <button className="p-2 text-white/30 hover:text-white/60 transition-colors">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="23 7 16 12 23 17 23 7" />
                                        <rect x="1" y="5" width="15" height="14" rx="2" />
                                    </svg>
                                </button>
                                <button className="p-2 text-white/30 hover:text-white/60 transition-colors">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                </button>
                                <button className="p-2 text-white/30 hover:text-white/60 transition-colors">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                                        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                                    </svg>
                                </button>
                            </div>
                            <span className="text-xs text-white/30 uppercase tracking-wider">
                                {wordCount} {t("words") || "WORDS"}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
