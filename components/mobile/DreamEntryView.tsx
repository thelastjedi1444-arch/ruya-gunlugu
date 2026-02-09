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
    onSaveAndInterpret?: (dream: { text: string; mood?: DreamMood }) => void;
    initialText?: string;
    initialMood?: DreamMood;
    isListening: boolean;
    onToggleListening: () => void;
}

export default function DreamEntryView({
    isOpen,
    onClose,
    onSave,
    onSaveAndInterpret,
    initialText = "",
    initialMood,
    isListening,
    onToggleListening,
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
                    <div className="fixed top-0 left-0 right-0 z-[101] bg-black/90 backdrop-blur-xl border-b border-white/5">
                        <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-3 h-[60px]">
                            <button
                                onClick={onClose}
                                className="text-white/70 text-base font-medium px-2 py-1"
                            >
                                {t("feedbackCancel") || "Cancel"}
                            </button>

                            <span className="text-xs text-white/40 uppercase tracking-widest font-semibold italic">
                                iDream
                            </span>

                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onSaveAndInterpret?.({ text: text.trim(), mood })}
                                    disabled={!text.trim()}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${!text.trim()
                                        ? "bg-purple-900/20 text-white/20"
                                        : "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400/30"
                                        }`}
                                >
                                    <span>{t("interpretDream")?.toString().split(" ")[0] || "Interpret"}</span>
                                    <span>✨</span>
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSave}
                                    disabled={!text.trim()}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!text.trim()
                                        ? "bg-white/10 text-white/30"
                                        : "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                        }`}
                                >
                                    {t("save")}
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto pt-[calc(env(safe-area-inset-top,12px)+56px)] pb-20 px-5">
                        {/* Date Display */}
                        <div className="mb-6">
                            <p className="text-sm text-white/70 uppercase tracking-widest font-bold mb-1 ml-1 opacity-80">
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
                                {t("theNarrative")}
                            </span>
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={t("dreamPlaceholder") as string}
                                className="w-full bg-transparent text-white/80 text-lg leading-relaxed placeholder:text-white/20 resize-none focus:outline-none min-h-[200px]"
                            />
                        </div>
                    </div>

                    {/* Bottom Toolbar */}
                    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/5">
                        <div className="flex items-center justify-between px-5 py-3 pb-[calc(env(safe-area-inset-bottom,8px)+12px)]">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onToggleListening}
                                    className={`p-2 transition-colors relative ${isListening ? "text-red-500 hover:text-red-400" : "text-white/30 hover:text-white/60"
                                        }`}
                                >
                                    {isListening && (
                                        <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
                                    )}
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isListening ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                                        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                                    </svg>
                                </button>
                            </div>
                            <span className="text-xs text-white/30 uppercase tracking-wider">
                                {wordCount} {t("words")}
                            </span>
                        </div>
                    </div>
                </motion.div >
            )
            }
        </AnimatePresence >
    );
}
