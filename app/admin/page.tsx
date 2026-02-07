"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getDreams, getUsers, getStorageStats, getFeedbacks, Dream, User, Feedback } from "@/lib/storage";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "dreams" | "feedback">("overview");
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [dreams, setDreams] = useState<Dream[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        // Initial load
        refreshData();

        // Listen for updates
        const handleUpdate = () => refreshData();
        window.addEventListener("dream-saved", handleUpdate);
        window.addEventListener("auth-change", handleUpdate);
        window.addEventListener("feedback-saved", handleUpdate);
        return () => {
            window.removeEventListener("dream-saved", handleUpdate);
            window.removeEventListener("auth-change", handleUpdate);
            window.removeEventListener("feedback-saved", handleUpdate);
        };
    }, []);

    const refreshData = () => {
        setStats(getStorageStats());
        setUsers(getUsers());
        setDreams(getDreams());
        setFeedbacks(getFeedbacks());
    };

    const getUserDreams = (username: string) => {
        return dreams.filter(d => d.username === username);
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Admin Paneli
                    </h1>
                    <p className="text-white/40 mt-1">Sistem istatistikleri ve kullanıcı yönetimi</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-[#1a1a1a] rounded-xl p-1 border border-white/5">
                        {(["overview", "users", "dreams", "feedback"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? "bg-white text-black shadow-lg"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {tab === "overview" && "Genel Bakış"}
                                {tab === "users" && "Kullanıcılar"}
                                {tab === "dreams" && "Rüyalar"}
                                {tab === "feedback" && "Geri Bildirimler"}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        Çıkış
                    </button>
                </div>
            </header>

            {/* Overview Tab */}
            {activeTab === "overview" && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <StatCard
                        title="Toplam Rüya"
                        value={stats.totalDreams}
                        icon="🌙"
                        color="from-purple-500/20 to-blue-500/20"
                        border="border-purple-500/20"
                        onClick={() => setActiveTab("dreams")}
                    />
                    <StatCard
                        title="Kullanıcılar"
                        value={stats.totalUsers}
                        icon="👥"
                        color="from-emerald-500/20 to-teal-500/20"
                        border="border-emerald-500/20"
                        onClick={() => setActiveTab("users")}
                    />
                    <StatCard
                        title="Bu Hafta"
                        value={stats.thisWeekDreams}
                        icon="📅"
                        color="from-orange-500/20 to-red-500/20"
                        border="border-orange-500/20"
                    />
                    <StatCard
                        title="Yorumlanan"
                        value={stats.interpretedDreams}
                        icon="✨"
                        color="from-pink-500/20 to-rose-500/20"
                        border="border-pink-500/20"
                    />
                    <StatCard
                        title="Geri Bildirim"
                        value={stats.totalFeedbacks}
                        icon="💬"
                        color="from-indigo-500/20 to-purple-500/20"
                        border="border-indigo-500/20"
                        onClick={() => setActiveTab("feedback")}
                    />
                </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => {
                            const userDreamCount = getUserDreams(user.username).length;
                            return (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 hover:bg-[#222] transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xl font-bold">
                                            {user.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/40 group-hover:bg-white/10 transition-colors">
                                            {userDreamCount} Rüya
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-1 group-hover:text-purple-400 transition-colors">
                                        {user.username}
                                    </h3>
                                    <p className="text-sm text-white/30">
                                        Kayıt: {format(parseISO(user.createdAt), "d MMMM yyyy", { locale: tr })}
                                    </p>
                                </div>
                            );
                        })}

                        {users.length === 0 && (
                            <div className="col-span-full text-center py-20 text-white/30">
                                Henüz kayıtlı kullanıcı yok.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Dreams Tab */}
            {activeTab === "dreams" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {dreams.map((dream) => (
                        <div key={dream.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="text-xs font-medium text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                                        {format(parseISO(dream.date), "d MMM HH:mm", { locale: tr })}
                                    </div>
                                    {dream.username && (
                                        <div className="text-xs font-medium text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 flex items-center gap-1">
                                            <span>👤</span> {dream.username}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-white/80 text-sm line-clamp-2 md:line-clamp-none">{dream.text}</p>
                            {dream.interpretation && (
                                <div className="mt-3 pl-4 border-l-2 border-purple-500/30 text-xs text-white/50 italic">
                                    ✨ {dream.interpretation.substring(0, 100)}...
                                </div>
                            )}
                        </div>
                    ))}
                    {dreams.length === 0 && (
                        <div className="text-center py-20 text-white/30">
                            Henüz hiç rüya kaydedilmedi.
                        </div>
                    )}
                </div>
            )}

            {/* Feedback Tab */}
            {activeTab === "feedback" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 hover:border-indigo-500/20 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="text-xs font-medium text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                                        {format(parseISO(feedback.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                                    </div>
                                    {feedback.username && (
                                        <div className="text-xs font-medium text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 flex items-center gap-1">
                                            <span>👤</span> {feedback.username}
                                        </div>
                                    )}
                                    {feedback.email && (
                                        <div className="text-xs font-medium text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                                            <span>📧</span> {feedback.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-white/80 text-sm leading-relaxed">{feedback.message}</p>
                        </div>
                    ))}
                    {feedbacks.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <span className="text-2xl">💬</span>
                            </div>
                            <p className="text-white/30">Henüz geri bildirim yok.</p>
                            <p className="text-white/20 text-sm mt-1">Kullanıcılar geri bildirim gönderdiğinde burada görünecek.</p>
                        </div>
                    )}
                </div>
            )}

            {/* User Detail Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="text-2xl">👤</span> {selectedUser.username}
                                    </h2>
                                    <p className="text-sm text-white/40 mt-1">
                                        Toplam {getUserDreams(selectedUser.username).length} rüya kaydı
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 transition-colors"
                                >
                                    X
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto min-h-0 space-y-4">
                                {getUserDreams(selectedUser.username).length > 0 ? (
                                    getUserDreams(selectedUser.username).map(dream => (
                                        <div key={dream.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-blue-400 mb-2 font-mono">
                                                {format(parseISO(dream.date), "d MMMM yyyy HH:mm", { locale: tr })}
                                            </div>
                                            <p className="text-white/80 text-sm">{dream.text}</p>
                                            {dream.interpretation && (
                                                <div className="mt-3 bg-purple-900/10 p-3 rounded-lg border border-purple-500/10">
                                                    <p className="text-xs text-purple-300/70 italic">
                                                        ✨ {dream.interpretation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-white/30">
                                        Bu kullanıcının henüz rüya kaydı yok.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

function StatCard({ title, value, icon, color, border, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-6 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]`}
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{icon}</span>
                {onClick && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40">
                        ↗
                    </div>
                )}
            </div>

            <div className="relative">
                <h3 className="text-white/50 text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
}
