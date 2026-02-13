"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

export default function NewVersionModal() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem("hasSeenNewVersion_v2");
        if (!hasSeen) {
            // Delay slightly for smoother entrance
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem("hasSeenNewVersion_v2", "true");
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-sm overflow-hidden"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 text-center space-y-6">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                                <span className="text-3xl">✨</span>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white">
                                    {t("welcomeNewVersionTitle")}
                                </h2>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    {t("welcomeNewVersionDesc")}
                                </p>
                            </div>

                            <div className="space-y-3 text-left bg-white/5 rounded-xl p-4 border border-white/5">
                                <FeatureItem icon="💬" title={t("featureChatTitle")} desc={t("featureChatDesc")} />
                                <FeatureItem icon="📊" title={t("featureStatsTitle")} desc={t("featureStatsDesc")} />
                                <FeatureItem icon="🚀" title={t("featureFastTitle")} desc={t("featureFastDesc")} />
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-lg shadow-white/10"
                            >
                                {t("startExploring")}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
    return (
        <div className="flex gap-3 items-start">
            <span className="text-lg bg-white/5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">{icon}</span>
            <div>
                <h3 className="text-sm font-medium text-white">{title}</h3>
                <p className="text-xs text-white/40">{desc}</p>
            </div>
        </div>
    );
}
