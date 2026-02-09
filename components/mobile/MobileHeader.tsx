import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

interface MobileHeaderProps {
    title?: string;
    mode?: "default" | "entry";
    onMenuClick?: () => void;
    onSearchClick?: (query: string) => void;
    onCancel?: () => void;
    onSave?: () => void;
    saveDisabled?: boolean;
}

export default function MobileHeader({
    title = "iDream",
    mode = "default",
    onMenuClick,
    onSearchClick,
    onCancel,
    onSave,
    saveDisabled = false,
}: MobileHeaderProps) {
    const { t } = useLanguage();
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isSearching) {
            inputRef.current?.focus();
        }
    }, [isSearching]);

    const handleSearchToggle = () => {
        if (isSearching) {
            setIsSearching(false);
            onSearchClick?.(""); // Clear search
        } else {
            setIsSearching(true);
        }
    };

    if (mode === "entry") {
        return (
            <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                <div className="relative flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-3 h-[60px]">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onCancel}
                        className="text-white/70 text-base font-medium px-2 py-1"
                    >
                        {t("feedbackCancel") || "Cancel"}
                    </motion.button>

                    <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                        {title}
                    </span>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onSave}
                        disabled={saveDisabled}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${saveDisabled
                            ? "bg-white/10 text-white/30"
                            : "bg-white text-black"
                            }`}
                    >
                        {t("save") || "Save"}
                    </motion.button>
                </div>
            </header>
        );
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div className="relative flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] h-[calc(env(safe-area-inset-top,12px)+56px)]">
                {/* Left: Menu Button / Search Icon when searching? No, keep Menu. */}
                {!isSearching && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
                        onClick={onMenuClick}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </motion.button>
                )}

                {/* Center: Title / Search Input */}
                <div className="flex-1 flex justify-center px-2">
                    <AnimatePresence mode="wait">
                        {isSearching ? (
                            <motion.input
                                key="search-input"
                                initial={{ opacity: 0, scale: 0.95, width: "80%" }}
                                animate={{ opacity: 1, scale: 1, width: "100%" }}
                                exit={{ opacity: 0, scale: 0.95, width: "80%" }}
                                ref={inputRef}
                                type="text"
                                placeholder={t("tellYourDream")}
                                onChange={(e) => onSearchClick?.(e.target.value)}
                                className="bg-white/10 text-white text-sm px-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-white/30 w-full"
                            />
                        ) : (
                            <motion.h1
                                key="title"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-white font-serif text-xl tracking-wide italic"
                            >
                                {title}
                            </motion.h1>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Search Toggle */}
                <button
                    onClick={handleSearchToggle}
                    className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
                >
                    {isSearching ? (
                        <span className="text-white text-sm font-medium">{t("feedbackCancel") || "Cancel"}</span>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    )}
                </button>
            </div>
        </header>
    );
}
