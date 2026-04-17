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
    <main className="min-h-screen w-full stars-bg flex flex-col items-center px-4 py-10 overflow-x-hidden">
      {/* Header */}
      <div className="text-center mb-10 w-full max-w-lg">
        <div className="text-4xl mb-3">🔮</div>
        <h1 className="font-cinzel text-3xl shimmer-text tracking-widest uppercase">Таро AI</h1>
        <p className="text-purple-400 text-sm mt-3 leading-relaxed max-w-xs mx-auto">
          Опиши свою ситуацию — карты откроют скрытое и укажут путь
        </p>
      </div>

      {/* Main content */}
      {!drawnCard && !isLoading ? (
        <div className="w-full max-w-lg flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-purple-300 text-xs font-cinzel tracking-widest uppercase">
              Твоя ситуация
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Опиши что происходит в твоей жизни, какой вопрос тебя беспокоит..."
              rows={5}
              className="w-full rounded-xl bg-purple-950/40 border border-purple-700/30 text-purple-100
                placeholder-purple-700 px-4 py-3 text-sm leading-relaxed resize-none outline-none
                focus:border-purple-500/60 focus:bg-purple-950/60 transition-all"
            />
            <div className="text-right text-purple-700 text-xs">{situation.length} символов</div>
          </div>

          <CardDraw
            situation={situation}
            onReading={handleReading}
            onLoading={setIsLoading}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="w-full max-w-xl flex flex-col items-center gap-4">
          {isLoading && !drawnCard && (
            <div className="text-center py-10">
              <div className="text-4xl animate-pulse mb-3">🔮</div>
              <p className="text-purple-400 text-sm font-cinzel tracking-widest">Карты открываются...</p>
            </div>
          )}

          {drawnCard && (
            <ReadingResult card={drawnCard} reading={reading} isLoading={isLoading}/>
          )}

          {!isLoading && drawnCard && (
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2 rounded-full border border-purple-700/30 text-purple-400 text-xs
                font-cinzel tracking-widest uppercase hover:border-purple-500/50 hover:text-purple-300
                transition-all hover:bg-purple-900/20"
            >
              ← Новый расклад
            </button>
          )}
        </div>
      )}

      <footer className="mt-16 text-purple-800 text-xs text-center font-cinzel tracking-widest">
        ТАРО AI · ИНТЕРПРЕТАЦИИ ОТ ИСКУССТВЕННОГО ИНТЕЛЛЕКТА
      </footer>
    </main>
  );
}
