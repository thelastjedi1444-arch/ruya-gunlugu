"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SmoothScrollTextProps {
    text: string;
    onComplete?: () => void;
    speed?: number;
    scrollContainerRef: React.RefObject<HTMLElement>;
}

export default function SmoothScrollText({
    text,
    onComplete,
    speed = 20,
    scrollContainerRef
}: SmoothScrollTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const [userHasScrolled, setUserHasScrolled] = useState(false);
    const lastScrollTop = useRef(0);
    const isAutoScrolling = useRef(false);

    // Split text into paragraphs for cleaner rendering
    const paragraphs = text.split('\n').filter(p => p.trim());

    // Scroll Detection Logic
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            // Ignore scroll events triggered by our auto-scroll
            if (isAutoScrolling.current) {
                isAutoScrolling.current = false;
                lastScrollTop.current = container.scrollTop;
                return;
            }

            // Detect manual scroll up
            if (container.scrollTop < lastScrollTop.current - 5) {
                setUserHasScrolled(true);
            }

            // Use tolerance for "bottom" detection to resume auto-scroll
            const isAtBottom =
                Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 50;

            if (isAtBottom) {
                setUserHasScrolled(false);
            }

            lastScrollTop.current = container.scrollTop;
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [scrollContainerRef]);


    // Typing Effect
    useEffect(() => {
        let currentIndex = 0;
        setIsComplete(false);
        setDisplayedText("");

        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText((prev) => prev + text[currentIndex]);
                currentIndex++;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                onComplete?.();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, onComplete]);


    // Auto-Scroll Logic
    useEffect(() => {
        if (userHasScrolled || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const targetScroll = container.scrollHeight;

        // Use requestAnimationFrame for smoother scrolling
        const smoothScroll = () => {
            if (userHasScrolled) return;

            isAutoScrolling.current = true;
            container.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        };

        smoothScroll();

    }, [displayedText, userHasScrolled, scrollContainerRef]);

    return (
        <div className="space-y-4">
            {displayedText.split('\n').map((paragraph, index) => (
                <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="leading-relaxed"
                >
                    {paragraph}
                </motion.p>
            ))}
        </div>
    );
}
