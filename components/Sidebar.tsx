"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dream } from "@/lib/storage";
import {
    format,
    parseISO,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    subDays,
    addDays
} from "date-fns";
import { tr, enUS } from "date-fns/locale";
import Link from "next/link";
import { useState, useEffect } from "react";
import { playHoverSound } from "@/lib/sound";
import { useLanguage } from "@/hooks/use-language";
import { MoreVertical, Trash2 } from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    dreams: Dream[];
    onSelectDream: (id: string) => void;
    onDeleteDream: (id: string) => void;
    currentDreamId: string | null;
    onWeeklyAnalysis: () => void;
    onDayClick: (day: Date) => void;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, dreams, onSelectDream, onDeleteDream, currentDreamId, onWeeklyAnalysis, onDayClick, onClose }: SidebarProps) {
    const { language, t } = useLanguage();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const dateLocale = language === "tr" ? tr : enUS;
    const weekDaysShort = t("weekDaysShort") as readonly string[];

    // Close menu on outside click
    useEffect(() => {
        const handleOutsideClick = () => setOpenMenuId(null);
        if (openMenuId) {
            window.addEventListener('mousedown', handleOutsideClick);
        }
        return () => window.removeEventListener('mousedown', handleOutsideClick);
    }, [openMenuId]);

    // Mini Calendar Logic
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const daysWithDreams = dreams.map(d => parseISO(d.date));

    return (
        <>
            {/* Mobile Overlay/Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[55] md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <motion.aside
                initial={{ x: -320 }}
                animate={{ x: isOpen ? 0 : -320 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`
                    fixed md:fixed left-0 top-0 h-full w-[280px] md:w-80 
                    bg-[#0a0a0a] border-r border-[#262626] z-[56] 
                    flex flex-col pt-16 md:pt-4 pb-4
                    shadow-2xl shadow-black/50
                `}
            >
                {/* New Dream Button (Added at the very top) */}
                <div className="px-4 mb-4">
                    <Link
                        href="/"
                        className="flex items-center justify-between w-full p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <path d="M12 5v14" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-white tracking-widest uppercase">{t("newDream") as string}</span>
                                <span className="text-[10px] text-muted/40 font-light">{t("emptyMind") as string}</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Calendar Section (Top) - Expanded */}
                <div className="px-4 mb-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="bg-gradient-to-br from-[#111] to-[#0d0d0d] rounded-2xl p-5 border border-[#262626] shadow-xl shadow-black/20"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-5 px-1">
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-sm font-semibold text-white/80 uppercase tracking-widest"
                            >
                                {format(today, "MMMM yyyy", { locale: dateLocale })}
                            </motion.span>
                            <Link href="/calendar" className="text-xs text-white/40 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5">
                                {t("expand") as string} →
                            </Link>
                        </div>

                        {/* Week Day Headers */}
                        <div className="grid grid-cols-7 gap-2 text-center mb-3">
                            {weekDaysShort.map((day, i) => (
                                <motion.div
                                    key={day}
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + i * 0.02 }}
                                    className="text-[10px] text-white/30 font-semibold uppercase tracking-wider"
                                >
                                    {day}
                                </motion.div>
                            ))}
                        </div>

                        {/* Calendar Grid - Larger cells */}
                        <div className="grid grid-cols-7 gap-2 text-center">
                            {calendarDays.map((day, idx) => {
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const hasDream = daysWithDreams.some(d => isSameDay(d, day));
                                const isTodayDate = isSameDay(day, today);

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: 0.2 + idx * 0.015,
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 20
                                        }}
                                        whileHover={{
                                            scale: 1.15,
                                            transition: { duration: 0.15 }
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`
                                            aspect-square flex items-center justify-center relative cursor-pointer font-medium transition-all duration-200 rounded-lg text-sm
                                            ${!isCurrentMonth ? 'text-white/10' : 'text-white/60'}
                                            ${isTodayDate
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/30'
                                                : hasDream
                                                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20'
                                                    : 'hover:bg-white/5 hover:text-white'
                                            }
                                        `}
                                        onClick={() => onDayClick(day)}
                                        onMouseEnter={() => playHoverSound()}
                                    >
                                        {format(day, "d")}
                                        {hasDream && !isTodayDate && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.3 + idx * 0.01, type: "spring" }}
                                                className="absolute -bottom-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50"
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Dream count indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/30"
                        >
                            <span>{dreams.filter(d => isSameMonth(parseISO(d.date), today)).length} {t("dreamsThisMonth") as string || "rüya bu ay"}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400/50" />
                                <span>{t("hasDream") as string || "rüya var"}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Dream List Title */}
                <div className="px-6 mb-2">
                    <div className="text-[10px] text-muted/30 uppercase tracking-[0.2em] font-semibold">
                        {t("recentDreams") as string}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
                    {dreams.length === 0 ? (
                        <div className="text-center text-muted/20 text-xs py-8 italic">
                            {t("noRecordsYet") as string}
                        </div>
                    ) : (
                        dreams.map((dream) => (
                            <div key={dream.id} className="relative group">
                                <button
                                    onClick={() => onSelectDream(dream.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-all border cursor-pointer ${currentDreamId === dream.id
                                        ? "bg-white/5 border-white/20"
                                        : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={`text-[11px] font-mono tracking-wide uppercase transition-colors ${currentDreamId === dream.id ? "text-white/60" : "text-muted/30 group-hover:text-muted/50"
                                            }`}>
                                            {(() => {
                                                const date = parseISO(dream.date);
                                                const todayDate = new Date();
                                                const yesterday = subDays(todayDate, 1);
                                                const tomorrow = addDays(todayDate, 1);
                                                const datePart = format(date, "d MMM", { locale: dateLocale });

                                                if (isSameDay(date, todayDate)) return `${datePart} ${t("today")}`;
                                                if (isSameDay(date, yesterday)) return `${datePart} ${t("yesterday")}`;
                                                if (isSameDay(date, tomorrow)) return `${datePart} ${t("tomorrow")}`;

                                                return `${datePart} ${format(date, "EEEE", { locale: dateLocale })}`;
                                            })()}
                                        </span>
                                        {dream.interpretation && (
                                            <span className="text-[10px] text-white/40">🌙</span>
                                        )}
                                    </div>
                                    <div className="pr-6">
                                        <h3 className={`text-xs font-medium line-clamp-1 transition-colors ${currentDreamId === dream.id ? "text-white" : "text-foreground/60 group-hover:text-white"
                                            }`}>
                                            {dream.title || t("untitledDream") as string}
                                        </h3>
                                    </div>
                                </button>

                                {/* More Options Menu */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === dream.id ? null : dream.id);
                                        }}
                                        className={`p-1 rounded-md transition-all ${openMenuId === dream.id
                                            ? "bg-white/10 text-white"
                                            : "text-white/20 hover:text-white hover:bg-white/5 md:opacity-0 md:group-hover:opacity-100"
                                            }`}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    <AnimatePresence>
                                        {openMenuId === dream.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                                className="absolute right-full mr-3 top-0 z-[61] min-w-[180px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                                            >
                                                <div className="p-1.5">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteDream(dream.id);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-100 bg-red-500/10 hover:bg-red-500/20 transition-all group/del"
                                                    >
                                                        <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 group-hover/del:scale-110 transition-transform">
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </div>
                                                        <span className="text-[10px] text-white leading-tight font-bold text-left">
                                                            {t("confirmDeleteAction") as string}
                                                        </span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Weekly Analysis Button */}
                <div className="mt-auto px-4 pt-4 border-t border-[#262626]">
                    <button
                        onClick={onWeeklyAnalysis}
                        className="w-full py-3 rounded-lg border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-blue-900/20 hover:from-indigo-800/30 hover:to-blue-800/30 hover:border-indigo-400/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                        <span className="text-xl">🌙</span>
                        <span className="text-sm font-medium text-indigo-200 group-hover:text-indigo-100 uppercase tracking-wider">
                            {t("weeklyAnalysis") as string}
                        </span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
}

