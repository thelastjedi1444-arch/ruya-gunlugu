"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Dream } from "@/lib/storage";
import { BottomTabBar } from "./index";
import MobileHeader from "./MobileHeader";
import MobileCalendar from "./MobileCalendar";
import DreamListItem from "./DreamListItem";
import DreamEntryView from "./DreamEntryView";
import { DreamMood } from "./MoodSelector";

interface MobileAppViewProps {
    dreams: Dream[];
    onNewDream: (dream: { text: string; mood?: DreamMood }) => void;
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
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"calendar" | "journal" | "stats" | "settings">("journal");
    const [showEntryView, setShowEntryView] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showSidebar, setShowSidebar] = useState(false);
    const dateLocale = language === "tr" ? tr : enUS;

    // Get dream dates for calendar
    const dreamDates = useMemo(() => {
        return dreams.map(d => parseISO(d.date));
    }, [dreams]);

    // Filter dreams for selected date or current month
    const filteredDreams = useMemo(() => {
        return dreams.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [dreams]);

    const monthDreamCount = useMemo(() => {
        const now = new Date();
        return dreams.filter(d => {
            const date = parseISO(d.date);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;
    }, [dreams]);

    const handleNewDream = () => {
        if (!user) {
            onShowAuthModal();
            return;
        }
        setShowEntryView(true);
    };

    const handleSaveDream = (dream: { text: string; mood?: DreamMood }) => {
        onNewDream(dream);
        setShowEntryView(false);
    };

    return (
        <div className="min-h-screen bg-black md:hidden flex flex-col">
            {/* Header */}
            <MobileHeader
                title={t("journal") as string || "Dreams"}
                onMenuClick={() => setShowSidebar(true)}
                onSearchClick={() => { }}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-[calc(env(safe-area-inset-top,12px)+56px)] pb-24 px-4">
                <AnimatePresence mode="wait">
                    {activeTab === "calendar" && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <MobileCalendar
                                dreamDates={dreamDates}
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                            />

                            {/* Dreams This Month */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                                        {t("dreamsThisMonthTitle") || "DREAMS THIS MONTH"}
                                    </span>
                                    <span className="text-xs text-blue-400">
                                        {monthDreamCount} {t("entries") || "Entries"}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {filteredDreams.slice(0, 5).map((dream) => (
                                        <DreamListItem
                                            key={dream.id}
                                            id={dream.id}
                                            title={dream.title || (t("untitledDream") as string)}
                                            preview={dream.text.slice(0, 100)}
                                            date={dream.date}
                                            hasInterpretation={!!dream.interpretation}
                                            onClick={() => onDreamClick(dream)}
                                        />
                                    ))}
                                </div>
                            </div>
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
                            {user && (
                                <div className="mb-4">
                                    <p className="text-white/40 text-sm">{t("welcomeUser")},</p>
                                    <h2 className="text-xl font-semibold text-white">{user.username}</h2>
                                </div>
                            )}

                            {/* Dream List */}
                            <div className="space-y-4">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                                    {t("recentDreams")}
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
                                                hasInterpretation={!!dream.interpretation}
                                                onClick={() => onDreamClick(dream)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "stats" && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="text-center py-12">
                                <p className="text-white/30 text-sm">{t("stats")} - Coming soon</p>
                            </div>
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
                            <div className="text-center py-12">
                                <p className="text-white/30 text-sm">{t("settings")} - Coming soon</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Tab Bar */}
            <BottomTabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onNewDream={handleNewDream}
            />

            {/* Dream Entry View */}
            <DreamEntryView
                isOpen={showEntryView}
                onClose={() => setShowEntryView(false)}
                onSave={handleSaveDream}
                isListening={isListening}
                onToggleListening={onToggleListening}
                initialText={transcript}
            />
        </div>
    );
}
