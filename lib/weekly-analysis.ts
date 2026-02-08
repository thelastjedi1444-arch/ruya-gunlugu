import { Dream } from "./storage";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";

export async function analyzeWeeklyDreams(dreams: Dream[], language: "tr" | "en"): Promise<string> {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Filter dreams from this week
    const weekDreams = dreams.filter(d => {
        const dreamDate = parseISO(d.date);
        return isWithinInterval(dreamDate, { start: weekStart, end: weekEnd });
    });

    if (weekDreams.length === 0) {
        return language === "tr"
            ? "Bu hafta henüz rüya kaydedilmemiş. Haftalık analiz yapabilmek için en az bir rüya kaydetmeniz gerekiyor."
            : "No dreams recorded this week. You need to record at least one dream to generate a weekly analysis.";
    }

    // Prepare context for AI
    const dreamTexts = weekDreams.map((d, i) => {
        const date = new Date(d.date).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return `**${language === "tr" ? "Rüya" : "Dream"} ${i + 1}** (${date})
**${language === "tr" ? "Başlık" : "Title"}:** ${d.title || (language === "tr" ? 'Adsız' : 'Untitled')}
**${language === "tr" ? "Rüya" : "Dream Content"}:** ${d.text}
${d.interpretation ? `**${language === "tr" ? "Mevcut Analiz" : "Current Interpretation"}:** ${d.interpretation}` : ""}`;
    }).join("\n\n---\n\n");

    const promptTr = `Aşağıda bir kullanıcının bu hafta gördüğü rüyalar listelenmiştir. Bu rüyaları toplu bir şekilde, bütüncül bir bakış açısıyla analiz et.

${dreamTexts}

KRİTİK TALİMATLAR (LÜTFEN HARFİYEN UY):
1. **ASLA GİRİŞ YAPMA**: "Merhaba", "Bu hafta şunları gördün", "Analizimiz şöyle", "Rüyaların gösteriyor ki" gibi hiçbir giriş cümlesi kurma. Doğrudan analize başla.
2. **UYARI YAPMA**: "Bu bir rüya yorumudur", "Uzmana danışın" gibi hiçbir uyarı veya disclaimer ekleme.
3. **TEK TEK ANLATMA**: Rüyaları tarih tarih veya liste halinde tek tek özetleme. Tüm haftayı tek bir hikaye veya zihinsel süreç gibi bütüncül bir şekilde ele al.
4. **NET VE KESİN KONUŞ**: "Olabilir", "Şöyle olabilir" gibi belirsiz ifadelerden kaçın. Gözlemlerini net bir şekilde aktar.
5. **KISA VE ÖZ OL**: Gereksiz dolambaçlı cümlelerden kaçın.

FORMAT (Markdown kullan):
### 🌊 Haftanın Ruhu
(Tüm haftanın ana temasını ve zihinsel akışını anlatan 2-3 cümlelik çok net bir özet)

### 🗝️ Kilit Simgeler
(Hafta boyunca öne çıkan en önemli 2-3 simge ve bunların bu haftaki özel anlamı)

### 🧠 Zihinsel Durum ve Öneri
(Haftalık genel duygu durumu ve buna dair net bir tavsiye/bakış açısı)

Dili gizemli ama çok net ve doğrudan olsun.`;

    const promptEn = `Below are the dreams recorded by a user this week. Analyze these dreams collectively from a holistic perspective.

${dreamTexts}

CRITICAL INSTRUCTIONS (PLEASE FOLLOW EXACTLY):
1. **NO INTRODUCTIONS**: Do not say "Hello", "Here is your analysis", "Your dreams show". Start directly with the analysis.
2. **NO DISCLAIMERS**: Do not add warnings like "This is just an interpretation", "Consult a professional".
3. **DO NOT SUMMARIZE INDIVIDUALLY**: Do not go through dreams day by day. Treat the whole week as a single narrative or mental process.
4. **BE CLEAR AND DIRECT**: Avoid vague phrases like "It implies", "It might be". State your observations clearly.
5. **BE CONCISE**: Avoid unnecessary wordiness.

FORMAT (Use Markdown):
### 🌊 Spirit of the Week
(A very clear 2-3 sentence summary explaining the main theme and mental flow of the week)

### 🗝️ Key Symbols
(The most important 2-3 symbols standing out this week and their specific meaning)

### 🧠 Mental State & Suggestion
(General emotional state of the week and a clear piece of advice/perspective)

The language should be mysterious but very clear and direct.`;

    const prompt = language === "tr" ? promptTr : promptEn;

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }]
            }),
        });

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();
        return data.response || "Analiz oluşturulamadı.";
    } catch (error) {
        console.error("Weekly analysis error:", error);
        return language === "tr"
            ? "Haftalık analiz oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
            : "An error occurred while generating the weekly analysis. Please try again later.";
    }
}
