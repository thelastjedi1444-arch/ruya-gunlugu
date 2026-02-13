"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Dream, calculateStreak } from "@/lib/storage";
import { BottomTabBar } from "./index";
import MobileHeader from "./MobileHeader";
import MobileSidebar from "./MobileSidebar";
import MobileCalendar from "./MobileCalendar";
import DreamListItem from "./DreamListItem";
import DreamEntryView from "./DreamEntryView";
import DreamDetailView from "./DreamDetailView";
import MobileAnalysisHub from "./MobileAnalysisHub";
import { DreamMood } from "./MoodSelector";
import NewVersionModal from "./NewVersionModal";

interface MobileAppViewProps {
    dreams: Dream[];
    onNewDream: (dream: { text: string; mood?: DreamMood }) => Promise<any>;
    onDreamClick: (dream: Dream) => void;
    onShowAuthModal: () => void;
    isListening: boolean;
    onToggleListening: () => void;
    transcript: string;
}

export default function MobileAppView({
    dreams,
    onNewDream,
    onDreamClick,
    onShowAuthModal,
    isListening,
    onToggleListening,
    transcript,
}: MobileAppViewProps) {
    const { t, language, setLanguage } = useLanguage();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"calendar" | "journal" | "interpret" | "settings">("journal");
    const [showEntryView, setShowEntryView] = useState(true); // Opens on app launch
    const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);
    const dateLocale = language === "tr" ? tr : enUS;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter dreams for selected date or current month
    const filteredDreams = useMemo(() => {
        let filtered = dreams;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = dreams.filter(d =>
                d.text.toLowerCase().includes(query) ||
                (d.title && d.title.toLowerCase().includes(query))
            );
        }

        return filtered.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [dreams, searchQuery]);

    // Stats calculations
    const stats = useMemo(() => {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const thisWeek = dreams.filter(d => {
            try { return isWithinInterval(parseISO(d.date), { start: weekStart, end: weekEnd }); }
            catch { return false; }
        });

        const thisMonth = dreams.filter(d => {
            try { return isWithinInterval(parseISO(d.date), { start: monthStart, end: monthEnd }); }
            catch { return false; }
        });

        const totalWords = dreams.reduce((acc, d) => acc + d.text.split(" ").length, 0);
        const avgLength = dreams.length > 0 ? Math.round(totalWords / dreams.length) : 0;
        const streak = calculateStreak(user?.id);
        const interpreted = dreams.filter(d => d.interpretation).length;

        return { thisWeek: thisWeek.length, thisMonth: thisMonth.length, totalWords, avgLength, streak, total: dreams.length, interpreted };
    }, [dreams, user]);

    const handleNewDream = () => {
        setShowEntryView(true);
    };

    const handleSaveDream = (dream: { text: string; mood?: DreamMood }) => {
        onNewDream(dream);
        setShowEntryView(false);
    };

    const handleSaveAndInterpret = async (dream: { text: string; mood?: DreamMood }) => {
        const savedDream = await onNewDream(dream);
        setShowEntryView(false);

        if (savedDream && savedDream.id) {
            handleInterpretDream(savedDream.id);
        }
    };

    const handleDreamClick = (dream: Dream) => {
        setSelectedDream(dream);
    };

    const handleInterpretDream = async (dreamId: string) => {
        try {
            const dream = dreams.find(d => d.id === dreamId);
            if (!dream) return;

            const response = await fetch("/api/interpret", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: dream.text,
                    dreamId: dream.id,
                    language
                })
            });

            if (response.ok) {
                const data = await response.json();
                const storage = await import("@/lib/storage");
                storage.updateDream(dreamId, { interpretation: data.interpretation });
                window.dispatchEvent(new Event("dream-saved"));
            }
        } catch (error) {
            console.error("Interpretation failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-black md:hidden flex flex-col">
            {/* Header */}
            <MobileHeader
                onMenuClick={() => setShowSidebar(true)}
                onSearchClick={(query) => setSearchQuery(query)}
            />

            {/* Sidebar */}
            <MobileSidebar
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
                onNavigate={(tab) => {
                    setActiveTab(tab);
                    setShowSidebar(false);
                }}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-[calc(env(safe-area-inset-top,12px)+56px)] pb-24 px-4 overflow-x-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === "calendar" && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="h-[calc(100vh-160px)]"
                        >
                            <MobileCalendar
                                dreams={dreams}
                                onDreamClick={handleDreamClick}
                            />
                        </motion.div>
                    )}

                    {activeTab === "journal" && (
                        <motion.div
                            key="journal"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* Welcome Section */}
                            {user && !searchQuery && (
                                <div className="mb-4">
                                    <p className="text-white/40 text-xs uppercase tracking-widest">{t("welcomeUser")}</p>
                                    <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                                </div>
                            )}

                            {/* Dream List */}
                            <div className="space-y-4">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                                    {searchQuery ? `${filteredDreams.length} ${t("entries")}` : t("recentDreams")}
                                </span>
                                {filteredDreams.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-white/30 text-sm">{t("noRecordsYet")}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredDreams.map((dream) => (
                                            <DreamListItem
                                                key={dream.id}
                                                id={dream.id}
                                                title={dream.title || (t("untitledDream") as string)}
                                                preview={dream.text.slice(0, 100)}
                                                date={dream.date}
                                                mood={dream.mood as DreamMood}
                                                hasInterpretation={!!dream.interpretation}
                                                onClick={() => handleDreamClick(dream)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "interpret" && (
                        <motion.div
                            key="interpret"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="h-full"
                        >
                            <MobileAnalysisHub
                                dreams={dreams}
                                onInterpret={(text) => console.log("Interpreted:", text)}
                                onDreamClick={handleDreamClick}
                            />
                        </motion.div>
                    )}

                    {activeTab === "settings" && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white px-2">
                                    {t("settings")}
                                </h2>

                                {/* Profile Section */}
                                <div className="bg-[#111] rounded-2xl p-6 border border-white/5">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-blue-500/20">
                                            {user?.username.substring(0, 2).toUpperCase() || "G"}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium text-lg">{user?.username || "Guest"}</h3>
                                            <p className="text-xs text-white/40">
                                                {t("joined")}: {mounted ? format(new Date(user?.createdAt || Date.now()), "d MMM yyyy", { locale: dateLocale }) : null}
                                            </p>
                                        </div>
                                    </div>
                                    {user?.zodiacSign && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                            <span className="text-sm text-indigo-300">
                                                {(t("zodiacSigns") as Record<string, { name: string }>)?.[user.zodiacSign as string]?.name || user.zodiacSign}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Stats Section */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-semibold px-2">
                                        {t("yourStats")}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <StatCard
                                            value={stats.thisWeek}
                                            label={t("thisWeekDreams") as string}
                                            sublabel={t("dreamsLabel") as string}
                                            icon="📅"
                                        />
                                        <StatCard
                                            value={stats.thisMonth}
                                            label={t("thisMonthDreams") as string}
                                            sublabel={t("dreamsLabel") as string}
                                            icon="📆"
                                        />
                                        <StatCard
                                            value={stats.total}
                                            label={t("totalDreamsCount") as string}
                                            sublabel={t("dreamsLabel") as string}
                                            icon="🌙"
                                        />
                                        <StatCard
                                            value={stats.streak}
                                            label={t("streakDays") as string}
                                            sublabel={t("daysLabel") as string}
                                            icon="🔥"
                                        />
                                        <StatCard
                                            value={stats.totalWords}
                                            label={t("totalWords") as string}
                                            sublabel={t("wordsLabel") as string}
                                            icon="✍️"
                                        />
                                        <StatCard
                                            value={stats.interpreted}
                                            label={t("interpretation") as string}
                                            sublabel={t("dreamsLabel") as string}
                                            icon="✨"
                                        />
                                    </div>
                                </div>

                                {/* Language Settings */}
                                <div className="bg-[#111] rounded-2xl overflow-hidden border border-white/5">
                                    <div className="p-4 border-b border-white/5">
                                        <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest">
                                            {t("languageLabel")}
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        <button
                                            onClick={() => setLanguage("tr")}
                                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                                        >
                                            <span className={`text-base ${language === "tr" ? "text-white font-medium" : "text-white/60"}`}>Türkçe</span>
                                            {language === "tr" && <span className="text-blue-500">✓</span>}
                                        </button>
                                        <button
                                            onClick={() => setLanguage("en")}
                                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                                        >
                                            <span className={`text-base ${language === "en" ? "text-white font-medium" : "text-white/60"}`}>English</span>
                                            {language === "en" && <span className="text-blue-500">✓</span>}
                                        </button>
                                    </div>
                                </div>

                                {/* Sign Out */}
                                <button
                                    className="w-full flex items-center justify-center p-4 rounded-2xl bg-white/5 text-red-400 font-medium hover:bg-white/10 transition-colors border border-white/5 active:scale-95"
                                    onClick={async () => {
                                        await logout();
                                        router.push("/login");
                                    }}
                                >
                                    {t("logout")}
                                </button>

                                <p className="text-center text-xs text-white/10 pt-4 font-mono uppercase tracking-[0.2em]">
                                    iDream v2.0 • Production Ready
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <NewVersionModal />

            {/* Bottom Tab Bar */}
            <BottomTabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onNewDream={handleNewDream}
            />

            {/* Entry View Modal - Opens on app launch */}
            <DreamEntryView
                isOpen={showEntryView}
                onClose={() => setShowEntryView(false)}
                onSave={handleSaveDream}
                onSaveAndInterpret={handleSaveAndInterpret}
                isListening={isListening}
                onToggleListening={onToggleListening}
                initialText={transcript}
            />

            {/* Detail View Modal */}
            <AnimatePresence>
                {selectedDream && (
                    <DreamDetailView
                        dream={selectedDream}
                        onClose={() => setSelectedDream(null)}
                        onInterpret={handleInterpretDream}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Stat Card Component
function StatCard({ value, label, sublabel, icon }: { value: number, label: string, sublabel: string, icon: string }) {
    return (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
            <span className="text-lg mb-1">{icon}</span>
            <span className="text-2xl font-light text-white">{value}</span>
            <span className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{label}</span>
        </div>
    );
}
