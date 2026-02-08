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
    speed = 30, // Slightly faster default speed for words
    scrollContainerRef
}: SmoothScrollTextProps) {
    const [displayedWords, setDisplayedWords] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [userHasScrolled, setUserHasScrolled] = useState(false);
    const lastScrollTop = useRef(0);
    const isAutoScrolling = useRef(false);
    const wordsRef = useRef<string[]>([]);

    // Prepare words on text change
    useEffect(() => {
        wordsRef.current = text.split(" ");
        setDisplayedWords([]);
        setIsComplete(false);
    }, [text]);

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
            if (container.scrollTop < lastScrollTop.current - 10) {
                setUserHasScrolled(true);
            }

            // Resume auto-scroll if user manually scrolls back to bottom
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

    // Word Streaming Effect
    useEffect(() => {
        if (!wordsRef.current.length) return;

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < wordsRef.current.length) {
                setDisplayedWords((prev) => [...prev, wordsRef.current[currentIndex]]);
                currentIndex++;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                onComplete?.();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, onComplete]);

    // Smart Auto-Scroll Logic
    useEffect(() => {
        if (userHasScrolled || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const threshold = 100; // Only scroll if content is near the bottom edge
        const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

        if (distanceToBottom > threshold && !isAutoScrolling.current) {
            // Don't scroll if we are far up (unless it's the very start)
            // But here we rely on userHasScrolled flag mostly.
        }

        // Always scroll to bottom if allowed
        const targetScroll = container.scrollHeight;

        isAutoScrolling.current = true;
        container.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });

    }, [displayedWords, userHasScrolled, scrollContainerRef]);

    // Reconstruct paragraphs from words for display
    const textContent = displayedWords.join(" ");
    const paragraphs = textContent.split("\n");

    return (
        <div className="space-y-4">
            {paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="leading-relaxed">
                    {paragraph.split(" ").map((word, wIndex) => (
                        <motion.span
                            key={`${pIndex}-${wIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            {word}{" "}
                        </motion.span>
                    ))}
                </p>
            ))}
        </div>
    );
}
