"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Moon, MessageSquare, LogOut, Settings } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

export function AdminSidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
    const menuItems = [
        { id: "overview", label: "Genel Bakış", icon: LayoutDashboard },
        { id: "users", label: "Kullanıcılar", icon: Users },
        { id: "dreams", label: "Rüyalar", icon: Moon },
        { id: "feedback", label: "Geri Bildirim", icon: MessageSquare },
    ];

    return (
        <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-50">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Binary Sun
                </span>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                <div className="text-xs font-medium text-white/40 px-4 mb-2 uppercase tracking-wider">
                    Ana Menü
                </div>

                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                            activeTab === item.id
                                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-indigo-400" : "text-white/40 group-hover:text-white")} />
                        {item.label}
                    </button>
                ))}

                <div className="mt-8 text-xs font-medium text-white/40 px-4 mb-2 uppercase tracking-wider">
                    Diğer
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all group">
                    <Settings className="w-5 h-5 text-white/40 group-hover:text-white" />
                    Ayarlar
                </button>
            </nav>


            {/* User & Logout */}
            <div className="p-4 border-t border-white/5">
                <div className="bg-[#111] rounded-xl p-4 flex items-center justify-between group hover:bg-[#161616] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10">
                            <span className="text-white font-bold">A</span>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">Admin</div>
                            <div className="text-xs text-white/40">admin@binarysun.com</div>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                        title="Çıkış Yap"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
