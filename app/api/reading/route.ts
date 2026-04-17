import { NextRequest } from "next/server";

interface Card {
  id: number;
  name: string;
  name_ru: string;
  arcana: string;
  keywords: string;
  suit?: string;
}

function buildPrompt(situation: string, cards: Card[], spread: "one" | "three") {
  if (spread === "one") {
    const card = cards[0];
    return `Ты — мудрый таролог. Человек описал ситуацию и вытянул карту таро.

Ситуация: "${situation}"
Карта: ${card.name_ru} (${card.name})
Темы карты: ${card.keywords}
Аркан: ${card.arcana === "major" ? "Старший аркан" : `Младший аркан, масть ${card.suit || ""}`}

Ответь СТРОГО в формате JSON (только чистый JSON, без markdown):
{
  "sections": [
    { "title": "Послание карты", "text": "3-4 предложения" },
    { "title": "Что сейчас происходит", "text": "3-4 предложения" },
    { "title": "Совет карты", "text": "2-3 предложения" },
    { "title": "Прогноз", "text": "2-3 предложения" }
  ]
}

Тепло, мудро, на "ты", на русском. Никаких звёздочек и решёток.`;
  }

  // Three card spread
  const [past, present, future] = cards;
  return `Ты — мудрый таролог. Человек описал ситуацию и вытянул расклад из трёх карт.

Ситуация: "${situation}"

Карта 1 — ПРОШЛОЕ: ${past.name_ru} (${past.name}), темы: ${past.keywords}
Карта 2 — НАСТОЯЩЕЕ: ${present.name_ru} (${present.name}), темы: ${present.keywords}
Карта 3 — БУДУЩЕЕ: ${future.name_ru} (${future.name}), темы: ${future.keywords}

Ответь СТРОГО в формате JSON (только чистый JSON, без markdown):
{
  "sections": [
    { "title": "Прошлое — ${past.name_ru}", "text": "Что привело к этой ситуации, 2-3 предложения" },
    { "title": "Настоящее — ${present.name_ru}", "text": "Что происходит сейчас, 3-4 предложения" },
    { "title": "Будущее — ${future.name_ru}", "text": "Куда ведёт этот путь, 2-3 предложения" },
    { "title": "Общий совет", "text": "Что делать с учётом всех трёх карт, 2-3 предложения" }
  ]
}

Тепло, мудро, на "ты", на русском. Никаких звёздочек и решёток.`;
}

export async function POST(req: NextRequest) {
  const { situation, cards, spread } = await req.json();

  if (!situation || !cards?.length) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const prompt = buildPrompt(situation, cards, spread ?? "one");

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
      max_tokens: 1400,
      stream: true,
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    console.error("OpenRouter error:", err);
    return new Response(JSON.stringify({ error: "AI service error" }), { status: 500 });
  }

  // Stream SSE back to client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          } catch { /* skip malformed */ }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
