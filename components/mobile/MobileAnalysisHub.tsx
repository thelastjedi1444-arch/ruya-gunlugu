"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isWithinInterval, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { Dream } from "@/lib/storage";
import ReactMarkdown from "react-markdown";
import { analyzeWeeklyDreams } from "@/lib/weekly-analysis";

interface MobileAnalysisHubProps {
    dreams: Dream[];
    onInterpret: (text: string) => void;
    onDreamClick: (dream: Dream) => void;
}

export default function MobileAnalysisHub({ dreams, onInterpret, onDreamClick }: MobileAnalysisHubProps) {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"interpret" | "weekly" | "monthly">("interpret");

    return (
        <div className="flex flex-col h-full bg-black min-h-[80vh]">
            {/* Top Tabs */}
            <div className="flex items-center p-1 bg-white/5 rounded-xl mx-4 mb-6 relative">
                <TabButton
                    label={t("interpret")}
                    isActive={activeTab === "interpret"}
                    onClick={() => setActiveTab("interpret")}
                />
                <TabButton
                    label={t("weekly")}
                    isActive={activeTab === "weekly"}
                    onClick={() => setActiveTab("weekly")}
                />
                <TabButton
                    label={t("monthly")}
                    isActive={activeTab === "monthly"}
                    onClick={() => setActiveTab("monthly")}
                />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-24">
                <AnimatePresence mode="wait">
                    {activeTab === "interpret" && (
                        <InterpretationView
                            key="interpret"
                            dreams={dreams}
                            user={user}
                            onInterpret={onInterpret}
                            onDreamClick={onDreamClick}
                        />
                    )}
                    {activeTab === "weekly" && (
                        <WeeklyAnalysisView
                            key="weekly"
                            dreams={dreams}
                            language={language}
                        />
                    )}
                    {activeTab === "monthly" && (
                        <MonthlyAnalysisView
                            key="monthly"
                            dreams={dreams}
                            language={language}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function TabButton({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all relative z-10 ${isActive ? "text-white" : "text-white/40 hover:text-white/60"}`}
        >
            {label}
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
        </button>
    );
}

// --- Views ---

function InterpretationView({ dreams, user, onInterpret, onDreamClick }: { dreams: Dream[], user: any, onInterpret: (t: string) => void, onDreamClick: (d: Dream) => void }) {
    const { t, language } = useLanguage();
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [interpretation, setInterpretation] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Filter dreams that have interpretations
    const interpretedDreams = dreams.filter(d => d.interpretation);

    const handleInterpret = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError(null);
        setInterpretation("");

        try {
            const res = await fetch("/api/interpret", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    language,
                    zodiacSign: user?.zodiacSign
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Interpretation failed");

            setInterpretation(data.interpretation);
        } catch (err) {
            setError(t("failedToAnalyze") as string);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            {/* Input Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-white/80 px-1">{t("whisperQuestion")}</h3>
                <div className="relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t("tellYourDream") as string}
                        className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 min-h-[120px] focus:outline-none focus:border-white/20 transition-colors resize-none"
                    />
                    <button
                        disabled={!text.trim() || loading}
                        onClick={handleInterpret}
                        className={`absolute bottom-4 right-4 p-2 rounded-full transition-all ${text.trim() && !loading ? "bg-white text-black shadow-lg shadow-white/20" : "bg-[#222] text-white/20 cursor-not-allowed"}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Result */}
            <AnimatePresence>
                {interpretation && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 overflow-hidden">
                        <div className="flex items-center gap-2 mb-3 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                            <span>✨</span>
                            <span>{t("interpretation")}</span>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
                            <ReactMarkdown>{interpretation}</ReactMarkdown>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Previous Interpretations List */}
            {interpretedDreams.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest px-1">
                        {t("recentInterpretations")}
                    </h3>
                    <div className="grid gap-3">
                        {interpretedDreams.slice(0, 5).map(dream => (
                            <button
                                key={dream.id}
                                onClick={() => onDreamClick(dream)}
                                className="w-full bg-[#111] border border-white/5 rounded-xl p-4 flex items-start gap-4 hover:bg-white/5 transition-all text-left group"
                            >
                                <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                    <span className="text-lg">🌙</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white font-medium truncate pr-2">{dream.title || t("untitledDream")}</span>
                                        <span className="text-[10px] text-white/30">{format(parseISO(dream.date), "d MMM", { locale: language === "tr" ? tr : enUS })}</span>
                                    </div>
                                    <p className="text-xs text-white/40 line-clamp-2">{dream.interpretation}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function WeeklyAnalysisView({ dreams, language }: { dreams: Dream[], language: "tr" | "en" }) {
    const { t } = useLanguage();
    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(true);

    // Date Calcs
    const today = new Date();
    const dateLocale = language === "tr" ? tr : enUS;
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Filter this week's dreams
    const weeklyDreams = dreams.filter(d => isWithinInterval(parseISO(d.date), { start: weekStart, end: weekEnd }));

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const text = await analyzeWeeklyDreams(dreams, language);
                setAnalysis(text);
            } catch (e) {
                setAnalysis(t("failedToAnalyze") as string);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [dreams, language]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Header */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 text-center">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{t("weeklyAnalysis")}</p>
                <h2 className="text-xl font-medium text-white">
                    {format(weekStart, "d MMM", { locale: dateLocale })} - {format(weekEnd, "d MMM", { locale: dateLocale })}
                </h2>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, i) => {
                    const hasDream = weeklyDreams.some(d => isSameDay(parseISO(d.date), day));
                    const isCurrent = isToday(day);
                    return (
                        <div
                            key={day.toISOString()}
                            className={`flex flex-col items-center justify-center h-16 rounded-lg border transition-all ${hasDream ? "bg-cyan-500/10 border-cyan-500/30" : "bg-white/5 border-white/5 opacity-50"} ${isCurrent ? "ring-1 ring-white/50" : ""}`}
                        >
                            <span className="text-[10px] text-white/50 mb-1">{format(day, "EEE", { locale: dateLocale })}</span>
                            {hasDream && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]" />}
                        </div>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col items-center">
                    <span className="text-3xl font-light text-white mb-1">{weeklyDreams.length}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">{t("dreamCountLabel") || "DREAMS"}</span>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col items-center">
                    <span className="text-3xl font-light text-white mb-1">
                        {weeklyDreams.reduce((acc, curr) => acc + curr.text.split(" ").length, 0)}
                    </span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">{t("wordCountLabel") || "WORDS"}</span>
                </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 min-h-[200px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="w-8 h-8 border-2 border-white/10 border-t-white/80 rounded-full animate-spin" />
                        <p className="text-xs text-white/30 animate-pulse">{t("analyzingDreams")}</p>
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm max-w-none text-gray-400">
                        <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function MonthlyAnalysisView({ dreams, language }: { dreams: Dream[], language: "tr" | "en" }) {
    // Placeholder logic for Monthly - reusing logic for now but scoped to Month
    const { t } = useLanguage();
    const today = new Date();
    const dateLocale = language === "tr" ? tr : enUS;
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthlyDreams = dreams.filter(d => isWithinInterval(parseISO(d.date), { start: monthStart, end: monthEnd }));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 text-center">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{t("monthly")}</p>
                <h2 className="text-xl font-medium text-white">
                    {format(today, "MMMM yyyy", { locale: dateLocale })}
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col items-center">
                    <span className="text-3xl font-light text-white mb-1">{monthlyDreams.length}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">{t("dreamCountLabel") || "DREAMS"}</span>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col items-center">
                    <span className="text-3xl font-light text-white mb-1">
                        {monthlyDreams.reduce((acc, curr) => acc + curr.text.split(" ").length, 0)}
                    </span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">{t("wordCountLabel") || "WORDS"}</span>
                </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl">✨</span>
                </div>
                <h3 className="text-white font-medium mb-2">{t("detailedMonthlyAnalysis")}</h3>
                <p className="text-white/40 text-sm mb-4">{t("detailedMonthlyAnalysisDesc")}</p>
                <div className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full">{t("comingSoon")}</div>
            </div>
        </motion.div>
    );
}
