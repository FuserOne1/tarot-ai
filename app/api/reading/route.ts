import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { situation, card } = await req.json();

  if (!situation || !card) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const prompt = `Ты — мудрый таролог с глубоким знанием символизма карт Таро. 
Человек описал свою ситуацию и вытянул карту. Дай развёрнутую, персонализированную интерпретацию.

Ситуация человека: "${situation}"

Вытянутая карта: ${card.name_ru} (${card.name})
Ключевые темы карты: ${card.keywords}
Аркан: ${card.arcana === "major" ? "Старший аркан" : `Младший аркан, масть ${card.suit || ""}`}

Структура ответа (используй эти разделы):
1. **Послание карты** — что эта карта говорит именно в контексте данной ситуации (3-4 предложения)
2. **Что сейчас происходит** — глубинный анализ текущего момента через призму карты (3-4 предложения)
3. **Совет карты** — конкретные действия или изменение мышления (2-3 предложения)
4. **Прогноз** — как может развиться ситуация, если следовать посланию карты (2-3 предложения)

Пиши тепло, мудро, без клише. Обращайся к человеку на "ты". Ответ на русском языке.`;

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
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const data = await response.json();
    const reading = data.choices?.[0]?.message?.content ?? "Карты молчат...";

    return NextResponse.json({ reading });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
