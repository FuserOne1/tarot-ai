"use client";

import { useState, useEffect, useRef } from "react";
import ReadingResult from "@/components/ReadingResult";
import Particles from "@/components/Particles";
import cards from "@/data/cards.json";

interface Card {
  id: number;
  name: string;
  name_ru: string;
  arcana: string;
  keywords: string;
  suit?: string;
}

interface Section { title: string; text: string; }

interface HistoryItem {
  spread: "one" | "three";
  cards: Card[];
  sections: Section[];
  situation: string;
  date: string;
}

type Spread = "one" | "three";
type Phase = "input" | "drawing" | "result";

function CardBack({ flipping }: { flipping?: boolean }) {
  return (
    <svg width="120" height="192" viewBox="0 0 160 256" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 0 10px #4c1d9555)" }}>
      <defs>
        <radialGradient id="bg2" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#0d0a1a" stopOpacity="0"/>
        </radialGradient>
        <pattern id="pat2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="#4c1d95" opacity="0.3"/>
          <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="#4c1d95" strokeWidth="0.3" opacity="0.2"/>
        </pattern>
      </defs>
      <rect x="2" y="2" width="156" height="252" rx="12" fill="#0f0a2a"/>
      <rect x="2" y="2" width="156" height="252" rx="12" fill="url(#pat2)"/>
      <rect x="2" y="2" width="156" height="252" rx="12" fill="url(#bg2)"/>
      <rect x="2" y="2" width="156" height="252" rx="12" fill="none" stroke="#4c1d95" strokeWidth="1.5" opacity="0.6"/>
      <rect x="10" y="10" width="140" height="236" rx="8" fill="none" stroke="#4c1d95" strokeWidth="0.5" opacity="0.3"/>
      <circle cx="80" cy="128" r="40" fill="none" stroke="#7c3aed" strokeWidth="0.8" opacity="0.4"/>
      <circle cx="80" cy="128" r="28" fill="none" stroke="#a855f7" strokeWidth="0.5" opacity="0.3"/>
      <circle cx="80" cy="128" r="6" fill="#7c3aed" opacity={flipping ? "0.9" : "0.5"}/>
      <polygon points="80,92 90,110 70,110" fill="none" stroke="#a855f7" strokeWidth="0.8" opacity="0.4"/>
      <polygon points="80,164 90,146 70,146" fill="none" stroke="#a855f7" strokeWidth="0.8" opacity="0.4"/>
      <text x="80" y="220" textAnchor="middle" fontSize="10" fill="#7c3aed" opacity="0.5" fontFamily="serif" letterSpacing="3">✦ ТАРО ✦</text>
    </svg>
  );
}

function CardFace({ card }: { card: Card }) {
  const slug = card.name.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="relative w-[120px] h-[192px] rounded-xl overflow-hidden animate-card-reveal"
      style={{ boxShadow: "0 0 30px #7c3aed55", background: "#0d0a1a" }}>
      <img src={`/cards/${slug}.jpg`} alt={card.name_ru} className="w-full h-full object-contain"/>
    </div>
  );
}

function SpreadSelector({ spread, onChange }: { spread: Spread; onChange: (s: Spread) => void }) {
  return (
    <div className="flex gap-2 justify-center">
      {(["one", "three"] as Spread[]).map((s) => (
        <button key={s} onClick={() => onChange(s)}
          className={`px-5 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase transition-all border
            ${spread === s
              ? "bg-purple-700/60 border-purple-500/60 text-yellow-200 shadow-lg shadow-purple-900/40"
              : "bg-transparent border-purple-800/30 text-purple-500 hover:border-purple-600/40 hover:text-purple-300"
            }`}>
          {s === "one" ? "✦ 1 карта" : "✦✦✦ 3 карты"}
        </button>
      ))}
    </div>
  );
}

function HistoryPanel({ history, onSelect }: { history: HistoryItem[]; onSelect: (h: HistoryItem) => void }) {
  if (!history.length) return null;
  return (
    <div className="w-full max-w-lg mt-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-purple-900/40"/>
        <span className="text-purple-600 text-xs font-cinzel tracking-widest">ИСТОРИЯ</span>
        <div className="flex-1 h-px bg-purple-900/40"/>
      </div>
      <div className="space-y-2">
        {history.map((h, i) => (
          <button key={i} onClick={() => onSelect(h)}
            className="w-full text-left px-4 py-3 rounded-xl bg-purple-950/30 border border-purple-800/20
              hover:bg-purple-900/30 hover:border-purple-700/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 text-xs font-cinzel">
                {h.spread === "one" ? "1 карта" : "3 карты"} · {h.cards.map(c => c.name_ru).join(", ")}
              </span>
              <span className="text-purple-700 text-xs">{h.date}</span>
            </div>
            <p className="text-purple-500 text-xs mt-1 truncate">{h.situation}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function pickCards(count: number): Card[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count) as Card[];
}

export default function Home() {
  const [situation, setSituation] = useState("");
  const [spread, setSpread] = useState<Spread>("one");
  const [phase, setPhase] = useState<Phase>("input");
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const streamAccum = useRef("");
  const [particles, setParticles] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [flipping, setFlipping] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load history from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("tarot-history");
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  async function handleDraw() {
    if (!situation.trim() || flipping) return;

    // Abort previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setFlipping(true);
    setPhase("drawing");
    setSections([]);
    streamAccum.current = "";

    await new Promise(r => setTimeout(r, 800));

    const picked = pickCards(spread === "three" ? 3 : 1);
    setDrawnCards(picked);
    setFlipping(false);

    // Particle burst
    setParticles(true);
    setTimeout(() => setParticles(false), 100);

    // Start streaming
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, cards: picked, spread }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const { delta } = JSON.parse(data);
            if (delta) {
              streamAccum.current += delta;
            }
          } catch { /* skip */ }
        }
      }

      // Parse final JSON
      const parsed = parseJSON(streamAccum.current);
      setSections(parsed);
      setPhase("result");

      // Save to history
      const item: HistoryItem = {
        spread, cards: picked, sections: parsed,
        situation,
        date: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      };
      const newHistory = [item, ...history].slice(0, 5);
      setHistory(newHistory);
      try { sessionStorage.setItem("tarot-history", JSON.stringify(newHistory)); } catch { /* ignore */ }

    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setSections([{ title: "", text: "Произошла ошибка. Попробуй ещё раз." }]);
      setPhase("result");
    }
  }

  function parseJSON(raw: string): Section[] {
    const clean = raw.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return [{ title: "", text: clean.replace(/[*#`]/g, "") }];
    try {
      const parsed = JSON.parse(match[0]);
      return parsed.sections ?? [];
    } catch {
      return [{ title: "", text: clean.replace(/[*#`]/g, "") }];
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    setPhase("input");
    setDrawnCards([]);
    setSections([]);
    streamAccum.current = "";
    setSituation("");
  }

  function handleHistorySelect(h: HistoryItem) {
    setSpread(h.spread);
    setSituation(h.situation);
    setDrawnCards(h.cards);
    setSections(h.sections);
    setPhase("result");
  }

  const isLoading = phase === "drawing" && drawnCards.length > 0;

  return (
    <main className="min-h-screen w-full stars-bg flex flex-col items-center px-4 py-10 overflow-x-hidden">
      <Particles trigger={particles} />

      {/* Header */}
      <div className="text-center mb-8 w-full max-w-lg">
        <div className="text-4xl mb-3">🔮</div>
        <h1 className="font-cinzel text-3xl shimmer-text tracking-widest uppercase">Таро AI</h1>
        <p className="text-purple-400 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
          Опиши свою ситуацию — карты откроют скрытое и укажут путь
        </p>
      </div>

      {/* INPUT PHASE */}
      {phase === "input" && (
        <div className="w-full max-w-lg flex flex-col gap-5">
          <SpreadSelector spread={spread} onChange={setSpread} />

          <div className="flex flex-col gap-2">
            <label className="text-purple-300 text-xs font-cinzel tracking-widest uppercase">
              Твоя ситуация
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Опиши что происходит в твоей жизни, какой вопрос тебя беспокоит..."
              rows={4}
              className="w-full rounded-xl bg-purple-950/40 border border-purple-700/30 text-purple-100
                placeholder-purple-700 px-4 py-3 text-sm leading-relaxed resize-none outline-none
                focus:border-purple-500/60 focus:bg-purple-950/60 transition-all"
            />
          </div>

          {/* Card backs preview */}
          <div className="flex justify-center gap-3">
            {Array.from({ length: spread === "three" ? 3 : 1 }).map((_, i) => (
              <div key={i} className={`transition-all duration-500 ${flipping ? "scale-90 opacity-40" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <CardBack flipping={flipping} />
              </div>
            ))}
          </div>

          <button
            onClick={handleDraw}
            disabled={!situation.trim() || flipping}
            className="mx-auto px-8 py-3 rounded-full text-sm font-cinzel tracking-widest uppercase
              bg-gradient-to-r from-purple-800 via-violet-700 to-purple-800
              hover:from-purple-700 hover:via-violet-600 hover:to-purple-700
              text-yellow-200 border border-yellow-500/20
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-purple-900/60 hover:scale-105 active:scale-95 transition-all"
          >
            {flipping ? "Перемешиваю..." : spread === "one" ? "✦ Вытянуть карту ✦" : "✦ Вытянуть три карты ✦"}
          </button>

          <HistoryPanel history={history} onSelect={handleHistorySelect} />
        </div>
      )}

      {/* DRAWING PHASE — cards drawn, waiting for stream */}
      {phase === "drawing" && drawnCards.length > 0 && (
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          <div className="flex justify-center gap-4">
            {drawnCards.map((card, i) => (
              <div key={i} style={{ animationDelay: `${i * 150}ms` }}>
                <CardFace card={card} />
              </div>
            ))}
          </div>
          {/* Skeleton loader */}
          <div className="w-full space-y-3">
            {[
              { accent: "#8b5cf6", gradient: "from-violet-900/60 to-purple-950/60", border: "border-violet-500/30", w: "w-1/3" },
              { accent: "#3b82f6", gradient: "from-blue-900/50 to-indigo-950/60",   border: "border-blue-500/30",   w: "w-2/5" },
              { accent: "#f59e0b", gradient: "from-amber-900/40 to-yellow-950/50",  border: "border-amber-500/30",  w: "w-1/4" },
              { accent: "#10b981", gradient: "from-emerald-900/40 to-teal-950/50",  border: "border-emerald-500/30",w: "w-1/3" },
            ].map((cfg, i) => (
              <div key={i} className={`rounded-2xl bg-gradient-to-br ${cfg.gradient} border ${cfg.border} p-5 animate-pulse`}>
                <div className={`h-3 rounded-full mb-3 ${cfg.w}`} style={{ background: cfg.accent + "40" }}/>
                <div className="space-y-2">
                  <div className="h-2.5 rounded-full w-full" style={{ background: cfg.accent + "25" }}/>
                  <div className="h-2.5 rounded-full w-5/6"  style={{ background: cfg.accent + "20" }}/>
                  <div className="h-2.5 rounded-full w-4/6"  style={{ background: cfg.accent + "18" }}/>
                </div>
              </div>
            ))}
          </div>
          <p className="text-purple-500 text-xs font-cinzel tracking-widest animate-pulse">
            ✦ Карты читают твою судьбу... ✦
          </p>
        </div>
      )}

      {/* DRAWING PHASE — flipping, no cards yet */}
      {phase === "drawing" && drawnCards.length === 0 && (
        <div className="flex justify-center gap-4">
          {Array.from({ length: spread === "three" ? 3 : 1 }).map((_, i) => (
            <div key={i} className="scale-90 opacity-50 animate-pulse">
              <CardBack flipping />
            </div>
          ))}
        </div>
      )}

      {/* RESULT PHASE */}
      {phase === "result" && (
        <div className="w-full max-w-xl flex flex-col items-center gap-4">
          <ReadingResult cards={drawnCards} sections={sections} spread={spread} />
          <button
            onClick={handleReset}
            className="mt-2 px-6 py-2 rounded-full border border-purple-700/30 text-purple-400 text-xs
              font-cinzel tracking-widest uppercase hover:border-purple-500/50 hover:text-purple-300
              transition-all hover:bg-purple-900/20"
          >
            ← Новый расклад
          </button>
        </div>
      )}

      <footer className="mt-16 text-purple-800 text-xs text-center font-cinzel tracking-widest">
        ТАРО AI · ИНТЕРПРЕТАЦИИ ОТ ИСКУССТВЕННОГО ИНТЕЛЛЕКТА
      </footer>
    </main>
  );
}
