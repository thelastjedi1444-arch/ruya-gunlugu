"use client";

import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { MoreHorizontal, ChevronDown } from "lucide-react";

interface User {
    id: string;
    username: string;
    createdAt: string;
    zodiacSign?: string;
    dreamCount: number;
}

interface UsersTableProps {
    users: User[];
    onUserClick: (user: User) => void;
}

export function UsersTable({ users, onUserClick }: UsersTableProps) {
    const getZodiacEmoji = (sign?: string) => {
        const zodiacs: Record<string, string> = {
            Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
            Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
        };
        return sign ? zodiacs[sign] || "🌟" : "🌟";
    };

    return (
        <div className="mt-6 bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div>
                    <h3 className="text-lg font-semibold text-white">Kullanıcılar</h3>
                    <p className="text-sm text-white/40">{users.length} kayıtlı kullanıcı</p>
                </div>
                <button className="flex items-center gap-2 bg-[#0a0a0a] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white/60 hover:bg-[#161616] transition-colors">
                    Tüm Kullanıcılar <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-white/40 uppercase tracking-wider border-b border-white/5">
                            <th className="px-6 py-4 font-medium">Kullanıcı Adı</th>
                            <th className="px-6 py-4 font-medium">Burç</th>
                            <th className="px-6 py-4 font-medium">Rüya Sayısı</th>
                            <th className="px-6 py-4 font-medium">Kayıt Tarihi</th>
                            <th className="px-6 py-4 font-medium">Durum</th>
                            <th className="px-6 py-4 font-medium text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr
                                key={user.id}
                                onClick={() => onUserClick(user)}
                                className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                                            <span className="text-indigo-300 font-bold text-sm">{user.username.substring(0, 2).toUpperCase()}</span>
                                        </div>
                                        <span className="font-medium text-white group-hover:text-indigo-400 transition-colors">{user.username}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-lg">{getZodiacEmoji(user.zodiacSign)}</span>
                                    <span className="ml-2 text-sm text-white/50">{user.zodiacSign || "-"}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                                        {user.dreamCount} rüya
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-white/50">
                                    {format(parseISO(user.createdAt), "d MMM yyyy", { locale: tr })}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        Aktif
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="text-center py-16 text-white/30">
                        Henüz kayıtlı kullanıcı yok.
                    </div>
                )}
            </div>
        </div>
    );
}
