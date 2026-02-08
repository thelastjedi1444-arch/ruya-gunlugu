// Helper to generate IDs safely across different environments (secure & non-secure contexts)
const generateId = () => {
    try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
    } catch (e) {
        // Fallback for non-secure contexts (HTTP)
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export interface User {
    id: string;
    username: string;
    createdAt: string;
}

export interface Dream {
    id: string;
    text: string;
    date: string;
    title?: string;
    interpretation?: string;
    userId?: string; // Optional for backward compatibility with existing anon dreams
    username?: string; // To avoid constant lookups
}

const STORAGE_KEY = "dream_journal_entries";
const USERS_KEY = "dream_journal_users";
const FEEDBACK_KEY = "dream_journal_feedbacks";

export interface Feedback {
    id: string;
    message: string;
    email?: string;
    createdAt: string;
    userId?: string;
    username?: string;
}

// User Management
export const getUsers = (): User[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const registerUser = (username: string): User => {
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error("Bu kullanıcı adı zaten alınmış.");
    }

    const newUser: User = {
        id: generateId(),
        username,
        createdAt: new Date().toISOString(),
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return newUser;
};

export const loginUser = (username: string): User | null => {
    const users = getUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
};

// Dream Management
export const saveDream = async (text: string, userId?: string, username?: string, language: "tr" | "en" = "tr"): Promise<Dream> => {
    const dreams = getDreams();
    const newDream: Dream = {
        id: generateId(),
        text,
        date: new Date().toISOString(),
        userId: userId || undefined, // Ensure undefined if null/empty
        username,
    };

    const updatedDreams = [newDream, ...dreams];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDreams));

    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dream-saved"));
    }

    // Generate title immediately and update
    try {
        const titleRes = await fetch("/api/generate-title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, language }),
        });
        const titleData = await titleRes.json();
        if (titleData.title) {
            updateDream(newDream.id, { title: titleData.title });
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("dream-saved"));
            }
        }
    } catch (error) {
        console.error("Title generation failed:", error);
    }

    return newDream;
};

export const getDreams = (userId?: string | null): Dream[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    const allDreams: Dream[] = stored ? JSON.parse(stored) : [];

    if (userId) {
        return allDreams.filter(d => d.userId === userId);
    }
    return allDreams.filter(d => !d.userId);
};

export const updateDream = (id: string, updates: Partial<Dream>) => {
    // We get ALL dreams because we need to write back the full list
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const dreams: Dream[] = stored ? JSON.parse(stored) : [];
    const updatedDreams = dreams.map((d) =>
        d.id === id ? { ...d, ...updates } : d
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDreams));
};

export const deleteDream = (id: string) => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const dreams: Dream[] = stored ? JSON.parse(stored) : [];
    const filteredDreams = dreams.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDreams));
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dream-saved"));
    }
};

export const getStorageStats = (userId?: string | null) => {
    const dreams = getDreams(userId);
    const users = getUsers();
    const feedbacks = getFeedbacks();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekDreams = dreams.filter(d => new Date(d.date) >= weekAgo);
    const interpretedDreams = dreams.filter(d => d.interpretation);
    const avgLength = dreams.length > 0
        ? Math.round(dreams.reduce((acc, d) => acc + d.text.length, 0) / dreams.length)
        : 0;

    // Storage size calculation
    const storageUsed = new Blob([localStorage.getItem(STORAGE_KEY) || ""]).size +
        new Blob([localStorage.getItem(USERS_KEY) || ""]).size +
        new Blob([localStorage.getItem(FEEDBACK_KEY) || ""]).size;

    return {
        totalDreams: dreams.length,
        interpretedDreams: interpretedDreams.length,
        thisWeekDreams: thisWeekDreams.length,
        avgDreamLength: avgLength,
        storageBytes: storageUsed,
        totalUsers: users.length,
        totalFeedbacks: feedbacks.length,
    };
};

// Feedback Management
export const getFeedbacks = (): Feedback[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(FEEDBACK_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveFeedback = (message: string, email?: string, userId?: string, username?: string): Feedback => {
    const feedbacks = getFeedbacks();
    const newFeedback: Feedback = {
        id: generateId(),
        message,
        email,
        createdAt: new Date().toISOString(),
        userId,
        username,
    };

    localStorage.setItem(FEEDBACK_KEY, JSON.stringify([newFeedback, ...feedbacks]));

    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("feedback-saved"));
    }

    return newFeedback;
};
