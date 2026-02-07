"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveFeedback } from "@/lib/storage";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Frown, Meh, Smile, Laugh, X, Check } from "lucide-react";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Rating = 1 | 2 | 3 | 4 | 5;

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [rating, setRating] = useState<Rating | null>(null);
    const [message, setMessage] = useState("");
    const [contactPermission, setContactPermission] = useState(true);
    const [helpImprove, setHelpImprove] = useState(false);
    const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

    const ratings = [
        { value: 1, label: t("feedbackRatingTerrible"), icon: Frown, color: "text-red-400" },
        { value: 2, label: t("feedbackRatingBad"), icon: Frown, color: "text-orange-400" },
        { value: 3, label: t("feedbackRatingOkay"), icon: Meh, color: "text-yellow-400" },
        { value: 4, label: t("feedbackRatingGood"), icon: Smile, color: "text-emerald-400" },
        { value: 5, label: t("feedbackRatingAmazing"), icon: Laugh, color: "text-cyan-400" },
    ];

    const handleSubmit = async () => {
        if (!rating && !message.trim()) return;

        setStatus("sending");

        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        saveFeedback(
            `Rating: ${rating || 'N/A'}\nMessage: ${message.trim()}\nContact: ${contactPermission}\nHelp: ${helpImprove}`,
            undefined,
            user?.id,
            user?.username
        );

        setStatus("success");

        // Reset and close after showing success
        setTimeout(() => {
            setStatus("idle");
            setRating(null);
            setMessage("");
            onClose();
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
                    >
                        {status === "success" ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-2"
                                >
                                    <Check className="w-8 h-8 text-emerald-400" strokeWidth={3} />
                                </motion.div>
                                <h3 className="text-xl font-medium text-white">
                                    {t("feedbackSuccess") as string}
                                </h3>
                            </div>
                        ) : (
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-semibold text-white">
                                        {t("feedbackTitle") as string}
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-white/70 text-sm font-medium">
                                        {t("feedbackQuestion") as string}
                                    </p>

                                    <div className="grid grid-cols-5 gap-2">
                                        {ratings.map((r) => {
                                            const Icon = r.icon;
                                            const isSelected = rating === r.value;
                                            return (
                                                <button
                                                    key={r.value}
                                                    onClick={() => setRating(r.value as Rating)}
                                                    className={`
                                                        flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300
                                                        ${isSelected
                                                            ? `bg-white/5 border-white/20 ring-2 ring-white/10`
                                                            : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}
                                                    `}
                                                >
                                                    <Icon className={`w-8 h-8 ${isSelected ? r.color : 'text-white/20'}`} />
                                                    <span className={`text-[10px] font-medium uppercase tracking-wider text-center ${isSelected ? 'text-white' : 'text-white/30'}`}>
                                                        {r.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-white/70 text-sm font-medium">
                                        {t("feedbackSubtitle") as string}
                                    </p>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={t("feedbackPlaceholder") as string}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-white/20 transition-all text-sm min-h-[100px] resize-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={contactPermission}
                                                onChange={(e) => setContactPermission(e.target.checked)}
                                                className="peer appearance-none w-5 h-5 border border-white/10 rounded bg-white/5 checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer"
                                            />
                                            <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                                        </div>
                                        <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors pt-0.5">
                                            {t("feedbackContactPermission") as string} <span className="text-purple-400 hover:underline cursor-pointer">{t("feedbackPrivacyPolicy") as string}</span>
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={helpImprove}
                                                onChange={(e) => setHelpImprove(e.target.checked)}
                                                className="peer appearance-none w-5 h-5 border border-white/10 rounded bg-white/5 checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer"
                                            />
                                            <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                                        </div>
                                        <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors pt-0.5">
                                            {t("feedbackHelpImprove") as string}
                                        </span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        {t("feedbackCancel") as string}
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={(!rating && !message.trim()) || status === "sending"}
                                        className={`
                                            px-8 py-2.5 rounded-xl text-sm font-semibold transition-all
                                            ${(rating || message.trim()) && status !== "sending"
                                                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95"
                                                : "bg-white/5 text-white/20 cursor-not-allowed"}
                                        `}
                                    >
                                        {status === "sending" ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            t("feedbackSubmit") as string
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
