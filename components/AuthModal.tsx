"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser, loginUser, User } from "@/lib/storage";
import { useLanguage } from "@/hooks/use-language";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { t } = useLanguage();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"login" | "register">("login");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
            setError(t("usernameRequired") as string);
            return;
        }

        if (password.length < 6) {
            setError(t("passwordMinLength") as string);
            return;
        }

        setIsLoading(true);

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            let user: User | null = null;

            if (mode === "register") {
                if (password !== confirmPassword) {
                    throw new Error(t("passwordsDoNotMatch") as string);
                }
                user = registerUser(trimmedUsername);
            } else {
                // For demo purposes, we don't check password since we process it locally without hashing
                // In a real app, you MUST hash passwords
                user = loginUser(trimmedUsername);
                if (!user) {
                    throw new Error(t("userNotFound") as string);
                }
            }

            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                window.dispatchEvent(new Event("auth-change"));
                onClose();
                // Reset form
                setUsername("");
                setPassword("");
                setConfirmPassword("");
                setError("");
            }
        } catch (err: any) {
            setError(err.message || t("anErrorOccurred") as string);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleBackdropClick}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl shadow-black/50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <h2 className="text-xl font-medium text-white">
                                {mode === "login" ? t("loginTitle") as string : t("registerTitle") as string}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition-colors"
                                type="button"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Username */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60 font-medium">{t("username") as string}</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t("usernamePlaceholder") as string}
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60 font-medium">{t("password") as string}</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("passwordPlaceholder") as string}
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            {/* Confirm Password (Register Only) */}
                            {mode === "register" && (
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60 font-medium">{t("confirmPassword") as string}</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={t("confirmPasswordPlaceholder") as string}
                                        className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-sm text-center"
                                >
                                    {error}
                                </motion.p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        <span>{t("processing") as string}</span>
                                    </>
                                ) : (
                                    mode === "login" ? t("loginTitle") as string : t("registerTitle") as string
                                )}
                            </button>

                            {/* Toggle Mode */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode(mode === "login" ? "register" : "login");
                                        setError("");
                                    }}
                                    className="text-sm text-white/40 hover:text-white transition-colors"
                                >
                                    {mode === "login"
                                        ? t("noAccount") as string
                                        : t("hasAccount") as string}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
