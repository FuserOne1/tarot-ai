import { NextRequest } from "next/server";

interface Card {
  id: number;
  name: string;
  name_ru: string;
  arcana: string;
  keywords: string;
  suit?: string;
  reversed?: boolean;
}

function buildPrompt(situation: string, cards: Card[], spread: string) {
  const cardDesc = (c: Card) =>
    `${c.name_ru}${c.reversed ? " (ПЕРЕВЁРНУТАЯ)" : ""} — темы: ${c.keywords}${c.reversed ? ". Перевёрнутое положение усиливает теневые аспекты карты" : ""}`;

  const affirmationNote = `\n  "affirmation": "Одна короткая аффирмация или слово силы для человека (до 10 слов)"`;

  if (spread === "day") {
    const card = cards[0];
    return `Ты — мудрый таролог. Человек вытянул карту дня.

Карта дня: ${cardDesc(card)}
Аркан: ${card.arcana === "major" ? "Старший аркан" : `Младший аркан, масть ${card.suit || ""}`}

Ответь СТРОГО в формате JSON (только чистый JSON, без markdown):
{
  "sections": [
    { "title": "Энергия дня", "text": "Что несёт этот день, 2-3 предложения" },
    { "title": "На что обратить внимание", "text": "Конкретный совет на день, 2-3 предложения" },
    { "title": "Возможности дня", "text": "Что можно использовать сегодня, 2 предложения" }
  ],${affirmationNote}
}

Тепло, мудро, на "ты", на русском. Никаких звёздочек и решёток.`;
  }

  if (spread === "compatibility") {
    const [name1, name2] = situation.split("|||");
    const card = cards[0];
    return `Ты — мудрый таролог. Человек спрашивает о совместимости двух людей.

Имена: ${name1.trim()} и ${name2.trim()}
Карта расклада: ${cardDesc(card)}

Ответь СТРОГО в формате JSON (только чистый JSON, без markdown):
{
  "sections": [
    { "title": "Энергия союза", "text": "Что объединяет этих людей, 3 предложения" },
    { "title": "Вызовы и уроки", "text": "Что нужно преодолеть вместе, 2-3 предложения" },
    { "title": "Потенциал отношений", "text": "Куда могут прийти эти отношения, 2-3 предложения" },
    { "title": "Совет", "text": "Что важно помнить обоим, 2 предложения" }
  ],${affirmationNote}
}

Тепло, мудро, на "ты", на русском. Никаких звёздочек и решёток.`;
  }

  if (spread === "one") {
    const card = cards[0];
    return `Ты — мудрый таролог. Человек описал ситуацию и вытянул карту таро.

Ситуация: "${situation}"
Карта: ${cardDesc(card)}
Аркан: ${card.arcana === "major" ? "Старший аркан" : `Младший аркан, масть ${card.suit || ""}`}

Ответь СТРОГО в формате JSON (только чистый JSON, без markdown):
{
  "sections": [
    { "title": "Послание карты", "text": "3-4 предложения" },
    { "title": "Что сейчас происходит", "text": "3-4 предложения" },
    { "title": "Совет карты", "text": "2-3 предложения" },
    { "title": "Прогноз", "text": "2-3 предложения" }
  ],${affirmationNote}
}

Тепло, мудро, на "ты", на русском. Никаких звёздочек и решёток.`;
  }

  // Three card spread
  const [past, present, future] = cards;
  return `Ты — мудрый таролог. Человек описал ситуацию и вытянул расклад из трёх карт.

Ситуация: "${situation}"
Карта 1 — ПРОШЛОЕ: ${cardDesc(past)}
Карта 2 — НАСТОЯЩЕЕ: ${cardDesc(present)}
Карта 3 — БУДУЩЕЕ: ${cardDesc(future)}

Ответь СТРОГО в формате JSON (только чистый JSON, без markdown):
{
  "sections": [
    { "title": "Прошлое — ${past.name_ru}", "text": "2-3 предложения" },
    { "title": "Настоящее — ${present.name_ru}", "text": "3-4 предложения" },
    { "title": "Будущее — ${future.name_ru}", "text": "2-3 предложения" },
    { "title": "Общий совет", "text": "2-3 предложения" }
  ],${affirmationNote}
}

Тепло, мудро, на "ты", на русском. Никаких звёздочек и решёток.`;
}

export async function POST(req: NextRequest) {
  const { situation, cards, spread } = await req.json();

  if (!cards?.length) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const prompt = buildPrompt(situation ?? "", cards, spread ?? "one");

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
            if (delta) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
          } catch { /* skip */ }
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
