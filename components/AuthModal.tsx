import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import ZodiacWheel from "./ZodiacWheel";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { t } = useLanguage();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [zodiacSign, setZodiacSign] = useState<string | undefined>(undefined);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [mode, setMode] = useState<"login" | "register">("login");

    // Real-time validation states
    const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "error">("idle");
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    // Debounced username check
    useEffect(() => {
        if (mode === "register" && username.trim().length >= 3) {
            const timer = setTimeout(async () => {
                setUsernameStatus("checking");
                try {
                    const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username.trim())}`);
                    if (!res.ok) {
                        setUsernameStatus("error");
                        return;
                    }
                    const data = await res.json();
                    setUsernameStatus(data.available ? "available" : "taken");
                } catch (err) {
                    setUsernameStatus("error");
                }
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setUsernameStatus("idle");
        }
    }, [username, mode]);

    // Password match check
    useEffect(() => {
        if (mode === "register") {
            setPasswordsMatch(password.length >= 6 && password === confirmPassword);
        }
    }, [password, confirmPassword, mode]);

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

        try {
            if (mode === "register") {
                if (password !== confirmPassword) {
                    throw new Error(t("passwordsDoNotMatch") as string);
                }

                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: trimmedUsername,
                        password,
                        zodiacSign
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || t("anErrorOccurred") as string);
                }

            } else {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: trimmedUsername,
                        password
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || t("userNotFound") as string);
                }
            }

            // Success animation/delay
            setIsSuccess(true);
            await new Promise(resolve => setTimeout(resolve, 1500));

            window.dispatchEvent(new Event("auth-change"));
            onClose();

            // Reset form
            setUsername("");
            setPassword("");
            setConfirmPassword("");
            setError("");
            setIsSuccess(false);
            setUsernameStatus("idle");
        } catch (err: any) {
            setError(err.message || t("anErrorOccurred") as string);
            setIsLoading(false);
        } finally {
            if (!isSuccess) setIsLoading(false);
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
                        className={`bg-[#1a1a1a] border border-white/10 rounded-2xl w-full ${mode === "register" ? "max-w-xl" : "max-w-sm"} shadow-2xl shadow-black/50 flex flex-col max-h-[90vh] transition-all duration-500`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <h2 className={`text-xl font-medium transition-colors duration-300 ${isSuccess ? "text-green-400" : "text-white"}`}>
                                {isSuccess
                                    ? (mode === "login" ? t("loginSuccess") : t("registerSuccess")) as string
                                    : (mode === "login" ? t("loginTitle") : t("registerTitle")) as string
                                }
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
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                            {/* Username */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60 font-medium flex justify-between items-center">
                                    <span>{t("username") as string}</span>
                                    {mode === "register" && usernameStatus !== "idle" && (
                                        <span className={`text-[10px] uppercase tracking-wider font-bold ${usernameStatus === "checking" ? "text-white/40" :
                                                usernameStatus === "available" ? "text-green-400" :
                                                    "text-red-400"
                                            }`}>
                                            {usernameStatus === "checking" ? "..." :
                                                usernameStatus === "available" ? t("usernameAvailable") :
                                                    usernameStatus === "taken" ? "Bu ad alınmış" : "Sistem hatası"}
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder={t("usernamePlaceholder") as string}
                                        className={`w-full bg-[#0f0f0f] border rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-all duration-300 ${isSuccess ? "border-green-500/50 bg-green-500/5" :
                                            mode === "register" && usernameStatus === "available" ? "border-green-500/30" :
                                                mode === "register" && (usernameStatus === "taken" || usernameStatus === "error") ? "border-red-500/30" : "border-white/10"
                                            }`}
                                    />
                                    {mode === "register" && usernameStatus === "available" && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm text-white/60 font-medium flex justify-between items-center">
                                    <span>{t("password") as string}</span>
                                    {mode === "register" && password.length >= 6 && !confirmPassword && (
                                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Lütfen teyit edin</span>
                                    )}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("passwordPlaceholder") as string}
                                    className={`w-full bg-[#0f0f0f] border rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-all duration-300 ${isSuccess ? "border-green-500/50 bg-green-500/5" : "border-white/10"
                                        }`}
                                />
                            </div>

                            {/* Confirm Password (Register Only) */}
                            {mode === "register" && (
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60 font-medium flex justify-between items-center">
                                        <span>{t("confirmPassword") as string}</span>
                                        {passwordsMatch && (
                                            <span className="text-[10px] text-green-400 uppercase tracking-wider font-bold">{t("passwordsMatch") as string}</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={t("confirmPasswordPlaceholder") as string}
                                            className={`w-full bg-[#0f0f0f] border rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-all duration-300 ${isSuccess ? "border-green-500/50 bg-green-500/5" :
                                                passwordsMatch ? "border-green-500/30" : "border-white/10"
                                                }`}
                                        />
                                        {passwordsMatch && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Zodiac Wheel for Registration */}
                            {mode === "register" && (
                                <div className="border-t border-white/10 pt-6">
                                    <ZodiacWheel
                                        selectedSign={zodiacSign}
                                        onSelect={setZodiacSign}
                                        t={t}
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
                                disabled={isLoading || isSuccess}
                                className={`w-full font-medium py-3 rounded-xl transition-all duration-500 flex items-center justify-center gap-2 transform ${isSuccess ? "bg-green-500 text-white scale-[1.02]" : "bg-white text-black hover:bg-white/90"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isLoading && !isSuccess ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        <span>{t("processing") as string}</span>
                                    </>
                                ) : isSuccess ? (
                                    <div className="flex items-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Tamam!</span>
                                    </div>
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
                                        setUsernameStatus("idle");
                                        setIsSuccess(false);
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
