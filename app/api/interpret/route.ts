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

    const { text, language } = await req.json();
    if (!text) {
        return NextResponse.json(
            { error: "Dream text is required" },
            { status: 400 }
        );
    }

    const isEnglish = language === 'en';
    const targetLanguage = isEnglish ? "English" : "Turkish";

    const prompt = `
      Act as a psychological dream interpreter. 
      Tone: calm, honest, direct, non-mystical. 
      Avoid judgment, fear, or authoritative language.
      Language: ${targetLanguage} (Must respond in ${targetLanguage}).
      Instructions: 
      - Use suitable emojis throughout the text to match the mood.
      - Don't just append them at the end, integrate naturally.
      - Start directly with the interpretation.
      Output: A single paragraph ${isEnglish ? "interpretation of the following dream" : "rüya yorumu"}. Do not use any titles or markdown headings.
      
      Dream: "${text}"
    `;

    // Try keys sequentially until one works
    for (const key of GEMINI_API_KEYS) {
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

        try {
            console.log(`Attempting request with key ending in ...${key.slice(-5)}`);
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
                const interpretation = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (interpretation) {
                    return NextResponse.json({ interpretation });
                }
                console.error("No interpretation found in successful response body");
            } else {
                const errorText = await response.text();
                console.error(`Gemini API Error with key ...${key.slice(-5)}:`, response.status, errorText);
                // Continue to next key if it's a rate limit or server error
                if (response.status === 429 || response.status >= 500) continue;

                // If it's a client error (except 429), return it
                return NextResponse.json(
                    { error: `API Error: ${response.status} - ${errorText}` },
                    { status: response.status }
                );
            }
        } catch (error) {
            console.error(`Fetch error with key ...${key.slice(-5)}:`, error);
            continue;
        }
    }

    return NextResponse.json(
        { error: "All API keys failed to generate an interpretation." },
        { status: 500 }
    );
}
