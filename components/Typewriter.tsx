"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function FadeInText({ text, delay = 50 }: { text: string; delay?: number }) {
    const [visibleWords, setVisibleWords] = useState(0);
    const words = text.split(" ");

    useEffect(() => {
        if (visibleWords < words.length) {
            const timeout = setTimeout(() => {
                setVisibleWords((prev) => prev + 1);
            }, delay);
            return () => clearTimeout(timeout);
        }
    }, [visibleWords, words.length, delay]);

    return (
        <span>
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index < visibleWords ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "inline-block", marginRight: "0.25em" }}
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}
