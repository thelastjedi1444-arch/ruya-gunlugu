"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const router = useRouter();

    // Debounce username check
    useEffect(() => {
        const checkUsername = async () => {
            if (username.length < 3) {
                setIsUsernameAvailable(null);
                return;
            }

            setIsCheckingUsername(true);
            try {
                const res = await fetch("/api/auth/check-username", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username }),
                });
                const data = await res.json();
                setIsUsernameAvailable(data.available);
            } catch (err) {
                console.error("Username check failed", err);
                setIsUsernameAvailable(null);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (username) checkUsername();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isUsernameAvailable === false) {
            setError("Bu kullanıcı adı zaten alınmış.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Kayıt başarısız");
                setLoading(false);
                return;
            }

            // Redirect to admin panel on success
            router.push("/admin");
        } catch (err) {
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-purple-900/10">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                            <span className="text-2xl">📝</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Kayıt Ol</h1>
                        <p className="text-white/40 text-sm">Yeni bir hesap oluşturun</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <label htmlFor="username" className="block text-sm font-medium text-white/60 mb-2">
                                Kullanıcı Adı
                            </label>
                            <div className="relative">
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all ${isUsernameAvailable === true
                                            ? "border-green-500/50 focus:ring-green-500/50"
                                            : isUsernameAvailable === false
                                                ? "border-red-500/50 focus:ring-red-500/50"
                                                : "border-white/10 focus:ring-purple-500/50 focus:border-transparent"
                                        }`}
                                    placeholder="Kullanıcı adınızı seçin"
                                    required
                                    autoComplete="username"
                                />
                                {/* Icons */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                    {isCheckingUsername ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isUsernameAvailable === true && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="text-green-500 text-lg"
                                                >
                                                    ✓
                                                </motion.span>
                                            )}
                                            {isUsernameAvailable === false && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="text-red-500 text-lg"
                                                >
                                                    ✕
                                                </motion.span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            {/* Validation Message */}
                            {username.length > 0 && !isCheckingUsername && (
                                <div className="absolute -bottom-5 left-0 text-xs">
                                    {isUsernameAvailable === false && (
                                        <span className="text-red-400">Bu kullanıcı adı zaten alınmış</span>
                                    )}
                                    {isUsernameAvailable === true && (
                                        <span className="text-green-400">Kullanıcı adı uygun</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/60 mb-2">
                                Şifre
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                placeholder="Şifrenizi belirleyin"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || isUsernameAvailable === false}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Kayıt yapılıyor...</span>
                                </div>
                            ) : (
                                "Kayıt Ol"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-white/40">
                            Zaten hesabınız var mı?{" "}
                            <a href="/login" className="text-white hover:underline transition-colors">
                                Giriş Yap
                            </a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
