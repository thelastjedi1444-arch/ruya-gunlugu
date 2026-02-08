"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SmoothScrollTextProps {
    text: string;
    onComplete?: () => void;
    speed?: number; // Word reveal speed (ms)
    scrollContainerRef: React.RefObject<HTMLElement>;
}

export default function SmoothScrollText({
    text,
    onComplete,
    speed = 30, // Default speed
    scrollContainerRef
}: SmoothScrollTextProps) {
    const [visibleWordCount, setVisibleWordCount] = useState(0);
    const [userHasScrolled, setUserHasScrolled] = useState(false);
    const lastScrollTop = useRef(0);
    const isAutoScrolling = useRef(false);

    // Split text into stable words array
    const words = text ? text.split(" ") : [];

    // Reset and start typing effect when text changes
    useEffect(() => {
        setVisibleWordCount(0);

        if (!text) return;

        const interval = setInterval(() => {
            setVisibleWordCount((prev) => {
                if (prev < words.length) {
                    return prev + 1;
                } else {
                    clearInterval(interval);
                    onComplete?.();
                    return prev;
                }
            });
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, onComplete]); // Re-run effect if text prop changes

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

    // Smart Auto-Scroll Logic
    useEffect(() => {
        if (userHasScrolled || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const threshold = 100; // Only scroll if content is near the bottom edge
        const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

        if (distanceToBottom > threshold && !isAutoScrolling.current) {
            // Don't scroll if we are far up
            return;
        }

        // Scroll to bottom
        const targetScroll = container.scrollHeight;

        isAutoScrolling.current = true;
        container.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });

    }, [visibleWordCount, userHasScrolled, scrollContainerRef]);

    // Construct displayed content based on visible count
    const visibleWords = words.slice(0, visibleWordCount);
    // Join with spaces to reconstruct text, then split by newlines for paragraph handling
    const textContent = visibleWords.join(" ");
    const paragraphs = textContent.split("\n");

    return (
        <div className="space-y-4">
            {paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="leading-relaxed break-words whitespace-pre-wrap">
                    {paragraph.split(" ").map((word, wIndex) => (
                        <motion.span
                            key={`${pIndex}-${wIndex}-${word}`} // Added word content to key for better uniqueness if needed, though index is usually sufficient
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
