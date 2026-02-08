import { NextResponse } from "next/server";

const GEMINI_API_KEYS = (process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);

export async function POST(req: Request) {
    if (GEMINI_API_KEYS.length === 0) {
        return NextResponse.json(
            { error: "API key not configured" },
            { status: 500 }
        );
    }

    const { text, language } = await req.json();
    if (!text) {
        return NextResponse.json(
            { error: "Dream text is required" },
            { status: 400 }
        );
    }

    const lang = language || 'tr';
    const langName = lang === 'en' ? 'English' : 'Turkish';


    const prompt = `
      You are a dream title generator. Create a SHORT, poetic title (max 4-6 words) in ${langName} for this dream.

      Rules:
      - First letter of each major word should be capitalized
      - Be creative but concise
      - Capture the essence of the dream
      - Include 1 relevant emoji at the end
      - Return ONLY the title, nothing else
      
      Dream: "${text}"
    `;

    // Try keys sequentially until one works
    for (const key of GEMINI_API_KEYS) {
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const title = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

                if (title) {
                    return NextResponse.json({ title });
                }
            } else {
                const errorText = await response.text();
                console.error(`Title API Error with key ...${key.slice(-5)}:`, response.status, errorText);
                if (response.status === 429 || response.status >= 500) continue;

                return NextResponse.json(
                    { error: `API Error: ${response.status}` },
                    { status: response.status }
                );
            }
        } catch (error) {
            console.error(`Fetch error with key ...${key.slice(-5)}:`, error);
            continue;
        }
    }

    return NextResponse.json(
        { error: "Failed to generate title" },
        { status: 500 }
    );
}
