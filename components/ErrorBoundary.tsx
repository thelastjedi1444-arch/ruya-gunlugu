"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });
        console.error("=== ERROR BOUNDARY CAUGHT ===");
        console.error("Error:", error.message);
        console.error("Stack:", error.stack);
        console.error("Component Stack:", errorInfo.componentStack);
        console.error("=== END ERROR BOUNDARY ===");
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-lg space-y-4">
                        <h2 className="text-xl font-bold text-red-400 text-center">
                            🐛 Hata Yakalandı / Error Caught
                        </h2>

                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <p className="text-xs font-mono text-red-300 break-all">
                                <strong>Message:</strong> {this.state.error?.message}
                            </p>
                        </div>

                        {this.state.error?.stack && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-40 overflow-auto">
                                <p className="text-[10px] font-mono text-white/60 whitespace-pre-wrap break-all">
                                    <strong className="text-white/80">Stack Trace:</strong>{"\n"}
                                    {this.state.error.stack}
                                </p>
                            </div>
                        )}

                        {this.state.errorInfo?.componentStack && (
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 max-h-40 overflow-auto">
                                <p className="text-[10px] font-mono text-blue-300/80 whitespace-pre-wrap break-all">
                                    <strong className="text-blue-300">Component Stack:</strong>{"\n"}
                                    {this.state.errorInfo.componentStack}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null, errorInfo: null });
                            }}
                            className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            Tekrar Dene / Retry
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
