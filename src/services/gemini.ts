/**
 * Gemini AI Service — KAP Rapor Özetleme
 *
 * Google Gemini 2.0 Flash (ücretsiz katman: 1500 istek/gün)
 * KAP bildirimlerini Türkçe olarak özetler ve yatırımcı etkisini analiz eder.
 */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface KapSummaryResult {
  summary: string; // 2-3 cümle özet
  impact: "pozitif" | "negatif" | "nötr"; // Yatırımcı etkisi
  impactScore: number; // -5 ile +5 arası
  keyPoints: string[]; // Önemli noktalar (3-5 madde)
  financialHighlights?: {
    // Varsa finansal öne çıkanlar
    metric: string;
    value: string;
    change?: string;
  }[];
  recommendation: string; // Kısa yatırımcı notu
}

export async function summarizeKapReport(params: {
  title: string;
  content: string;
  ticker?: string;
  category?: string;
}): Promise<KapSummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const prompt = `Sen bir Türk finans analisti ve KAP (Kamuyu Aydınlatma Platformu) uzmanısın.

Aşağıdaki KAP bildirimini analiz et ve JSON formatında yanıt ver.

${params.ticker ? `Şirket: ${params.ticker}` : ""}
${params.category ? `Kategori: ${params.category}` : ""}
Başlık: ${params.title}

İçerik:
${params.content}

Yanıtını SADECE aşağıdaki JSON formatında ver, başka hiçbir şey ekleme:
{
  "summary": "2-3 cümlelik Türkçe özet",
  "impact": "pozitif" veya "negatif" veya "nötr",
  "impactScore": -5 ile +5 arası tam sayı,
  "keyPoints": ["madde1", "madde2", "madde3"],
  "financialHighlights": [{"metric": "Gelir", "value": "₺5.2 Milyar", "change": "+%18"}],
  "recommendation": "Yatırımcılar için kısa not"
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini API returned empty response");
  }

  // Parse JSON response — handle markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const result: KapSummaryResult = JSON.parse(cleaned);
  return result;
}

// Batch summarize for multiple reports (respects rate limits)
export async function batchSummarizeKapReports(
  reports: {
    title: string;
    content: string;
    ticker?: string;
    category?: string;
  }[],
  delayMs = 500
): Promise<(KapSummaryResult | null)[]> {
  const results: (KapSummaryResult | null)[] = [];

  for (const report of reports) {
    try {
      const result = await summarizeKapReport(report);
      results.push(result);
    } catch (error) {
      console.error(`Failed to summarize: ${report.title}`, error);
      results.push(null);
    }
    // Rate limiting delay
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
