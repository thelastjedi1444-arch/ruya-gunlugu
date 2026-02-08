"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const zodiacSigns = [
    { name: "Koç", symbol: "♈", element: "Ateş", traits: "Cesur, öncü, enerjik", description: "Rüyalarınız aksiyon doludur; bilinçaltınız size harekete geçmeniz gereken alanları fısıldar." },
    { name: "Boğa", symbol: "♉", element: "Toprak", traits: "Güvenilir, sabırlı, pratik", description: "Rüyalarınız duyusal ve nettir; doğa ve huzur temalarıyla geleceğe dair sağlam ipuçları verir." },
    { name: "İkizler", symbol: "♊", element: "Hava", traits: "Meraklı, uyumlu, zeki", description: "Rüyalarınız bol diyalog ve bilgi içerir; zihdiniz uyurken bile çözümler üretmeye devam eder." },
    { name: "Yengeç", symbol: "♋", element: "Su", traits: "Sezgisel, duygusal, koruyucu", description: "Rüyalarınız geçmiş ve anılarla doludur; duygusal derinliklerinizde saklı mesajları gün yüzüne çıkarır." },
    { name: "Aslan", symbol: "♌", element: "Ateş", traits: "Yaratıcı, tutkulu, cömert", description: "Rüyalarınız parlak ve sahne ışıklarıyla doludur; içsel gücünüzü ve liderlik potansiyelinizi yansıtır." },
    { name: "Başak", symbol: "♍", element: "Toprak", traits: "Analitik, çalışkan, pratik", description: "Rüyalarınız detaycı ve düzenleyicidir; hayatınızdaki karmaşayı çözmeniz için size rehberlik eder." },
    { name: "Terazi", symbol: "♎", element: "Hava", traits: "Diplomatik, zarif, adil", description: "Rüyalarınız estetik ve denge arayışındadır; ilişkilerinizdeki uyumu veya çatışmayı size aynalar." },
    { name: "Akrep", symbol: "♏", element: "Su", traits: "Tutkulu, inatçı, becerikli", description: "Gizemli ve yoğun rüyalarınızla bilinçaltınızın en derin sırlarını keşfedersiniz; dönüşüm kaçınılmazdır." },
    { name: "Yay", symbol: "♐", element: "Ateş", traits: "Cömert, idealist, esprili", description: "Rüyalarınız keşif ve macera doludur; size yeni ufuklar ve felsefi bakış açıları sunar." },
    { name: "Oğlak", symbol: "♑", element: "Toprak", traits: "Sorumlu, disiplinli, yönetici", description: "Rüyalarınız hedefler ve yapılarla ilgilidir; size başarıya giden yolda disiplinli mesajlar verir." },
    { name: "Kova", symbol: "♒", element: "Hava", traits: "İlerici, orijinal, bağımsız", description: "Rüyalarınız sıra dışı ve futuristiktir; toplumsal olaylara veya geleceğe dair vizyonlar sunabilir." },
    { name: "Balık", symbol: "♓", element: "Su", traits: "Sanatsal, sezgisel, nazik", description: "Rüyalarınız okyanus kadar derin ve semboliktir; evrensel bilinçle bağlantı kurmanızı sağlar." },
];

interface ZodiacWheelProps {
    onSelect: (sign: string) => void;
    selectedSign: string | undefined;
}

export default function ZodiacWheel({ onSelect, selectedSign }: ZodiacWheelProps) {
    const [rotation, setRotation] = useState(0);

    const handleSignClick = (index: number) => {
        // Calculate rotation needed to bring this sign to top (or center)
        // 12 signs, 30 degrees each.
        // If index 0 is at top (0 deg), clicking index 1 (30 deg) should rotate wheel by -30 deg.
        const anglePerItem = 360 / zodiacSigns.length;
        const targetRotation = -index * anglePerItem;

        // Adjust rotation to be smooth (find shortest path)
        // Current rotation might be 360 * n. 
        // This simple logic is fine for basic interaction.
        setRotation(targetRotation);
        onSelect(zodiacSigns[index].name);
    };

    const currentSign = zodiacSigns.find(s => s.name === selectedSign);

    return (
        <div className="flex flex-col items-center space-y-8 py-6 w-full max-w-md mx-auto">
            {/* Mandated Text */}
            <h3 className="text-xl md:text-2xl font-light text-center text-foreground/90 italic font-serif leading-relaxed px-4">
                "Yıldızların konumunu paylaş; rüyalarının derinliklerindeki mistik kodları burcunla beraber çözelim."
            </h3>

            {/* Wheel Container */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                {/* Active Indicator (Pointer) at Top */}
                <div className="absolute -top-4 w-4 h-4 bg-primary rotate-45 z-20 shadow-[0_0_15px_rgba(var(--primary),0.8)]" />

                {/* The Rotating Wheel */}
                <motion.div
                    className="relative w-full h-full rounded-full border-2 border-primary/20 bg-background/50 backdrop-blur-sm shadow-[0_0_30px_rgba(var(--primary),0.1)]"
                    animate={{ rotate: rotation }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                    {zodiacSigns.map((sign, index) => {
                        const angle = (index * 360) / zodiacSigns.length;
                        const radius = 100; // base radius percentage? No, px.
                        // Using absolute positioning from center
                        // 0 deg is top? CSS rotate starts from heavy right usually if not adjusted.
                        // Let's assume standard intuitive clock. 0 is top (12 o'clock).
                        // Transform origin is center.
                        return (
                            <motion.button
                                key={sign.name}
                                className={`absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center rounded-full text-2xl transition-all duration-300
                  ${selectedSign === sign.name ? "scale-125 bg-primary/20 text-primary shadow-glow" : "text-muted-foreground hover:text-foreground hover:scale-110"}`}
                                style={{
                                    top: "50%",
                                    left: "50%",
                                    transform: `rotate(${angle}deg) translate(0, -${110}px) rotate(-${angle}deg)`,
                                    // translate Y -110px moves it UP from center.
                                    // rotate(-angle) keeps the text upright.
                                }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent modal close or other clicks?
                                    handleSignClick(index);
                                }}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {sign.symbol}
                            </motion.button>
                        );
                    })}

                    {/* Inner Decorative Circle */}
                    <div className="absolute inset-0 m-auto w-2/3 h-2/3 rounded-full border border-primary/10 border-dashed animate-spin-slow" style={{ animationDuration: '60s' }} />
                </motion.div>

                {/* Center Display (Static or fading) */}
                <div className="absolute inset-0 m-auto w-24 h-24 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-primary/30 z-10 pointer-events-none">
                    <AnimatePresence mode="wait">
                        {currentSign ? (
                            <motion.div
                                key={currentSign.name}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="text-center"
                            >
                                <div className="text-4xl mb-1">{currentSign.symbol}</div>
                                <div className="text-xs font-bold tracking-widest uppercase text-primary">{currentSign.name}</div>
                            </motion.div>
                        ) : (
                            <span className="text-4xl opacity-20">✨</span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Dynamic Description */}
            <div className="min-h-[80px] w-full px-6 text-center">
                <AnimatePresence mode="wait">
                    {currentSign && (
                        <motion.div
                            key={currentSign.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            <h4 className="text-lg font-semibold text-primary">{currentSign.name} ({currentSign.element})</h4>
                            <p className="text-sm md:text-base text-muted-foreground leading-snug">
                                "{currentSign.description}"
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
