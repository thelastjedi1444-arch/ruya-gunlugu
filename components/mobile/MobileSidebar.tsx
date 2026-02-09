import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (tab: "journal" | "calendar" | "interpret" | "settings") => void;
}

export default function MobileSidebar({ isOpen, onClose, onNavigate }: MobileSidebarProps) {
    const { t, language } = useLanguage();
    const { user, logout } = useAuth();
    const router = useRouter();
    const isTr = language === "tr";
    const hoverBg = isTr ? "hover:bg-red-500/10" : "hover:bg-blue-500/10";

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
                        className="fixed top-0 left-0 bottom-0 z-[70] w-[80%] max-w-sm bg-[#000000] border-r border-white/5 shadow-2xl flex flex-col"
                    >
                        {/* User Profile Section */}
                        {user ? (
                            <div className="p-6 border-b border-white/5 space-y-4 pt-12">
                                <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center text-2xl font-bold text-white shadow-lg border border-white/5">
                                    {user.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{user.username}</h2>
                                    <p className="text-xs text-white/40">
                                        {t("joined")}: {user.createdAt ? new Date(user.createdAt).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US") : "---"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 border-b border-white/5 space-y-4 pt-12">
                                <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-lg border border-white/5">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">Guest</h2>
                                    <p className="text-xs text-white/40">{t("noAccount")}</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="flex-1 py-6 px-4 space-y-1">
                            <SidebarLink
                                icon={HomeIcon}
                                label={t("journal")}
                                onClick={() => onNavigate("journal")}
                                hoverBg={hoverBg}
                            />
                            <SidebarLink
                                icon={CalendarIcon}
                                label={t("calendar")}
                                onClick={() => onNavigate("calendar")}
                                hoverBg={hoverBg}
                            />
                            <SidebarLink
                                icon={SparklesIcon}
                                label={t("weeklyAnalysis")}
                                onClick={() => onNavigate("interpret")}
                                hoverBg={hoverBg}
                            />
                            <div className="h-px bg-white/5 my-2 mx-4" />
                            <SidebarLink
                                icon={SettingsIcon}
                                label={t("settings")}
                                onClick={() => onNavigate("settings")}
                                hoverBg={hoverBg}
                            />
                        </div>

                        {/* Footer / Logout */}
                        <div className="p-6 border-t border-white/5">
                            {user ? (
                                <button
                                    className="w-full flex items-center justify-center p-4 rounded-2xl bg-white/5 text-red-400 font-medium hover:bg-white/10 transition-colors border border-white/5 active:scale-95"
                                    onClick={handleLogout}
                                >
                                    {t("logout")}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        onClose();
                                        router.push("/login");
                                    }}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${isTr ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                        }`}
                                >
                                    {t("login")}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function SidebarLink({ icon: Icon, label, onClick, hoverBg }: { icon: any, label: string, onClick: () => void, hoverBg?: string }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/70 hover:text-white ${hoverBg || "hover:bg-white/5"} transition-all text-left group`}
        >
            <Icon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
            <span className="font-medium text-[15px]">{label}</span>
            <div className="flex-1" />
            <svg className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors opacity-0 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
            </svg>
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

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);
