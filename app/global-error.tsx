"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-black text-white">
                <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Kritik Uygulama Hatası</h2>
                    <p className="text-white/60 mb-8 max-w-md bg-white/5 p-4 rounded-lg font-mono text-xs text-left overflow-auto max-h-48 w-full">
                        {error.message || "Bilinmeyen hata"}
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                        Yenile
                    </button>
                </div>
            </body>
        </html>
    );
}
