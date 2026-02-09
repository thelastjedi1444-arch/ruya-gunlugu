"use client";

import { motion, AnimatePresence } from "framer-motion";

export const zodiacSignKeys = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
] as const;

export const zodiacSymbols: Record<string, string> = {
    aries: "♈",
    taurus: "♉",
    gemini: "♊",
    cancer: "♋",
    leo: "♌",
    virgo: "♍",
    libra: "♎",
    scorpio: "♏",
    sagittarius: "♐",
    capricorn: "♑",
    aquarius: "♒",
    pisces: "♓",
};


interface ZodiacWheelProps {
    onSelect: (sign: string) => void;
    selectedSign: string | undefined;
    t?: (key: any) => any;
}

export default function ZodiacWheel({ onSelect, selectedSign, t = (key) => key }: ZodiacWheelProps) {
    const localizedZodiacSigns = t("zodiacSigns") as any;
    const currentSignData = selectedSign ? localizedZodiacSigns[selectedSign] : undefined;

    return (
        <div className="w-full space-y-6">
            {/* Instruction Text */}
            <div className="text-center px-4">
                <h3 className="text-base md:text-lg font-light text-white/90 italic font-serif leading-relaxed">
                    "{t("zodiacInstruction") || "Yıldızların konumunu paylaş; rüyalarının derinliklerindeki mistik kodları burcunla beraber çözelim."}"
                </h3>
            </div>

            {/* Grid Selection */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
                {zodiacSignKeys.map((signKey) => {
                    const sign = localizedZodiacSigns[signKey];
                    const isSelected = selectedSign === signKey;
                    return (
                        <motion.button
                            key={signKey}
                            type="button"
                            onClick={() => onSelect(signKey)}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                relative flex flex-col items-center justify-center p-2 md:p-3 rounded-xl border transition-all duration-300
                                ${isSelected
                                    ? "bg-blue-500/10 border-blue-500 ring-1 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                }
                            `}
                        >
                            <span
                                className={`text-xl md:text-2xl mb-1 ${isSelected ? "text-blue-400" : "text-white/60"}`}
                                style={{
                                    textShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                                    filter: "grayscale(100%) brightness(200%) sepia(100%) hue-rotate(180deg) saturate(300%)" // Force blue/white monochrome
                                }}
                            >
                                {zodiacSymbols[signKey]}
                            </span>
                            <span className={`text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-center ${isSelected ? "text-blue-400" : "text-white/40"}`}>
                                {sign.name}
                            </span>

                            {isSelected && (
                                <motion.div
                                    layoutId="zodiac-active-glow"
                                    className="absolute inset-0 rounded-xl bg-blue-500/5 pointer-events-none"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Dynamic Description Box */}
            <AnimatePresence mode="wait">
                {selectedSign ? (() => {
                    // Assuming selectedSign is the key (e.g., "aries")
                    const currentSign = localizedZodiacSigns[selectedSign];

                    return currentSign ? (
                        <motion.div
                            key={selectedSign}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 md:p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span
                                    className="text-2xl md:text-3xl text-blue-400"
                                    style={{
                                        textShadow: "0 0 12px rgba(96, 165, 250, 0.6)",
                                        filter: "grayscale(100%) brightness(200%) sepia(100%) hue-rotate(180deg) saturate(300%)"
                                    }}
                                >
                                    {zodiacSymbols[selectedSign]}
                                </span>
                                <div>
                                    <h4 className="text-sm md:text-base font-semibold text-blue-400">
                                        {currentSign.name} <span className="text-white/30 text-xs font-normal ml-2">({currentSign.element})</span>
                                    </h4>
                                    <p className="text-[9px] md:text-[10px] text-blue-400/60 font-medium tracking-widest uppercase">
                                        {currentSign.traits}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs md:text-sm text-white/70 leading-relaxed font-light mt-2 border-t border-white/5 pt-3">
                                "{currentSign.description}"
                            </p>
                        </motion.div>
                    ) : null;
                })() : (
                    <div className="h-20 md:h-24 flex items-center justify-center rounded-2xl border border-dashed border-white/5 text-white/20 text-xs md:text-sm">
                        {t("selectZodiacPlaceholder") || "Bir burç seçerek rüya yorumunu derinleştir..."}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

