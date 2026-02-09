"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Dream } from "@/lib/storage";
import { BottomTabBar } from "./index";
import MobileHeader from "./MobileHeader";
import MobileSidebar from "./MobileSidebar";
import MobileCalendar from "./MobileCalendar";
import DreamListItem from "./DreamListItem";
import DreamEntryView from "./DreamEntryView";
import DreamDetailView from "./DreamDetailView";
import MobileInterpretationView from "./MobileInterpretationView";
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
    const [activeTab, setActiveTab] = useState<"calendar" | "journal" | "interpret">("journal");
    const [showEntryView, setShowEntryView] = useState(false);
    const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dateLocale = language === "tr" ? tr : enUS;

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

    const handleSaveAndInterpret = async (dream: { text: string; mood?: DreamMood }) => {
        // Save first
        onNewDream(dream);
        setShowEntryView(false);
        // User can then interpret from the detail view
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
                // Persist locally
                const storage = await import("@/lib/storage");
                storage.updateDream(dreamId, { interpretation: data.interpretation });
                window.dispatchEvent(new Event("dream-saved")); // Trigger refresh in parent
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
                                                mood={dream.mood as any}
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
                        >
                            <MobileInterpretationView />
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

            {/* Entry View Modal */}
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
