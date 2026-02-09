"use client";

import { Bell, Search } from "lucide-react";

export function AdminHeader() {
    return (
        <header className="h-20 bg-[#0a0a0a]/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">

            {/* Search Bar */}
            <div className="relative w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-white/5 rounded-xl leading-5 bg-[#111] text-white placeholder-white/20 focus:outline-none focus:bg-[#161616] focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/30 sm:text-sm transition-all shadow-sm"
                    placeholder="Ara..."
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">

                <button className="relative p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0a0a0a]" />
                </button>

                <div className="h-8 w-[1px] bg-white/5 mx-2" />

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-medium text-white">Ahmet Vural</div>
                        <div className="text-xs text-indigo-400">Super Admin</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                        <span className="text-indigo-300 font-bold">AV</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
