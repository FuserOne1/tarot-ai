"use client";

import { useState } from "react";
import cards from "@/data/cards.json";
import TarotCardSvg from "./TarotCardSvg";

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

export default function CardDraw({ situation, onReading, onLoading, isLoading }: Props) {
  const [flipping, setFlipping] = useState(false);
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);

  async function drawCard() {
    if (!situation.trim() || isLoading || flipping) return;

    setFlipping(true);
    setDrawnCard(null);

    await new Promise((r) => setTimeout(r, 700));

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

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card */}
      <div className="relative" style={{ perspective: "800px" }}>
        {drawnCard && !flipping ? (
          <div className="animate-card-reveal animate-float">
            <TarotCardSvg card={drawnCard} size="lg" />
          </div>
        ) : (
          <div className={`transition-all duration-300 ${flipping ? "scale-90 opacity-50" : "opacity-100"}`}>
            {/* Card back */}
            <svg width="160" height="256" viewBox="0 0 160 256" xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 0 12px #4c1d9555)" }}>
              <defs>
                <radialGradient id="back-glow" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#0d0a1a" stopOpacity="0"/>
                </radialGradient>
                <pattern id="back-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="#4c1d95" opacity="0.3"/>
                  <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="#4c1d95" strokeWidth="0.3" opacity="0.2"/>
                </pattern>
              </defs>
              <rect x="2" y="2" width="156" height="252" rx="12" fill="#0f0a2a"/>
              <rect x="2" y="2" width="156" height="252" rx="12" fill="url(#back-pattern)"/>
              <rect x="2" y="2" width="156" height="252" rx="12" fill="url(#back-glow)"/>
              <rect x="2" y="2" width="156" height="252" rx="12" fill="none" stroke="#4c1d95" strokeWidth="1.5" opacity="0.6"/>
              <rect x="10" y="10" width="140" height="236" rx="8" fill="none" stroke="#4c1d95" strokeWidth="0.5" opacity="0.3"/>
              {/* Center ornament */}
              <circle cx="80" cy="128" r="40" fill="none" stroke="#7c3aed" strokeWidth="0.8" opacity="0.4"/>
              <circle cx="80" cy="128" r="28" fill="none" stroke="#a855f7" strokeWidth="0.5" opacity="0.3"/>
              <circle cx="80" cy="128" r="6" fill="#7c3aed" opacity={flipping ? "0.8" : "0.5"}
                style={flipping ? { animation: "pulse 0.5s ease-in-out infinite" } : {}}/>
              {/* Star of David */}
              <polygon points="80,92 90,110 70,110" fill="none" stroke="#a855f7" strokeWidth="0.8" opacity="0.4"/>
              <polygon points="80,164 90,146 70,146" fill="none" stroke="#a855f7" strokeWidth="0.8" opacity="0.4"/>
              <text x="80" y="220" textAnchor="middle" fontSize="10" fill="#7c3aed" opacity="0.5"
                fontFamily="serif" letterSpacing="3">✦ ТАРО ✦</text>
            </svg>
          </div>
        )}
      </div>

      {/* Button */}
      <button
        onClick={drawCard}
        disabled={!situation.trim() || isLoading || flipping}
        className="px-8 py-3 rounded-full text-sm font-cinzel tracking-widest transition-all duration-300
          bg-gradient-to-r from-purple-800 via-violet-700 to-purple-800
          hover:from-purple-700 hover:via-violet-600 hover:to-purple-700
          text-yellow-200 border border-yellow-500/20
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-lg shadow-purple-900/60 hover:shadow-purple-700/70
          hover:scale-105 active:scale-95 uppercase"
      >
        {flipping ? "Перемешиваю..." : isLoading ? "Читаю карту..." : "✦ Вытянуть карту ✦"}
      </button>
    </div>
  );
}
