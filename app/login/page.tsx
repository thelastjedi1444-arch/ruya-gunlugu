"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            let data;
            try {
                data = await res.json();
            } catch (jsonError) {
                console.error("Failed to parse JSON response:", jsonError);
                throw new Error(`Sunucu hatası: ${res.status} ${res.statusText}`);
            }

            if (!res.ok) {
                setError(data.error || `Giriş başarısız (${res.status})`);
                setLoading(false);
                return;
            }

            // Redirect to admin panel on success
            router.push("/admin");
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
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
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-2xl">🌙</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Admin Girişi</h1>
                        <p className="text-white/40 text-sm">Devam etmek için giriş yapın</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-white/60 mb-2">
                                Kullanıcı Adı
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                placeholder="Kullanıcı adınızı girin"
                                required
                                autoComplete="username"
                            />
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
                                placeholder="Şifrenizi girin"
                                required
                                autoComplete="current-password"
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
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Giriş yapılıyor...</span>
                                </div>
                            ) : (
                                "Giriş Yap"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-white/40">
                            Hesabınız yok mu?{" "}
                            <a href="/register" className="text-white hover:underline transition-colors">
                                Kayıt Ol
                            </a>
                        </p>
                        <a href="/" className="block text-sm text-white/40 hover:text-white transition-colors">
                            ← Ana Sayfaya Dön
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
