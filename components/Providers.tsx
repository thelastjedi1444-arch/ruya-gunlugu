"use client";

import { LanguageProvider } from "@/hooks/use-language";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            {children}
        </LanguageProvider>
    );
}
