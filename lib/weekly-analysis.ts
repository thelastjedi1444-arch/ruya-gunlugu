import { Dream } from "./storage";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";

export async function analyzeWeeklyDreams(dreams: Dream[]): Promise<string> {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Filter dreams from this week
    const weekDreams = dreams.filter(d => {
        const dreamDate = parseISO(d.date);
        return isWithinInterval(dreamDate, { start: weekStart, end: weekEnd });
    });

    if (weekDreams.length === 0) {
        return "Bu hafta henüz rüya kaydedilmemiş. Haftalık analiz yapabilmek için en az bir rüya kaydetmeniz gerekiyor.";
    }

    // Prepare context for AI
    const dreamTexts = weekDreams.map((d, i) => {
        const date = new Date(d.date).toLocaleDateString("tr-TR", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return `**Rüya ${i + 1}** (${date})
**Başlık:** ${d.title || 'Adsız'}
**Rüya:** ${d.text}
${d.interpretation ? `**Mevcut Analiz:** ${d.interpretation}` : ""}`;
    }).join("\n\n---\n\n");

    const prompt = `Aşağıda bir kullanıcının bu hafta gördüğü rüyalar listelenmiştir. Bu rüyaları toplu bir şekilde, bütüncül bir bakış açısıyla analiz et.

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
        return "Haftalık analiz oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
    }
}
