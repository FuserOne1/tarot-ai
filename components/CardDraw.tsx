"use client";

import { useState } from "react";
import cards from "@/data/cards.json";

interface Card {
  id: number;
  name: string;
  name_ru: string;
  arcana: string;
  keywords: string;
  suit?: string;
}

interface Props {
  situation: string;
  onReading: (card: Card, reading: string) => void;
  onLoading: (v: boolean) => void;
  isLoading: boolean;
}

const SUIT_SYMBOLS: Record<string, string> = {
  wands: "🔥",
  cups: "💧",
  swords: "⚔️",
  pentacles: "🌿",
};

const MAJOR_SYMBOLS = ["🌟", "🌙", "☀️", "⭐", "✨", "🔮", "🌠", "💫"];

export default function CardDraw({ situation, onReading, onLoading, isLoading }: Props) {
  const [flipping, setFlipping] = useState(false);
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);

  async function drawCard() {
    if (!situation.trim() || isLoading) return;

    setFlipping(true);
    setDrawnCard(null);

    await new Promise((r) => setTimeout(r, 900));

    const card = cards[Math.floor(Math.random() * cards.length)] as Card;
    setDrawnCard(card);
    setFlipping(false);
    onLoading(true);

    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, card }),
      });
      const data = await res.json();
      onReading(card, data.reading ?? "Карты не дали ответа.");
    } catch {
      onReading(card, "Произошла ошибка. Попробуй ещё раз.");
    } finally {
      onLoading(false);
    }
  }

  function getCardSymbol(card: Card) {
    if (card.arcana === "major") {
      return MAJOR_SYMBOLS[card.id % MAJOR_SYMBOLS.length];
    }
    return SUIT_SYMBOLS[card.suit ?? ""] ?? "🃏";
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card visual */}
      <div className="relative w-40 h-64 perspective-1000">
        <div
          className={`w-full h-full transition-all duration-700 ${
            flipping ? "scale-95 opacity-60" : "scale-100 opacity-100"
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {drawnCard ? (
            <div className="w-full h-full rounded-2xl border-2 border-yellow-400/60 bg-gradient-to-b from-purple-900 via-indigo-900 to-purple-950 flex flex-col items-center justify-center gap-3 shadow-2xl shadow-purple-900/50 animate-float">
              <div className="text-5xl">{getCardSymbol(drawnCard)}</div>
              <div className="text-yellow-300 font-serif text-center text-sm px-3 leading-tight">
                {drawnCard.name_ru}
              </div>
              <div className="text-purple-300 text-xs text-center px-3 opacity-70">
                {drawnCard.name}
              </div>
              <div className="w-16 h-px bg-yellow-400/40 mt-1" />
              <div className="text-purple-200 text-xs text-center px-3 opacity-60 leading-tight">
                {drawnCard.arcana === "major" ? "Старший аркан" : `Масть ${drawnCard.suit}`}
              </div>
            </div>
          ) : (
            <div
              className={`w-full h-full rounded-2xl border-2 border-purple-500/40 bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 flex items-center justify-center shadow-2xl shadow-purple-900/30 ${
                flipping ? "animate-pulse" : ""
              }`}
            >
              <div className="text-6xl opacity-40">🔮</div>
            </div>
          )}
        </div>
      </div>

      {/* Draw button */}
      <button
        onClick={drawCard}
        disabled={!situation.trim() || isLoading || flipping}
        className="relative px-8 py-3 rounded-full font-serif text-base font-medium transition-all duration-300
          bg-gradient-to-r from-purple-700 via-violet-600 to-purple-700
          hover:from-purple-600 hover:via-violet-500 hover:to-purple-600
          text-yellow-200 border border-yellow-400/30
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-lg shadow-purple-900/50 hover:shadow-purple-700/60
          hover:scale-105 active:scale-95"
      >
        {flipping ? "Карты перемешиваются..." : isLoading ? "Читаю карту..." : "✨ Вытянуть карту"}
      </button>
    </div>
  );
}
