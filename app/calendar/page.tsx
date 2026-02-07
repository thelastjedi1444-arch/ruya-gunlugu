"use client";

import { useState, useEffect } from "react";
import { getDreams, Dream } from "@/lib/storage";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO
} from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { playHoverSound } from "@/lib/sound";
import { useLanguage } from "@/hooks/use-language";

export default function CalendarPage() {
    const router = useRouter();
    const { language, t } = useLanguage();
    const dateLocale = language === "tr" ? tr : enUS;
    const weekDays = t("weekDays") as readonly string[];
    const [dreams, setDreams] = useState<Dream[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [dayDetail, setDayDetail] = useState<Date | null>(null);

    useEffect(() => {
        setDreams(getDreams());
        const handleUpdate = () => setDreams(getDreams());
        window.addEventListener("dream-saved", handleUpdate);
        return () => window.removeEventListener("dream-saved", handleUpdate);
    }, []);

    // Calendar Generation Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today);
    };

    // Filter dreams for the calendar view
    const getDreamsForDay = (date: Date) => {
        return dreams.filter(d => isSameDay(parseISO(d.date), date));
    };

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
    };

    const handleDayDoubleClick = (day: Date) => {
        setDayDetail(day);
    };

    const handleDreamClick = (e: React.MouseEvent, dreamId: string) => {
        e.stopPropagation();
        router.push(`/?id=${dreamId}`);
    };

    return (
        <>
            {/* Day Detail Modal */}
            <AnimatePresence>
                {dayDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-0 left-0 w-screen h-screen bg-black/90 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
                        onClick={() => setDayDetail(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0f0f0f] border border-[#262626] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between shrink-0 bg-[#0f0f0f] rounded-t-2xl">
                                <div>
                                    <h2 className="text-xl font-medium text-white">
                                        {format(dayDetail, "d MMMM yyyy", { locale: dateLocale })}
                                    </h2>
                                    <p className="text-sm text-muted/50 mt-1">
                                        {format(dayDetail, "EEEE", { locale: dateLocale })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDayDetail(null)}
                                    className="p-2 hover:bg-[#262626] rounded-lg text-muted/50 hover:text-white transition-colors"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="p-6 overflow-y-auto min-h-0">
                                {getDreamsForDay(dayDetail).length > 0 ? (
                                    <div className="space-y-8">
                                        {getDreamsForDay(dayDetail).map((dream, idx) => (
                                            <div key={dream.id} className="relative pl-6 border-l-2 border-[#262626] last:border-l-transparent">
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />

                                                <div className="mb-2 flex items-center gap-3">
                                                    <span className="text-xs font-medium text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                                                        {format(parseISO(dream.date), "HH:mm")}
                                                    </span>
                                                    {dream.title && (
                                                        <h3 className="text-lg font-medium text-white">{dream.title}</h3>
                                                    )}
                                                </div>

                                                <div className="prose prose-invert prose-sm max-w-none mb-4 text-gray-300 leading-relaxed bg-[#1a1a1a]/50 p-4 rounded-lg border border-[#262626]">
                                                    {dream.text}
                                                </div>

                                                {dream.interpretation && (
                                                    <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-purple-500/10 rounded-lg p-4 mt-4">
                                                        <div className="flex items-center gap-2 mb-2 text-purple-300/80 text-sm font-medium uppercase tracking-wider">
                                                            <span>✨</span>
                                                            <span>{t("interpretation") as string}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-400 italic leading-relaxed">
                                                            {dream.interpretation}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4 text-2xl">
                                            🌙
                                        </div>
                                        <p className="text-muted/50 text-lg">{t("noDreamsForDay") as string}</p>
                                        <button
                                            onClick={() => router.push('/')}
                                            className="mt-4 px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            {t("addDream") as string}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-screen bg-[#0a0a0a] text-foreground flex flex-col overflow-hidden font-sans">
                {/* Header */}
                <header className="px-6 py-4 flex items-center justify-between border-b border-[#262626] bg-[#0a0a0a] shrink-0">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#262626] bg-[#111] hover:bg-[#1a1a1a] hover:border-white/20 transition-all group">
                            <span className="text-muted/60 group-hover:text-white transition-colors">←</span>
                            <span className="text-xs font-medium text-muted/60 group-hover:text-white transition-colors uppercase tracking-wider">{t("backToHome") as string}</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={goToToday}
                            className="px-4 py-1.5 rounded border border-[#333] text-sm hover:bg-[#262626] transition-colors"
                        >
                            {t("today") as string}
                        </button>
                        <div className="flex items-center gap-1">
                            <button onClick={previousMonth} className="p-1.5 hover:bg-[#262626] rounded-full">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-[#262626] rounded-full">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </div>
                        <h2 className="text-xl font-medium min-w-[160px] text-right">
                            {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
                        </h2>
                    </div>
                </header>

                {/* Calendar Grid */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-[#262626]">
                        {weekDays.map((day) => (
                            <div key={day} className="py-2 text-center text-[11px] font-medium text-muted/50 uppercase tracking-widest border-r border-[#262626] last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-0">
                        {calendarDays.map((day, idx) => {
                            const dayDreams = getDreamsForDay(day);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isDayToday = isToday(day);

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => { handleDayClick(day); handleDayDoubleClick(day); }}
                                    onDoubleClick={() => handleDayDoubleClick(day)}
                                    className={`
                                        relative border-r border-b border-[#262626] p-3 flex flex-col group transition-all duration-200 min-h-[140px]
                                        ${!isCurrentMonth ? 'bg-[#0a0a0a]/50 text-muted/20' : 'bg-[#0a0a0a]'}
                                        ${isSelected ? 'bg-blue-900/30' : 'hover:bg-blue-900/20'}
                                        last:border-r-0
                                    `}
                                    onMouseEnter={() => playHoverSound()}
                                >
                                    {/* Date Number */}
                                    <div className="flex items-center justify-between mb-2 shrink-0">
                                        <span className={`
                                        text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full
                                        ${isDayToday
                                                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                                                : isCurrentMonth ? 'text-white/90' : 'text-muted/30'}
                                    `}>
                                            {format(day, "d")}
                                        </span>
                                        {/* First day of month label */}
                                        {format(day, "d") === "1" && (
                                            <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">
                                                {format(day, "MMM", { locale: dateLocale })}
                                            </span>
                                        )}
                                    </div>

                                    {/* Dream Events - with proper overflow */}
                                    <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden min-h-0" style={{ maxHeight: 'calc(100% - 40px)' }}>
                                        {dayDreams.slice(0, 10).map(dream => (
                                            <div
                                                key={dream.id}
                                                onClick={(e) => handleDreamClick(e, dream.id)}
                                                className="
                                                px-2 py-1.5 rounded bg-blue-900/20 border-l-2 border-blue-500 
                                                hover:bg-blue-800/30 cursor-pointer transition-colors shrink-0
                                                group/event
                                            "
                                            >
                                                <div className="text-[10px] font-medium text-blue-100 truncate flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                                                    <span className="truncate">{dream.title || t("untitledDream") as string}</span>
                                                </div>
                                                {dream.interpretation && (
                                                    <div className="text-[8px] text-blue-300/60 truncate pl-3">
                                                        ✨
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {dayDreams.length > 10 && (
                                            <div className="text-[9px] text-center text-muted/40 py-1">
                                                +{dayDreams.length - 10} {t("more") as string}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div >
        </>
    );
}
