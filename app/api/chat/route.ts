import { NextResponse } from "next/server";

const GEMINI_API_KEYS = (process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);

export async function POST(req: Request) {
    if (GEMINI_API_KEYS.length === 0) {
        console.error("API keys missing in environment");
        return NextResponse.json(
            { error: "API key not configured" },
            { status: 500 }
        );
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json(
            { error: "Messages array is required" },
            { status: 400 }
        );
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content;

    // Use keys sequentially
    for (const key of GEMINI_API_KEYS) {
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

        try {
            console.log(`Chat API: Attempting request with key ending in ...${key.slice(-5)}`);
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }],
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Gemini API Error (${response.status}):`, errorText);
                continue; // Try next key
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return NextResponse.json({
                    response: data.candidates[0].content.parts[0].text
                });
            } else {
                console.error("Unexpected API response structure:", JSON.stringify(data));
                continue;
            }
        } catch (error) {
            console.error("API Request Failed:", error);
            continue;
        }
    }

    return NextResponse.json(
        { error: "All API keys failed or rate limited" },
        { status: 503 }
    );
}
