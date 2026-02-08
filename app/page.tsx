"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { saveDream, getDreams, updateDream, Dream } from "@/lib/storage";
import { analyzeWeeklyDreams } from "@/lib/weekly-analysis";
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isWithinInterval } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import FadeInText from "@/components/Typewriter";
import SmoothScrollText from "@/components/SmoothScrollText";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import LanguageToggle from "@/components/LanguageToggle";
import FeedbackModal from "@/components/FeedbackModal";
import { deleteDream as deleteDreamStorage, updateUser } from "@/lib/storage";
import ZodiacWheel from "@/components/ZodiacWheel";

function DreamJournalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isTypingNewDreamRef = useRef(false);

  const [dream, setDream] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "interpreting" | "interpreted">("idle");
  const [interpretation, setInterpretation] = useState("");
  const [activeDreamText, setActiveDreamText] = useState("");
  const [dreamId, setDreamId] = useState<string | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState('100vh');
  const [showZodiacPrompt, setShowZodiacPrompt] = useState(false);
  const [promptZodiacSign, setPromptZodiacSign] = useState<string | undefined>(undefined);
  const [hasDismissedZodiac, setHasDismissedZodiac] = useState(false);

  // Auth State
  const { user, loading: authLoading, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'tr-TR';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += (i > 0 ? ' ' : '') + event.results[i][0].transcript;
          }
          setDream(transcript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert('Tarayıcınız ses tanıma özelliğini desteklemiyor.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  // Language
  const { language, t } = useLanguage();
  const dateLocale = language === "tr" ? tr : enUS;

  // Sidebar State
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Weekly analysis
  const [showWeeklyAnalysis, setShowWeeklyAnalysis] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [weeklyAnalysisText, setWeeklyAnalysisText] = useState("");
  const [dayDetail, setDayDetail] = useState<Date | null>(null);

  // Weekly Date Calculations
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const isDayHasDream = (date: Date) => {
    return dreams.some(d => isSameDay(parseISO(d.date), date));
  };

  // Handle initial screen size for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load dreams
  const loadDreams = () => {
    // Filter by current user ID if logged in, or show guest dreams if not
    setDreams(getDreams(user?.id));
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleVisualViewportChange = () => {
      const vv = window.visualViewport;
      if (!vv) return;

      // Update viewport height dynamically to handle keyboard
      setViewportHeight(`${vv.height}px`);

      // If keyboard is likely open (viewport significantly smaller than screen)
      // or if focused on input, ensure it's visible
      if (document.activeElement?.tagName === 'TEXTAREA' || vv.height < window.innerHeight * 0.8) {
        setTimeout(() => {
          inputContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };

    window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    window.visualViewport.addEventListener('scroll', handleVisualViewportChange);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleVisualViewportChange);
    };
  }, []);

  useEffect(() => {
    loadDreams();
    const handleStorageUpdate = () => loadDreams();
    window.addEventListener("dream-saved", handleStorageUpdate);
    // window.addEventListener("auth-change", handleStorageUpdate); // No longer needed as we depend on [user]
    return () => {
      window.removeEventListener("dream-saved", handleStorageUpdate);
      // window.removeEventListener("auth-change", handleStorageUpdate);
    };
  }, [user]); // Re-run when user changes (login/logout)

  // Check for missing Zodiac Sign
  useEffect(() => {
    if (user && !user.zodiacSign && !hasDismissedZodiac) {
      // Simple delay to not be annoying immediately on load
      const timer = setTimeout(() => setShowZodiacPrompt(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowZodiacPrompt(false);
    }
  }, [user, hasDismissedZodiac]);

  const handleSaveZodiac = () => {
    if (promptZodiacSign && user) {
      updateUser(user.username, { zodiacSign: promptZodiacSign });
      // No need to set show false manually as effect will handle it, but for instant UI feedback:
      setShowZodiacPrompt(false);
    }
  };

  // Load dream if ID is present
  useEffect(() => {
    // If we're typing a new dream, ignore ID updates or lack of ID (don't wipe input)
    if (isTypingNewDreamRef.current) return;

    if (id) {
      const found = dreams.find((d) => d.id === id);
      if (found) {
        setDream("");
        setActiveDreamText(found.text);
        setDreamId(found.id);
        if (found.interpretation) {
          setInterpretation(found.interpretation);
          setStatus("interpreted");
        } else {
          setInterpretation("");
          setStatus("saved");
        }
      }
    } else {
      // Only reset to idle if we're not currently in the middle of showing a newly saved/interpreted dream
      // and we don't have an ID in the URL.
      setDream("");
      setInterpretation("");
      setActiveDreamText("");
      setDreamId(null);
      setStatus("idle");
    }
  }, [id, dreams, status]);

  // Auto-scroll to bottom when status becomes "saved" to reveal the Interpret button
  useEffect(() => {
    if (status === "saved" && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, [status]);



  const handleSave = async () => {
    if (!dream.trim()) return;

    if (status === "interpreted") {
      const text = dream;
      setInterpretation("");
      setActiveDreamText("");
      setDreamId(null);
      setStatus("idle");

      setStatus("saving");
      // Removed artificial delay
      // await new Promise(resolve => setTimeout(resolve, 600));

      await new Promise(resolve => setTimeout(resolve, 600));

      const newDream = await saveDream(text, user?.id, user?.username, language);

      // Navigate to the new dream's ID
      handleSelectDream(newDream.id);

      setDream("");
      setActiveDreamText(text);

      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = "";
        textarea.style.height = 'auto';
      }

      setDreamId(newDream.id);
      setStatus("saved");
      return;
    }

    const currentText = dream;
    setStatus("saving");

    // Remove artificial delay to fix "lag"/double-glitch feel
    // await new Promise(resolve => setTimeout(resolve, 600));

    // await new Promise(resolve => setTimeout(resolve, 600));

    const newDream = await saveDream(currentText, user?.id, user?.username, language);


    // Navigate to the new dream's ID to prevent useEffect from resetting the state
    handleSelectDream(newDream.id);

    setDream("");
    setActiveDreamText(currentText);

    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = "";
      textarea.style.height = 'auto';
    }

    setDreamId(newDream.id);
    setStatus("saved");
  };

  const handleInterpret = async () => {
    setStatus("interpreting");
    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeDreamText, language, zodiacSign: user?.zodiacSign }),
      });

      const data = await res.json();
      if (data.interpretation) {
        setInterpretation(data.interpretation);
        setStatus("interpreted");

        if (dreamId) {
          updateDream(dreamId, { interpretation: data.interpretation });
        }
      }
    } catch (error) {
      console.error("Interpretation failed", error);
      setStatus("saved");
    }
  };

  const handleSelectDream = (selectedId: string) => {
    isTypingNewDreamRef.current = false;
    router.push(`/?id=${selectedId}`);
  };

  const handleDeleteDream = (idToDelete: string) => {
    deleteDreamStorage(idToDelete);
    if (id === idToDelete) {
      router.push("/");
    }
  };

  const handleWeeklyAnalysis = async () => {
    setShowWeeklyAnalysis(true);
    setWeeklyAnalysisText(t("gatheringWhispers") as string);

    try {
      // Filter dreams for weekly analysis - maybe only user's if logged in?
      // For now, let's keep analyzing all visible dreams
      const analysis = await analyzeWeeklyDreams(dreams, language);
      setWeeklyAnalysisText(analysis);
    } catch (error) {
      console.error("Weekly analysis error:", error);
      setWeeklyAnalysisText(t("analysisError") as string);
    }
  };

  const getDreamsForDay = (date: Date) => {
    return dreams.filter(d => isSameDay(parseISO(d.date), date));
  };

  const handleDayDetail = (day: Date) => {
    setDayDetail(day);
  };

  return (
    <>
      <AnimatePresence>
        {showWeeklyAnalysis && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowWeeklyAnalysis(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 shrink-0 flex items-center justify-between bg-[#1a1a1a]">
                <div>
                  <h2 className="text-xl font-medium text-white">{t("weeklyAnalysis") as string}</h2>
                  <p className="text-sm text-muted/60 mt-1">
                    {format(weekStart, "d MMM", { locale: dateLocale })} - {format(weekEnd, "d MMM", { locale: dateLocale })}
                  </p>
                </div>
                <button
                  onClick={() => setShowWeeklyAnalysis(false)}
                  className="p-2 rounded-lg text-muted/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar bg-[#111]">
                {/* Timeline Visualization */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {weekDays.map((day, i) => {
                    const hasDream = isDayHasDream(day);
                    const isCurrentDay = isToday(day);
                    return (
                      <motion.div
                        key={day.toISOString()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`
                          relative flex flex-col items-center justify-center p-2 rounded-lg border h-16 cursor-pointer overflow-hidden group
                          ${hasDream
                            ? "bg-white/5 border-white/10"
                            : "bg-transparent border-white/5 opacity-50 hover:opacity-100"}
                          ${isCurrentDay ? "ring-1 ring-cyan-500/50" : ""}
                        `}
                      >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <span className="text-[10px] font-medium text-muted/60 uppercase relative z-10">{format(day, "EEE", { locale: dateLocale })}</span>
                        <div className={`w-1.5 h-1.5 rounded-full mt-1 relative z-10 transition-all duration-300 group-hover:scale-125 ${hasDream ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]" : "bg-white/20"}`} />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="relative bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 group overflow-hidden cursor-default">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-4xl font-extralight text-white relative z-10 group-hover:scale-110 transition-transform duration-300">
                      {dreams.filter(d => isWithinInterval(parseISO(d.date), { start: weekStart, end: weekEnd })).length}
                    </span>
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.2em] relative z-10">{t("dreamCountLabel") as string}</span>
                  </div>
                  <div className="relative bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 group overflow-hidden cursor-default">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-4xl font-extralight text-white relative z-10 group-hover:scale-110 transition-transform duration-300">
                      {dreams
                        .filter(d => isWithinInterval(parseISO(d.date), { start: weekStart, end: weekEnd }))
                        .reduce((acc, curr) => acc + curr.text.split(" ").length, 0)}
                    </span>
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.2em] relative z-10">{t("wordCountLabel") as string}</span>
                  </div>
                </div>

                <div className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-headings:text-white/90 prose-strong:text-white/90 prose-li:text-gray-300">
                  <ReactMarkdown
                    components={{
                      h3: ({ node, ...props }) => <h3 className="text-xl font-medium mt-8 mb-4 flex items-center gap-2" {...props} />,
                      p: ({ node, ...props }) => <p className="leading-relaxed font-light mb-4 text-white/70" {...props} />
                    }}
                  >
                    {weeklyAnalysisText}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between shrink-0 bg-[#0f0f0f] rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-medium text-white">
                    {format(dayDetail!, "d MMMM yyyy", { locale: dateLocale })}
                  </h2>
                  <p className="text-sm text-muted/50 mt-1">
                    {format(dayDetail!, "EEEE", { locale: dateLocale })}
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

              <div className="p-6 overflow-y-auto min-h-0">
                {getDreamsForDay(dayDetail!).length > 0 ? (
                  <div className="space-y-8">
                    {getDreamsForDay(dayDetail!).map((dream, idx) => (
                      <div key={dream.id} className="relative pl-6 border-l-2 border-[#262626] last:border-l-transparent">
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
                          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/20 border border-indigo-500/10 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-2 mb-2 text-indigo-300/80 text-sm font-medium uppercase tracking-wider">
                              <span>🌙</span>
                              <span>{t("interpretationLabel") as string}</span>
                            </div>
                            <div className="text-sm text-gray-400 italic leading-relaxed">
                              {dream.interpretation}
                            </div>
                          </div>
                        )}
                        {/* Creator Info */}
                        {dream.username && (
                          <div className="mt-2 text-xs text-white/30 flex items-center gap-1">
                            <span>👤</span>
                            <span>{dream.username}</span>
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
                    <p className="text-muted/50 text-lg">Bu gün için henüz rüya kaydı yok.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />

      <div className="flex w-full min-h-screen relative pt-16">
        {/* Auth Button & Language Toggle */}
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-3">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm font-medium shadow-lg shadow-black/50 hover:bg-[#262626] active:scale-95 transition-all group"
          >
            <span>{t("feedbackButton") as string}</span>
          </button>
          <LanguageToggle />
          {user ? (
            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/10 rounded-xl p-1 pr-4 shadow-lg shadow-black/50">
              <div className="w-8 h-8 rounded-lg bg-[#262626] border border-white/10 flex items-center justify-center text-xs font-bold text-white uppercase transition-colors">
                {user.username.substring(0, 2)}
              </div>
              <span className="text-sm font-medium text-white hidden md:inline">{user.username}</span>
              <button
                onClick={logout}
                className="text-xs text-white/50 hover:text-white transition-colors ml-2"
                title={t("logout") as string}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm font-medium shadow-lg shadow-black/50 hover:bg-[#262626] active:scale-95 transition-all"
            >
              {t("login") as string}
            </button>
          )}
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-[60] md:hidden p-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white shadow-lg shadow-black/50 hover:bg-[#262626] active:scale-95 transition-all"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isSidebarOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>

        <Sidebar
          isOpen={isSidebarOpen}
          dreams={dreams}
          onSelectDream={handleSelectDream}
          onDeleteDream={handleDeleteDream}
          currentDreamId={dreamId}
          onWeeklyAnalysis={handleWeeklyAnalysis}
          onDayClick={handleDayDetail}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div style={{ height: viewportHeight }} className="flex-1 flex flex-col w-full md:ml-80 transition-all duration-300 overflow-hidden">
          <div ref={scrollRef} className="flex-1 w-full flex flex-col px-4 md:px-8 space-y-6 pb-48 pt-32 md:pt-20 overflow-y-auto custom-scrollbar max-w-3xl mx-auto scroll-m-20">
            <div className="flex-1 min-h-[20vh]" />
            <AnimatePresence mode="popLayout">
              {activeDreamText && (
                <motion.div
                  key="user-bubble"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  className="w-full flex justify-end"
                >
                  <div className="bg-[#262626] border border-white/10 text-white px-5 py-3 md:px-6 md:py-4 rounded-2xl rounded-tr-sm max-w-[90%] md:max-w-[75%] text-base md:text-lg shadow-2xl backdrop-blur-sm relative group overflow-hidden break-words">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-slate-500/5 rounded-2xl rounded-tr-sm opacity-50" />
                    <p className="relative z-10 leading-relaxed font-light tracking-wide text-gray-100 whitespace-pre-wrap break-words">
                      {activeDreamText}
                    </p>
                  </div>
                </motion.div>
              )}

              {(status === "saving" || status === "interpreting") && (
                <motion.div
                  key="loading-bubble"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex justify-center py-4"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-xs">🌙</div>
                    </div>
                    <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-slate-300 animate-pulse tracking-widest uppercase">
                      {status === "saving" ? t("savingDream") as string : t("interpretingDream") as string}
                    </span>
                  </div>
                </motion.div>
              )}

              {interpretation && (
                <motion.div
                  key="ai-bubble"
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  className="w-full flex justify-start"
                >
                  <div className="flex gap-3 md:gap-4 max-w-[95%] md:max-w-[80%]">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-900 to-slate-800 flex items-center justify-center shadow-lg shadow-indigo-500/10 mt-1 border border-white/5">
                      <span className="text-white text-xs">🌙</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-indigo-300 tracking-widest uppercase ml-1">{t("interpretation") as string}</span>
                      <div className="bg-[#1a1a1a]/80 border border-white/5 px-5 py-4 md:px-6 md:py-5 rounded-2xl rounded-tl-sm shadow-xl backdrop-blur-md overflow-hidden break-words">
                        <div className="prose prose-invert prose-base md:prose-lg max-w-none text-gray-300 font-light leading-7 md:leading-8 whitespace-pre-wrap break-words">
                          <SmoothScrollText
                            text={interpretation}
                            scrollContainerRef={scrollRef as React.RefObject<HTMLElement>}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {(status === "saved" && !interpretation) && (
                <motion.div
                  key="action-interpret"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center gap-8 py-8"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-white/40 text-[10px] md:text-sm font-semibold uppercase tracking-[0.3em]"
                  >
                    <span>{t("noteSaved") as string}</span>
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                      className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                  </motion.div>

                  <motion.button
                    onClick={handleInterpret}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="group flex flex-col items-center gap-3 px-8 py-4 border border-[#262626] rounded-full hover:border-white/20 hover:bg-[#111] transition-all"
                  >
                    <span className="text-sm tracking-[0.2em] uppercase text-muted group-hover:text-white transition-colors">
                      {t("interpretDream") as string}
                    </span>
                  </motion.button>
                </motion.div>
              )}

              {(status === "interpreted" || (status === "saved" && interpretation)) && (
                <motion.div
                  key="action-reset"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full flex justify-center py-8 pb-12"
                >
                  <div className="flex items-center gap-3 text-white/30 text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em]">
                    <span>{t("noteSaved") as string}</span>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                      className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/5 border border-emerald-500/10"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-safe-bottom" />
          </div>

          <div
            ref={inputContainerRef}
            style={{ height: status === "idle" ? 'auto' : undefined }}
            className={`fixed left-0 md:left-80 right-0 z-50 px-4 pb-6 pt-4 md:px-8 transition-all duration-300
              ${status === "idle"
                ? "bottom-0 md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:flex md:items-center md:justify-center"
                : "bottom-0"}
              bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent
            `}
          >
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
              <AnimatePresence>
                {status === "idle" && (
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xl md:text-2xl font-light text-foreground/70 tracking-wide text-center mb-2"
                  >
                    {user ? `${t("welcomeUser")} ${user.username}, ${(t("whisperQuestion") as string).toLowerCase()}` : t("whisperQuestion") as string}
                  </motion.h1>
                )}
              </AnimatePresence>
              <div className="relative w-full flex items-center gap-3 bg-[#111] border border-[#333] rounded-2xl px-4 py-3 shadow-lg">
                <textarea
                  value={dream}
                  onChange={(e) => {
                    const newValue = e.target.value;

                    // If we are showing an interpretation, reset immediately on typing
                    if (status === "interpreted" || (status === "saved" && interpretation)) {
                      isTypingNewDreamRef.current = true;

                      // Critical: Wipe existing state but keep input focused and typing
                      setStatus("idle");
                      setInterpretation("");
                      setActiveDreamText("");
                      setDreamId(null);

                      // Silently clear URL without full reload to prevent state wipe
                      window.history.pushState({}, '', '/');
                    }

                    setDream(newValue);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSave();
                      const target = e.target as HTMLTextAreaElement;
                      target.value = "";
                      target.style.height = 'auto';
                    }
                  }}
                  onFocus={() => {
                    setTimeout(() => {
                      inputContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                  disabled={status === "saving"}
                  placeholder={status === "interpreted" || (status === "saved" && interpretation) ? t("tellAnotherDream") as string : status === "saved" ? t("interpretOrTellDream") as string : t("tellYourDream") as string}
                  className="flex-1 bg-transparent text-base md:text-lg text-foreground placeholder:text-muted/30 resize-none focus:outline-none py-1 max-h-32 min-h-[28px] scrollbar-hide disabled:opacity-50"
                  rows={1}
                />
                {/* Microphone Button */}
                <motion.button
                  onClick={toggleListening}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={`p-2 rounded-full transition-all duration-300 ${isListening
                    ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    : "bg-[#262626] text-muted/50 hover:text-white hover:bg-[#333]"}`}
                  title={isListening ? "Dinlemeyi durdur" : "Sesle yaz"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={!dream.trim() || status === "saving"}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={`p-2 rounded-full transition-all duration-300 ${dream.trim() && status !== "saving"
                    ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    : "bg-[#262626] text-muted/30 cursor-not-allowed"
                    }`}
                >
                  {status === "saving" ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div >
      </div >


      {/* Zodiac Prompt Modal */}
      <AnimatePresence>
        {
          showZodiacPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden"
              >
                <button
                  onClick={() => {
                    setHasDismissedZodiac(true);
                    setShowZodiacPrompt(false);
                  }}
                  className="absolute top-4 right-4 text-white/50 hover:text-white"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>

                <h2 className="text-xl md:text-2xl font-light text-center text-white mb-6">
                  Rüya yorumlarını kişiselleştirmek için burcunu seç!
                </h2>

                <div className="py-2">
                  <ZodiacWheel
                    selectedSign={promptZodiacSign}
                    onSelect={setPromptZodiacSign}
                  />
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={handleSaveZodiac}
                    disabled={!promptZodiacSign}
                    className="bg-white text-black px-8 py-2 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center text-muted font-light tracking-widest pt-20">Ruhun Yükleniyor...</div>}>
      <DreamJournalContent />
    </Suspense>
  );
}
