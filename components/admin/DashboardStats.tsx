"use client";

import { TrendingUp, TrendingDown, Users, Moon, MessageCircle, Sparkles } from "lucide-react";

interface StatsProps {
    totalDreams: number;
    totalUsers: number;
    thisWeekDreams: number;
    interpretedDreams: number;
    totalFeedbacks: number;
}

export function DashboardStats({ totalDreams, totalUsers, thisWeekDreams, interpretedDreams, totalFeedbacks }: StatsProps) {
    const stats = [
        {
            title: "Toplam Rüya",
            value: totalDreams,
            icon: Moon,
            trend: "+12%",
            trendUp: true,
            description: "geçen aya göre",
            color: "from-indigo-500 to-blue-600",
            bgColor: "bg-indigo-500/10",
            borderColor: "border-indigo-500/20",
        },
        {
            title: "Kullanıcılar",
            value: totalUsers,
            icon: Users,
            trend: "+8%",
            trendUp: true,
            description: "geçen aya göre",
            color: "from-emerald-500 to-teal-600",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/20",
        },
        {
            title: "Bu Hafta",
            value: thisWeekDreams,
            icon: Sparkles,
            trend: "+25%",
            trendUp: true,
            description: "geçen haftaya göre",
            color: "from-orange-500 to-amber-600",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/20",
        },
        {
            title: "Yorumlanan",
            value: interpretedDreams,
            icon: Sparkles,
            trend: `${totalDreams > 0 ? Math.round((interpretedDreams / totalDreams) * 100) : 0}%`,
            trendUp: true,
            description: "yorum oranı",
            color: "from-purple-500 to-pink-600",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={`relative overflow-hidden rounded-2xl border ${stat.borderColor} ${stat.bgColor} p-5 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer group`}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:opacity-10 transition-opacity" />

                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {stat.trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {stat.trend}
                        </div>
                    </div>

                    <div>
                        <p className="text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</p>
                        <p className="text-sm text-white/50">{stat.title}</p>
                        <p className="text-xs text-white/30 mt-1">{stat.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
