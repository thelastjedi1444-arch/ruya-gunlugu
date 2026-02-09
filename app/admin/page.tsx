"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { X } from "lucide-react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { UsersTable } from "@/components/admin/UsersTable";

interface User {
    id: string;
    username: string;
    createdAt: string;
    zodiacSign?: string;
    dreamCount: number;
}

interface Dream {
    id: string;
    text: string;
    date: string;
    interpretation?: string;
    username?: string;
}

interface Feedback {
    id: string;
    message: string;
    email?: string;
    createdAt: string;
    username?: string;
}

interface DashboardStats {
    totalDreams: number;
    totalUsers: number;
    thisWeekDreams: number;
    interpretedDreams: number;
    totalFeedbacks: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [dreams, setDreams] = useState<Dream[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (res.status === 401 || res.status === 403) {
                router.push("/login");
                return;
            }
            if (!res.ok) throw new Error("Failed to fetch stats");
            const data = await res.json();
            setStats(data.stats);
            setUsers(data.users);
            setDreams(data.dreams);
            setFeedbacks(data.feedbacks);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    const getUserDreams = (username: string) => dreams.filter((d) => d.username === username);

    if (isLoading && !stats) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-white/40 text-sm">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            {/* Sidebar */}
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

            {/* Main Content */}
            <main className="ml-64 min-h-screen">
                <AdminHeader />

                <div className="p-8">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white">
                            {activeTab === "overview" && "Genel Bakış"}
                            {activeTab === "users" && "Kullanıcı Yönetimi"}
                            {activeTab === "dreams" && "Rüya Kayıtları"}
                            {activeTab === "feedback" && "Geri Bildirimler"}
                        </h1>
                        <p className="text-white/40 mt-1">
                            {activeTab === "overview" && "Sistem istatistikleri ve güncel veriler"}
                            {activeTab === "users" && "Tüm kayıtlı kullanıcılar ve detayları"}
                            {activeTab === "dreams" && "Kaydedilen tüm rüyalar"}
                            {activeTab === "feedback" && "Kullanıcı geri bildirimleri"}
                        </p>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === "overview" && stats && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <DashboardStats {...stats} />
                            <AnalyticsCharts dreams={dreams} />
                            <UsersTable users={users.slice(0, 5)} onUserClick={setSelectedUser} />
                        </motion.div>
                    )}

                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <UsersTable users={users} onUserClick={setSelectedUser} />
                        </motion.div>
                    )}

                    {/* Dreams Tab */}
                    {activeTab === "dreams" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
                            {dreams.map((dream) => (
                                <div key={dream.id} className="bg-[#111] border border-white/5 rounded-xl p-5 hover:border-indigo-500/20 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                                {format(parseISO(dream.date), "d MMM HH:mm", { locale: tr })}
                                            </span>
                                            {dream.username && (
                                                <span className="text-xs font-medium text-white/50 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                                                    👤 {dream.username}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed">{dream.text}</p>
                                    {dream.interpretation && (
                                        <div className="mt-4 pl-4 border-l-2 border-indigo-500/30">
                                            <p className="text-xs text-indigo-300/70 italic">✨ {dream.interpretation.substring(0, 150)}...</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {dreams.length === 0 && <div className="text-center py-20 text-white/30">Henüz hiç rüya kaydedilmedi.</div>}
                        </motion.div>
                    )}

                    {/* Feedback Tab */}
                    {activeTab === "feedback" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
                            {feedbacks.map((feedback) => (
                                <div key={feedback.id} className="bg-[#111] border border-white/5 rounded-xl p-5 hover:border-emerald-500/20 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs font-medium text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            {format(parseISO(feedback.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                                        </span>
                                        {feedback.username && <span className="text-xs text-white/50">👤 {feedback.username}</span>}
                                        {feedback.email && <span className="text-xs text-white/50">📧 {feedback.email}</span>}
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed">{feedback.message}</p>
                                </div>
                            ))}
                            {feedbacks.length === 0 && (
                                <div className="text-center py-20 text-white/30">
                                    <p>Henüz geri bildirim yok.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>

            {/* User Detail Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                                        <span className="text-indigo-300 font-bold">{selectedUser.username.substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{selectedUser.username}</h2>
                                        <p className="text-sm text-white/40">{getUserDreams(selectedUser.username).length} rüya kaydı</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto min-h-0 space-y-4">
                                {getUserDreams(selectedUser.username).length > 0 ? (
                                    getUserDreams(selectedUser.username).map((dream) => (
                                        <div key={dream.id} className="bg-[#111] p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-indigo-400 mb-2">{format(parseISO(dream.date), "d MMMM yyyy HH:mm", { locale: tr })}</div>
                                            <p className="text-white/80 text-sm">{dream.text}</p>
                                            {dream.interpretation && (
                                                <div className="mt-3 bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/10">
                                                    <p className="text-xs text-indigo-300/70 italic">✨ {dream.interpretation}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-white/30">Bu kullanıcının henüz rüya kaydı yok.</div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
