"use client";

import { useState, useEffect, useRef } from "react";
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

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

const MAX_MESSAGES = 5;

export default function MobileAnalysisHub({ dreams, onInterpret, onDreamClick }: MobileAnalysisHubProps) {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"interpret" | "weekly" | "monthly">("interpret");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                        <ChatInterpretationView
                            key="interpret"
                            dreams={dreams}
                            user={user}
                            language={language}
                        />
                    )}
                    {activeTab === "weekly" && (
                        <WeeklyAnalysisView
                            key="weekly"
                            dreams={dreams}
                            language={language}
                            mounted={mounted}
                        />
                    )}
                    {activeTab === "monthly" && (
                        <MonthlyAnalysisView
                            key="monthly"
                            dreams={dreams}
                            language={language}
                            mounted={mounted}
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

// --- CHAT-BASED INTERPRETATION VIEW ---

function ChatInterpretationView({ dreams, user, language }: { dreams: Dream[], user: any, language: "tr" | "en" }) {
    const { t } = useLanguage();
    const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userMessageCount, setUserMessageCount] = useState(0);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const dateLocale = language === "tr" ? tr : enUS;

    // Scroll to bottom when new messages appear
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectDream = (dream: Dream) => {
        setSelectedDream(dream);
        setMessages([]);
        setUserMessageCount(0);
        setInputText("");

        // Initial AI greeting with dream context
        const systemContext = language === "tr"
            ? `Kullanıcının rüyası: "${dream.text}"\n\nBu rüyayı psikolojik açıdan yorumla. Sıcak, samimi ve destekleyici ol. Kullanıcıyla sohbet tarzında konuş. İlk mesajında rüyayı kısaca özetle ve ilk yorumunu yap. Sonra kullanıcının sorularını yanıtla. ${user?.zodiacSign ? `Kullanıcının burcu: ${user.zodiacSign}` : ""}`
            : `User's dream: "${dream.text}"\n\nInterpret this dream from a psychological perspective. Be warm, friendly and supportive. Talk in a conversational style. In your first message, briefly summarize the dream and give your initial interpretation. Then answer the user's questions. ${user?.zodiacSign ? `User's zodiac sign: ${user.zodiacSign}` : ""}`;

        // Send initial interpretation request
        sendToAI(systemContext, []);
    };

    const sendToAI = async (prompt: string, currentMessages: ChatMessage[]) => {
        setLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...currentMessages, { role: "user", content: prompt }]
                }),
            });

            const data = await res.json();
            if (data.response) {
                const aiMessage: ChatMessage = { role: "assistant", content: data.response };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (err) {
            const errorMessage: ChatMessage = {
                role: "assistant",
                content: language === "tr" ? "Bir hata oluştu, tekrar dene." : "An error occurred, try again."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || loading || userMessageCount >= MAX_MESSAGES) return;

        const userMessage: ChatMessage = { role: "user", content: inputText.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setUserMessageCount(prev => prev + 1);
        setInputText("");

        // Build context with dream + conversation history
        const context = language === "tr"
            ? `Rüya: "${selectedDream?.text}"\n\nKullanıcı ile rüya yorumu sohbetine devam et. Kısa ve öz yanıtlar ver. ${user?.zodiacSign ? `Burcu: ${user.zodiacSign}` : ""}\n\nSohbet:\n${newMessages.map(m => `${m.role === "user" ? "Kullanıcı" : "Yorumcu"}: ${m.content}`).join("\n")}`
            : `Dream: "${selectedDream?.text}"\n\nContinue the dream interpretation chat with the user. Give concise responses. ${user?.zodiacSign ? `Zodiac: ${user.zodiacSign}` : ""}\n\nChat:\n${newMessages.map(m => `${m.role === "user" ? "User" : "Interpreter"}: ${m.content}`).join("\n")}`;

        await sendToAI(context, []);
    };

    const handleBackToDreams = () => {
        setSelectedDream(null);
        setMessages([]);
        setUserMessageCount(0);
        setInputText("");
    };

    // --- DREAM LIST VIEW ---
    if (!selectedDream) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <h3 className="text-lg font-medium text-white/80 px-1">{t("selectDreamToInterpret")}</h3>

                {dreams.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">🌙</span>
                        </div>
                        <p className="text-white/30 text-sm">{t("noDreamsYet")}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {dreams.map(dream => {
                            const hasInterpretation = !!dream.interpretation;
                            return (
                                <motion.button
                                    key={dream.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectDream(dream)}
                                    className="w-full bg-[#111] border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:bg-white/[0.06] transition-all text-left group active:bg-white/10"
                                >
                                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${hasInterpretation ? "bg-green-500/10" : "bg-indigo-500/10"}`}>
                                        <span className="text-lg">{hasInterpretation ? "✅" : "🌙"}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white font-medium truncate pr-2">
                                                {dream.title || t("untitledDream")}
                                            </span>
                                            <span className="text-[10px] text-white/30 flex-shrink-0">
                                                {format(parseISO(dream.date), "d MMM", { locale: dateLocale })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/40 line-clamp-2">{dream.text.slice(0, 120)}</p>
                                        <div className="mt-2">
                                            <span className={`text-[9px] uppercase tracking-widest font-bold ${hasInterpretation ? "text-green-400/60" : "text-white/20"}`}>
                                                {hasInterpretation ? t("interpreted") : t("noInterpretationYet")}
                                            </span>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        );
    }

    // --- CHAT VIEW ---
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-[calc(100vh-220px)]">
            {/* Chat Header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={handleBackToDreams}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate">{t("chatWithAI")}</h3>
                    <p className="text-[10px] text-white/30 truncate">{selectedDream.title || t("untitledDream")}</p>
                </div>
                <div className="px-2 py-1 bg-white/5 rounded-full">
                    <span className="text-[10px] text-white/40 font-bold">
                        {MAX_MESSAGES - userMessageCount} {t("messagesLeft")}
                    </span>
                </div>
            </div>

            {/* Dream Summary Card */}
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 mb-4">
                <span className="text-[9px] text-indigo-300/60 uppercase tracking-widest font-bold">{t("dreamSummary")}</span>
                <p className="text-xs text-white/50 line-clamp-2 mt-1">{selectedDream.text.slice(0, 150)}...</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user"
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-[#1a1a1a] border border-white/5 text-white/80 rounded-bl-md"
                            }`}
                        >
                            {msg.role === "assistant" ? (
                                <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-sm">{msg.content}</p>
                            )}
                        </div>
                    </motion.div>
                ))}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                                <span className="text-xs text-white/30">{t("interpretingNow")}</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            {userMessageCount >= MAX_MESSAGES ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                    <p className="text-amber-300 text-sm">{t("chatLimitReached")}</p>
                    <button
                        onClick={handleBackToDreams}
                        className="mt-2 px-4 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/15 transition-colors"
                    >
                        {t("backToDreams")}
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2 bg-[#111] border border-white/10 rounded-xl p-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder={t("typeMessage") as string}
                        className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none px-2"
                        disabled={loading}
                    />
                    <button
                        disabled={!inputText.trim() || loading}
                        onClick={handleSendMessage}
                        className={`p-2 rounded-lg transition-all ${inputText.trim() && !loading
                            ? "bg-blue-600 text-white"
                            : "bg-white/5 text-white/20"
                            }`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    </button>
                </div>
            )}
        </motion.div>
    );
}


// --- WEEKLY ---

function WeeklyAnalysisView({ dreams, language, mounted }: { dreams: Dream[], language: "tr" | "en", mounted: boolean }) {
    const { t } = useLanguage();
    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(true);

    const today = new Date();
    const dateLocale = language === "tr" ? tr : enUS;
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
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
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 text-center">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{t("weeklyAnalysis")}</p>
                <h2 className="text-xl font-medium text-white">
                    {mounted ? `${format(weekStart, "d MMM", { locale: dateLocale })} - ${format(weekEnd, "d MMM", { locale: dateLocale })}` : null}
                </h2>
            </div>

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

// --- MONTHLY ---

function MonthlyAnalysisView({ dreams, language, mounted }: { dreams: Dream[], language: "tr" | "en", mounted: boolean }) {
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
                    {mounted ? format(today, "MMMM yyyy", { locale: dateLocale }) : null}
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
