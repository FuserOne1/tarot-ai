import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { situation, card } = await req.json();

  if (!situation || !card) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const prompt = `Ты — мудрый таролог. Человек описал ситуацию и вытянул карту таро.

Ситуация: "${situation}"
Карта: ${card.name_ru} (${card.name})
Темы карты: ${card.keywords}
Аркан: ${card.arcana === "major" ? "Старший аркан" : `Младший аркан, масть ${card.suit || ""}`}

Ответь СТРОГО в формате JSON (без markdown, без \`\`\`, только чистый JSON):
{
  "sections": [
    { "title": "Послание карты", "text": "..." },
    { "title": "Что сейчас происходит", "text": "..." },
    { "title": "Совет карты", "text": "..." },
    { "title": "Прогноз", "text": "..." }
  ]
}

Каждый text — 3-4 предложения. Тепло, мудро, на "ты", на русском языке. Никаких звёздочек, решёток и markdown.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tarot-ai.vercel.app",
        "X-Title": "Tarot AI Reader",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";

    // Parse JSON from model
    let sections: { title: string; text: string }[] = [];
    try {
      const parsed = JSON.parse(raw);
      sections = parsed.sections ?? [];
    } catch {
      // Fallback: extract JSON from possible wrapper text
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          sections = parsed.sections ?? [];
        } catch { /* ignore */ }
      }
    }

    if (!sections.length) {
      sections = [{ title: "", text: raw.replace(/[*#`]/g, "").trim() }];
    }

    return NextResponse.json({ sections });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
