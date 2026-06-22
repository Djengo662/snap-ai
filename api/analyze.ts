// Vercel Serverless Function — läuft serverseitig, der API-Key bleibt geheim.
// Erreichbar unter /api/analyze

export const config = {
  runtime: "nodejs",
};

const PROMPT = `Analysiere dieses Bild einer Mahlzeit. Gib mir eine JSON-Antwort mit folgender Struktur, OHNE Markdown-Backticks, NUR reines JSON:
{
  "foods": [
    { "name": "Lebensmittelname", "calories": 123, "amount": "100g" }
  ],
  "totalCalories": 456,
  "macros": {
    "protein": 20,
    "carbs": 50,
    "fat": 15
  }
}
Schätze die Portionsgrößen realistisch. Alle Werte in Gramm für Makros und kcal für Kalorien.`;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY ist nicht konfiguriert." },
      { status: 500 },
    );
  }

  let base64: string;
  let mimeType: string;
  try {
    const body = (await request.json()) as {
      base64?: string;
      mimeType?: string;
    };
    if (!body.base64 || !body.mimeType) {
      return Response.json(
        { error: "base64 und mimeType sind erforderlich." },
        { status: 400 },
      );
    }
    base64 = body.base64;
    mimeType = body.mimeType;
  } catch {
    return Response.json({ error: "Ungültiger Request-Body." }, { status: 400 });
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                { inline_data: { mime_type: mimeType, data: base64 } },
              ],
            },
          ],
        }),
      },
    );

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      return Response.json(
        { error: data?.error?.message ?? "Gemini API Fehler" },
        { status: geminiResponse.status },
      );
    }

    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = JSON.parse(text.trim());
    return Response.json(parsed, { status: 200 });
  } catch {
    return Response.json(
      { error: "Analyse fehlgeschlagen." },
      { status: 502 },
    );
  }
}
