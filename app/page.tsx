"use client";

import { useState } from "react";
import CardDraw from "@/components/CardDraw";
import ReadingResult from "@/components/ReadingResult";

interface Card {
  id: number;
  name: string;
  name_ru: string;
  arcana: string;
  keywords: string;
  suit?: string;
}

export default function Home() {
  const [situation, setSituation] = useState("");
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [reading, setReading] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleReading(card: Card, text: string) {
    setDrawnCard(card);
    setReading(text);
  }

  function handleReset() {
    setDrawnCard(null);
    setReading("");
    setSituation("");
  }

  return (
    <main className="min-h-screen stars-bg flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🔮</div>
        <h1 className="text-3xl font-serif text-yellow-300 tracking-wide">Таро AI</h1>
        <p className="text-purple-300 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
          Опиши свою ситуацию — карты откроют скрытое и укажут путь
        </p>
      </div>

      {/* Main content */}
      {!drawnCard && !isLoading ? (
        <div className="w-full max-w-lg flex flex-col gap-6">
          {/* Situation input */}
          <div className="flex flex-col gap-2">
            <label className="text-purple-300 text-sm font-serif">
              Твоя ситуация
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Опиши что происходит в твоей жизни, какой вопрос тебя беспокоит, в чём нужна ясность..."
              rows={5}
              className="w-full rounded-xl bg-purple-950/50 border border-purple-700/40 text-purple-100 placeholder-purple-600
                px-4 py-3 text-sm leading-relaxed resize-none outline-none
                focus:border-purple-500/70 focus:bg-purple-950/70 transition-all"
            />
            <div className="text-right text-purple-600 text-xs">
              {situation.length} символов
            </div>
          </div>

          {/* Card draw */}
          <CardDraw
            situation={situation}
            onReading={handleReading}
            onLoading={setIsLoading}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          {/* Loading state with card */}
          {isLoading && drawnCard === null && (
            <div className="text-center">
              <div className="text-4xl animate-pulse mb-3">🔮</div>
              <p className="text-purple-300 text-sm">Карты открываются...</p>
            </div>
          )}

          {/* Card + reading */}
          {(drawnCard || isLoading) && (
            <>
              {drawnCard && (
                <ReadingResult
                  card={drawnCard}
                  reading={reading}
                  isLoading={isLoading}
                />
              )}

              {!isLoading && (
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-2 rounded-full border border-purple-600/40 text-purple-400 text-sm
                    hover:border-purple-500/60 hover:text-purple-300 transition-all hover:bg-purple-900/20"
                >
                  ← Новый расклад
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-purple-700 text-xs text-center">
        Таро AI · Интерпретации создаются искусственным интеллектом
      </footer>
    </main>
  );
}
