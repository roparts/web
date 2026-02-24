"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
    texts: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    className?: string;
    cursorClassName?: string;
}

export function TypewriterText({
    texts,
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 2000,
    className,
    cursorClassName
}: TypewriterTextProps) {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentFullText = texts[currentIndex];

        let timer: NodeJS.Timeout;

        if (isDeleting) {
            // Deleting characters
            timer = setTimeout(() => {
                setDisplayText(currentFullText.substring(0, displayText.length - 1));
            }, deletingSpeed);
        } else {
            // Typing characters
            timer = setTimeout(() => {
                setDisplayText(currentFullText.substring(0, displayText.length + 1));
            }, typingSpeed);
        }

        // Handle string completion/deletion states
        if (!isDeleting && displayText === currentFullText) {
            // Finished typing, wait before deleting
            clearTimeout(timer);
            timer = setTimeout(() => setIsDeleting(true), pauseDuration);
        } else if (isDeleting && displayText === '') {
            // Finished deleting, move to next text
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % texts.length);
        }

        return () => clearTimeout(timer);
    }, [displayText, isDeleting, currentIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

    return (
        <span className={cn("inline-flex items-center", className)}>
            {displayText}
            <span className={cn("ml-1 animate-pulse", cursorClassName)}>|</span>
        </span>
    );
}
