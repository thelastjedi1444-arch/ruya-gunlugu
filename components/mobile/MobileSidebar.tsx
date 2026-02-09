"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
    const { t } = useLanguage();
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        onClose();
        router.push("/login"); // or just reload/reset state
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 bottom-0 z-[70] w-3/4 max-w-xs bg-[#111] border-r border-white/10 shadow-2xl flex flex-col"
                    >
                        {/* User Profile Section */}
                        <div className="p-6 border-b border-white/5 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                {user?.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">{user?.username}</h2>
                                <p className="text-xs text-white/40">
                                    {t("joined") || "Joined"}: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 py-6 px-4 space-y-2">
                            <SidebarLink
                                icon={HomeIcon}
                                label={t("journal") || "Journal"}
                                onClick={() => {
                                    // Navigate to Journal (Home)
                                    onClose();
                                }}
                            />
                            <SidebarLink
                                icon={CalendarIcon}
                                label={t("calendar") || "Calendar"}
                                onClick={() => {
                                    // Navigate to Calendar
                                    onClose();
                                }}
                            />
                            <SidebarLink
                                icon={StatsIcon}
                                label={t("stats") || "Statistics"}
                                onClick={() => onClose()}
                            />
                            {user?.role === "ADMIN" && (
                                <SidebarLink
                                    icon={AdminIcon}
                                    label="Admin Panel"
                                    onClick={() => {
                                        router.push("/admin");
                                        onClose();
                                    }}
                                />
                            )}
                        </div>

                        {/* Footer / Logout */}
                        <div className="p-6 border-t border-white/5">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-red-400 transition-colors group"
                            >
                                <LogoutIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">{t("logout") || "Sign Out"}</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function SidebarLink({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-left group"
        >
            <Icon className="w-5 h-5 text-white/40 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">{label}</span>
        </button>
    );
}

// Icons
const HomeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const StatsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
);

const AdminIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

const LogoutIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
