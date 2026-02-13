"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, parseISO } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";
import { Dream } from "@/lib/storage";

interface MobileCalendarProps {
    dreams: Dream[];
    onDreamClick?: (dream: Dream) => void;
}

export default function MobileCalendar({ dreams, onDreamClick }: MobileCalendarProps) {
    const { t, language } = useLanguage();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const dateLocale = language === "tr" ? tr : enUS;

    // Calendar logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Fill start empty days
    const startDay = monthStart.getDay(); // 0 is Sunday
    const emptyDaysPre = Array(startDay === 0 ? 0 : startDay).fill(null);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const getDreamsForDate = (date: Date) => {
        return dreams.filter(d => isSameDay(new Date(d.date), date));
    };

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Calendar Header */}
            <div className="flex items-center justify-between py-6 px-2">
                <button
                    onClick={handlePrevMonth}
                    className="p-3 rounded-full hover:bg-white/5 active:scale-95 transition-all"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <motion.h2
                    key={currentMonth.toString()}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-serif font-bold text-white tracking-wide italic"
                >
                    {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
                </motion.h2>
                <button
                    onClick={handleNextMonth}
                    className="p-3 rounded-full hover:bg-white/5 active:scale-95 transition-all"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-4 px-2">
                {(language === "tr" ? ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]).map((day) => (
                    <div key={day} className="text-center text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-6 gap-x-2 px-2 flex-1 overflow-y-auto">
                {emptyDaysPre.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {days.map((date, i) => {
                    const dayDreams = getDreamsForDate(date);
                    const isSelected = selectedDay && isSameDay(date, selectedDay);
                    const isTodayDate = isToday(date);
                    const hasDreams = dayDreams.length > 0;

                    return (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.005 }}
                            key={date.toISOString()}
                            onClick={() => setSelectedDay(date)}
                            className="relative flex flex-col items-center justify-start h-14 group"
                        >
                            <span className={`
                                w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all
                                ${isSelected ? "bg-white text-black scale-110 shadow-lg shadow-white/20" : ""}
                                ${isTodayDate && !isSelected ? "bg-blue-600/20 text-blue-400 border border-blue-500/50" : ""}
                                ${!isSelected && !isTodayDate ? "text-white/80" : ""}
                            `}>
                                {format(date, "d")}
                            </span>

                            {/* Dream Dots */}
                            <div className="flex gap-0.5 mt-2">
                                {dayDreams.slice(0, 3).map((dream, idx) => (
                                    <div
                                        key={dream.id}
                                        className={`
                                            w-1.5 h-1.5 rounded-full
                                            ${isSelected ? "bg-black/50" : "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"}
                                        `}
                                    />
                                ))}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Selected Day Dreams Bottom Sheet */}
            <AnimatePresence>
                {selectedDay && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        className="fixed bottom-0 left-0 right-0 p-4 z-[101] bg-[#1A1A1A] border-t border-white/10 rounded-t-3xl shadow-2xl max-h-[60vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
                            <div>
                                <h3 className="text-white font-bold text-lg">
                                    {format(selectedDay, "d MMMM yyyy", { locale: dateLocale })}
                                </h3>
                                <p className="text-xs text-white/30 truncate">
                                    {getDreamsForDate(selectedDay).length} {t("entries")}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {getDreamsForDate(selectedDay).length > 0 ? (
                                getDreamsForDate(selectedDay).map(dream => (
                                    <button
                                        key={dream.id}
                                        onClick={() => {
                                            setSelectedDay(null);
                                            onDreamClick?.(dream);
                                        }}
                                        className="w-full text-left p-4 rounded-2xl bg-black/40 hover:bg-white/5 border border-white/5 transition-all active:scale-98"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/20">
                                                {format(parseISO(dream.date), "HH:mm")}
                                            </span>
                                            {dream.mood && (
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                                                    {t(`mood${dream.mood.charAt(0).toUpperCase()}${dream.mood.slice(1)}` as any) || dream.mood}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-base text-gray-100 font-medium line-clamp-2">
                                            {dream.title || (t("untitledDream") as string)}
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <p className="text-white/30 text-center py-10 italic text-sm">
                                    {t("noRecordsYet")}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
