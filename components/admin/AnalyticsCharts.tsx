"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface Dream {
    date: string;
    interpretation?: string;
}

interface ChartsProps {
    dreams: Dream[];
}

export function AnalyticsCharts({ dreams }: ChartsProps) {
    // Generate data for bar chart (last 7 days activity)
    const today = new Date();
    const barChartData = [];
    const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const count = dreams.filter(d => d.date.split("T")[0] === dateStr).length;
        barChartData.push({
            name: dayNames[date.getDay()],
            count: count,
            date: date.getDate(),
        });
    }

    // Pie chart data
    const interpreted = dreams.filter(d => d.interpretation).length;
    const pending = dreams.length - interpreted;
    const pieChartData = [
        { name: "Yorumlanan", value: interpreted, color: "#6366f1" },
        { name: "Bekleyen", value: pending, color: "#fbbf24" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
            {/* Bar Chart */}
            <div className="lg:col-span-3 bg-[#111] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Rüya Aktivitesi</h3>
                        <p className="text-sm text-white/40">Son 7 günlük rüya sayısı</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/5 rounded-xl px-3 py-1.5">
                        <span className="text-xs text-white/60">Haftalık</span>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                }}
                                labelStyle={{ color: 'white', fontWeight: 600 }}
                                itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
                            />
                            <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart */}
            <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-2xl p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white">Yorum Durumu</h3>
                    <p className="text-sm text-white/40">Rüyaların yorum oranları</p>
                </div>
                <div className="h-56 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                }}
                                labelStyle={{ color: 'white' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                    {pieChartData.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-white/50">{item.name}</span>
                            <span className="text-sm font-semibold text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
