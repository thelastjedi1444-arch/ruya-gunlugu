"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    addMonths,
    subMonths,
    getDay,
    isToday
} from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";

interface MobileCalendarProps {
    dreamDates: Date[];
    selectedDate?: Date;
    onDateSelect: (date: Date) => void;
    onMonthChange?: (date: Date) => void;
}

export default function MobileCalendar({
    dreamDates,
    selectedDate,
    onDateSelect,
    onMonthChange,
}: MobileCalendarProps) {
    const { language, t } = useLanguage();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const dateLocale = language === "tr" ? tr : enUS;

    const weekDays = useMemo(() => {
        return language === "tr"
            ? ["P", "P", "S", "Ç", "P", "C", "C"]
            : ["S", "M", "T", "W", "T", "F", "S"];
    }, [language]);

    const days = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const allDays = eachDayOfInterval({ start, end });

        // Pad start with empty days
        const startDayOfWeek = getDay(start);
        const paddedDays: (Date | null)[] = Array(startDayOfWeek).fill(null);

        return [...paddedDays, ...allDays];
    }, [currentMonth]);

    const handlePrevMonth = () => {
        const newMonth = subMonths(currentMonth, 1);
        setCurrentMonth(newMonth);
        onMonthChange?.(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = addMonths(currentMonth, 1);
        setCurrentMonth(newMonth);
        onMonthChange?.(newMonth);
    };

    const hasDream = (date: Date) => {
        return dreamDates.some(d => isSameDay(d, date));
    };

    return (
        <div className="bg-[#111] rounded-2xl border border-white/5 p-4">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                    {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
                </h3>
                <div className="flex items-center gap-1">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePrevMonth}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleNextMonth}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </motion.button>
                </div>
            </div>

            {/* Week Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, i) => (
                    <div key={i} className="text-center text-[10px] text-white/30 uppercase font-semibold py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    if (!day) {
                        return <div key={`empty-${i}`} className="aspect-square" />;
                    }

                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const hasDreamOnDay = hasDream(day);
                    const isTodayDate = isToday(day);

                    return (
                        <motion.button
                            key={day.toISOString()}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDateSelect(day)}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-colors ${isSelected
                                    ? "bg-blue-500 text-white"
                                    : isTodayDate
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:bg-white/5"
                                }`}
                        >
                            <span className="text-sm font-medium">{format(day, "d")}</span>
                            {hasDreamOnDay && (
                                <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-blue-500"
                                    }`} />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
