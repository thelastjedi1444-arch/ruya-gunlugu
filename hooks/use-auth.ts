import { useState, useEffect } from 'react';
import { User } from "@/lib/storage";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            window.dispatchEvent(new Event("auth-change"));
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    useEffect(() => {
        checkAuth();

        // Listen for auth changes (from AuthModal)
        window.addEventListener('auth-change', checkAuth);
        return () => window.removeEventListener('auth-change', checkAuth);
    }, []);

    return { user, loading, checkAuth, logout };
}
