import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, getStorageStats, updateUser } from "@/lib/storage";
import { useLanguage } from "@/hooks/use-language";
import { format, parseISO } from "date-fns";
import { tr, enUS } from "date-fns/locale";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

const ZODIAC_SIGNS = [
    { id: "aries", local: { tr: "Koç", en: "Aries" }, icon: "♈" },
    { id: "taurus", local: { tr: "Boğa", en: "Taurus" }, icon: "♉" },
    { id: "gemini", local: { tr: "İkizler", en: "Gemini" }, icon: "♊" },
    { id: "cancer", local: { tr: "Yengeç", en: "Cancer" }, icon: "♋" },
    { id: "leo", local: { tr: "Aslan", en: "Leo" }, icon: "♌" },
    { id: "virgo", local: { tr: "Başak", en: "Virgo" }, icon: "♍" },
    { id: "libra", local: { tr: "Terazi", en: "Libra" }, icon: "♎" },
    { id: "scorpio", local: { tr: "Akrep", en: "Scorpio" }, icon: "♏" },
    { id: "sagittarius", local: { tr: "Yay", en: "Sagittarius" }, icon: "♐" },
    { id: "capricorn", local: { tr: "Oğlak", en: "Capricorn" }, icon: "♑" },
    { id: "aquarius", local: { tr: "Kova", en: "Aquarius" }, icon: "♒" },
    { id: "pisces", local: { tr: "Balık", en: "Pisces" }, icon: "♓" },
];

export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
    const { language, t } = useLanguage();
    const dateLocale = language === "tr" ? tr : enUS;
    const stats = getStorageStats(user.id);

    const [username, setUsername] = useState(user.username);
    const [zodiacSign, setZodiacSign] = useState(user.zodiacSign || "");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setUsername(user.username);
            setZodiacSign(user.zodiacSign || "");
        }
    }, [isOpen, user]);

    const handleSave = () => {
        updateUser(user.username, { username, zodiacSign });
        setIsEditing(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header / Avatar */}
                        <div className="relative h-32 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-b border-white/5 flex items-center justify-center">
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                                {user.username.substring(0, 2).toUpperCase()}
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* User Identity */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xl font-medium text-white w-full focus:outline-none focus:border-indigo-500"
                                                autoFocus
                                            />
                                        ) : (
                                            <h2 className="text-2xl font-semibold text-white">{user.username}</h2>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                        className="ml-4 p-2 hover:bg-white/5 rounded-lg text-indigo-400 text-sm font-medium transition-colors"
                                    >
                                        {isEditing ? t("save") : t("edit")}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1">
                                            {t("registrationDate") as string}
                                        </span>
                                        <span className="text-sm text-white/80">
                                            {user.createdAt ? format(parseISO(user.createdAt), "d MMM yyyy", { locale: dateLocale }) : "-"}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1">
                                            {t("zodiacSign") as string}
                                        </span>
                                        {isEditing ? (
                                            <select
                                                value={zodiacSign}
                                                onChange={(e) => setZodiacSign(e.target.value)}
                                                className="bg-transparent text-sm text-indigo-400 focus:outline-none w-full cursor-pointer"
                                            >
                                                <option value="" disabled>{language === "tr" ? "Seç" : "Select"}</option>
                                                {ZODIAC_SIGNS.map(sign => (
                                                    <option key={sign.id} value={sign.id} className="bg-[#0f0f0f]">
                                                        {sign.icon} {language === "tr" ? sign.local.tr : sign.local.en}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-sm text-indigo-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis block">
                                                {zodiacSign ? (
                                                    <>
                                                        {ZODIAC_SIGNS.find(s => s.id === zodiacSign)?.icon} {" "}
                                                        {language === "tr"
                                                            ? ZODIAC_SIGNS.find(s => s.id === zodiacSign)?.local.tr
                                                            : ZODIAC_SIGNS.find(s => s.id === zodiacSign)?.local.en}
                                                    </>
                                                ) : (
                                                    language === "tr" ? "Belirlenmedi" : "Not set"
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-3xl flex flex-col items-center text-center group">
                                    <span className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">🔥</span>
                                    <span className="text-2xl font-bold text-white leading-none">{stats.streak}</span>
                                    <span className="text-[10px] text-indigo-300/60 uppercase tracking-wider font-bold mt-1">
                                        {t("streakDays") as string}
                                    </span>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-slate-500/10 to-blue-500/10 border border-white/5 rounded-3xl flex flex-col items-center text-center group">
                                    <span className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">📖</span>
                                    <span className="text-2xl font-bold text-white leading-none">{stats.totalDreams}</span>
                                    <span className="text-[10px] text-slate-300/60 uppercase tracking-wider font-bold mt-1">
                                        {t("totalDreamsCount") as string}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0">
                            <div className="h-px bg-white/5 mb-6" />
                            <p className="text-[10px] text-white/20 text-center uppercase tracking-widest font-medium">
                                {language === "tr" ? "Zihnin Sana Ne Fısıldıyor?" : "What is your mind whispering?"}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
