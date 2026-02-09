"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";

export default function MobileInterpretationView() {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [interpretation, setInterpretation] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Theme logic
    const isTr = language === "tr";
    const accentColor = isTr ? "text-red-500" : "text-blue-400";
    const buttonBg = isTr ? "bg-red-500" : "bg-blue-600";
    const shadowColor = isTr ? "rgba(239,68,68,0.4)" : "rgba(37,99,235,0.4)";

    const handleInterpret = async () => {
        if (!text.trim()) return;

        setIsLoading(true);
        setInterpretation("");

        try {
            const response = await fetch("/api/interpret", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    language,
                    // Pass zodiac if user exists, otherwise undefined (API handles this)
                    zodiacSign: user?.zodiacSign
                })
            });

            if (response.ok) {
                const data = await response.json();
                setInterpretation(data.interpretation);
            }
        } catch (error) {
            console.error("Interpretation failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-white px-2">
                    {t("interpretation") || "Interpretation"}
                </h2>
                <p className="text-sm text-white/40 px-2 leading-relaxed">
                    {t("interpretOrTellDream") || "Unlock the hidden meanings of your dreams instantly, without saving."}
                </p>
            </div>

            {/* Input Area */}
            <div className="bg-[#111] rounded-2xl p-4 border border-white/5 space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t("dreamPlaceholder") || "I found myself walking through a forest of glass..."}
                    className="w-full h-40 bg-transparent text-lg text-white placeholder:text-white/20 resize-none outline-none leading-relaxed"
                />

                <div className="flex justify-end">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleInterpret}
                        disabled={!text.trim() || isLoading}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${!text.trim() ? "bg-white/10" : `${buttonBg} shadow-[0_0_20px_${shadowColor}]`
                            } flex items-center gap-2`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{t("interpretingDream") || "Interpreting..."}</span>
                            </>
                        ) : (
                            <>
                                <span>{t("interpretDream")?.toString().split(" ")[0] || "Interpret"}</span>
                                <span>✨</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Result Area */}
            {interpretation && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 rounded-2xl p-6 border border-white/10 relative overflow-hidden"
                >
                    <div className={`absolute top-0 left-0 w-1 h-full ${isTr ? "bg-red-500" : "bg-blue-500"}`} />

                    <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${accentColor}`}>
                        {t("interpretation") || "INTERPRETATION"}
                    </h3>

                    <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed font-serif">
                        {interpretation.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4 last:mb-0">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
