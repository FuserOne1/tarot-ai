"use client";

import { useState, useEffect, useRef } from "react";
import ReadingResult from "@/components/ReadingResult";
import Particles from "@/components/Particles";
import { useSound } from "@/components/useSound";
import cards from "@/data/cards.json";

interface Card {
  id: number; name: string; name_ru: string;
  arcana: string; keywords: string; suit?: string;
  reversed?: boolean;
}
interface Section { title: string; text: string; }
interface HistoryItem {
  spread: string; cards: Card[]; sections: Section[];
  situation: string; date: string; affirmation?: string;
}

type Spread = "one" | "three" | "day" | "compatibility";
type Phase = "input" | "drawing" | "result";

const SPREAD_INFO: Record<Spread, { label: string; icon: string; desc: string; needsInput: boolean }> = {
  one:           { label: "1 карта",       icon: "✦",   desc: "Один вопрос — один ответ",          needsInput: true  },
  three:         { label: "3 карты",       icon: "✦✦✦", desc: "Прошлое · Настоящее · Будущее",     needsInput: true  },
  day:           { label: "Карта дня",     icon: "☀️",  desc: "Что несёт тебе сегодня",            needsInput: false },
  compatibility: { label: "Совместимость", icon: "♡",   desc: "Энергия двух людей",                needsInput: true  },
};

function CardBack({ flipping, size = 160 }: { flipping?: boolean; size?: number }) {
  const h = Math.round(size * 1.6);
  return (
    <svg width={size} height={h} viewBox="0 0 160 256" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 0 10px #4c1d9555)" }}>
      <defs>
        <radialGradient id="cbg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#0d0a1a" stopOpacity="0"/>
        </radialGradient>
        <pattern id="cpat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="#4c1d95" opacity="0.3"/>
          <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="#4c1d95" strokeWidth="0.3" opacity="0.2"/>
        </pattern>
      </defs>
      <rect x="2" y="2" width="156" height="252" rx="12" fill="#0f0a2a"/>
      <rect x="2" y="2" width="156" height="252" rx="12" fill="url(#cpat)"/>
      <rect x="2" y="2" width="156" height="252" rx="12" fill="url(#cbg)"/>
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
    <div className="relative w-[140px] h-[224px] rounded-xl overflow-hidden animate-card-reveal"
      style={{ boxShadow: "0 0 30px #7c3aed55", background: "#0d0a1a",
        transform: card.reversed ? "rotate(180deg)" : undefined }}>
      <img src={`/cards/${slug}.jpg`} alt={card.name_ru} className="w-full h-full object-contain"/>
    </div>
  );
}

function pickCards(count: number): Card[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(c => ({
    ...(c as Card),
    reversed: Math.random() < 0.33, // 33% chance reversed
  }));
}

const SKELETON_CONFIGS = [
  { accent: "#8b5cf6", gradient: "from-violet-900/60 to-purple-950/60", border: "border-violet-500/30", w: "w-1/3" },
  { accent: "#3b82f6", gradient: "from-blue-900/50 to-indigo-950/60",   border: "border-blue-500/30",   w: "w-2/5" },
  { accent: "#f59e0b", gradient: "from-amber-900/40 to-yellow-950/50",  border: "border-amber-500/30",  w: "w-1/4" },
  { accent: "#10b981", gradient: "from-emerald-900/40 to-teal-950/50",  border: "border-emerald-500/30",w: "w-1/3" },
];

export default function Home() {
  const [situation, setSituation] = useState("");
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [spread, setSpread] = useState<Spread>("one");
  const [phase, setPhase] = useState<Phase>("input");
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [affirmation, setAffirmation] = useState<string | undefined>();
  const streamAccum = useRef("");
  const [particles, setParticles] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [flipping, setFlipping] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const { playFlip, playReveal } = useSound(soundOn);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("tarot-history");
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function getSituationPayload() {
    if (spread === "compatibility") return `${name1}|||${name2}`;
    if (spread === "day") return "";
    return situation;
  }

  function getCardCount() {
    return spread === "three" ? 3 : 1;
  }

  async function handleDraw() {
    const sit = getSituationPayload();
    if (spread === "compatibility" && (!name1.trim() || !name2.trim())) return;
    if ((spread === "one" || spread === "three") && !situation.trim()) return;
    if (flipping) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setFlipping(true);
    setPhase("drawing");
    setSections([]);
    setAffirmation(undefined);
    streamAccum.current = "";
    playFlip();

    await new Promise(r => setTimeout(r, 800));

    const picked = pickCards(getCardCount());
    setDrawnCards(picked);
    setFlipping(false);
    playReveal();

    setParticles(true);
    setTimeout(() => setParticles(false), 100);

    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: sit, cards: picked, spread }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const { delta } = JSON.parse(data);
            if (delta) streamAccum.current += delta;
          } catch { /* skip */ }
        }
      }

      const { secs, aff } = parseResponse(streamAccum.current);
      setSections(secs);
      setAffirmation(aff);
      setPhase("result");

      const item: HistoryItem = {
        spread, cards: picked, sections: secs, affirmation: aff,
        situation: spread === "compatibility" ? `${name1} & ${name2}` : situation,
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

  function parseResponse(raw: string): { secs: Section[]; aff?: string } {
    const clean = raw.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return { secs: [{ title: "", text: clean.replace(/[*#`]/g, "") }] };
    try {
      const parsed = JSON.parse(match[0]);
      return { secs: parsed.sections ?? [], aff: parsed.affirmation };
    } catch {
      return { secs: [{ title: "", text: clean.replace(/[*#`]/g, "") }] };
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    setPhase("input");
    setDrawnCards([]);
    setSections([]);
    setAffirmation(undefined);
    streamAccum.current = "";
    setSituation("");
  }

  function handleHistorySelect(h: HistoryItem) {
    setSpread(h.spread as Spread);
    setSituation(h.situation);
    setDrawnCards(h.cards);
    setSections(h.sections);
    setAffirmation(h.affirmation);
    setPhase("result");
  }

  const cardCount = spread === "three" ? 3 : 1;
  const info = SPREAD_INFO[spread];
  const canDraw = spread === "day"
    ? true
    : spread === "compatibility"
    ? name1.trim().length > 0 && name2.trim().length > 0
    : situation.trim().length > 0;

  return (
    <main className="relative min-h-screen w-full stars-bg flex flex-col items-center px-4 py-10 overflow-x-hidden">
      {/* Animated nebula */}
      <div className="nebula-bg">
        <div className="nebula-orb" style={{ width: 400, height: 400, background: "radial-gradient(circle, #7c3aed, transparent 70%)", top: "20%", left: "60%" }}/>
        <div className="nebula-orb" style={{ width: 300, height: 300, background: "radial-gradient(circle, #4f46e5, transparent 70%)", top: "60%", left: "10%", animationDuration: "35s" }}/>
      </div>

      <Particles trigger={particles} />

      {/* Sound toggle */}
      <button onClick={() => setSoundOn(v => !v)}
        className="fixed top-4 right-4 z-10 w-8 h-8 rounded-full bg-purple-950/60 border border-purple-700/30
          text-purple-400 text-sm flex items-center justify-center hover:bg-purple-900/60 transition-all"
        title={soundOn ? "Выключить звук" : "Включить звук"}>
        {soundOn ? "🔊" : "🔇"}
      </button>

      {/* Header */}
      <div className="relative text-center mb-8 w-full max-w-lg z-10">
        <div className="text-4xl mb-3">🔮</div>
        <h1 className="font-cinzel text-3xl shimmer-text tracking-widest uppercase">Таро AI</h1>
        <p className="text-purple-400 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
          Опиши свою ситуацию — карты откроют скрытое и укажут путь
        </p>
      </div>

      {/* INPUT PHASE */}
      {phase === "input" && (
        <div className="relative z-10 w-full max-w-lg flex flex-col gap-5">
          {/* Spread selector */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(SPREAD_INFO) as [Spread, typeof SPREAD_INFO[Spread]][]).map(([s, info]) => (
              <button key={s} onClick={() => setSpread(s)}
                className={`px-3 py-3 rounded-xl text-xs font-cinzel tracking-wider transition-all border text-left
                  ${spread === s
                    ? "bg-purple-800/50 border-purple-500/60 text-yellow-200 shadow-lg shadow-purple-900/40"
                    : "bg-purple-950/20 border-purple-800/20 text-purple-500 hover:border-purple-600/40 hover:text-purple-300"
                  }`}>
                <div className="text-base mb-1">{info.icon}</div>
                <div className="uppercase">{info.label}</div>
                <div className="text-purple-600 text-xs mt-0.5 normal-case font-sans">{info.desc}</div>
              </button>
            ))}
          </div>

          {/* Input fields */}
          {spread === "compatibility" ? (
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-purple-400 text-xs font-cinzel tracking-widest uppercase">Имя 1</label>
                <input value={name1} onChange={e => setName1(e.target.value)} placeholder="Например, Анна"
                  className="w-full rounded-xl bg-purple-950/40 border border-purple-700/30 text-purple-100
                    placeholder-purple-700 px-4 py-3 text-sm outline-none focus:border-purple-500/60 transition-all"/>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-purple-400 text-xs font-cinzel tracking-widest uppercase">Имя 2</label>
                <input value={name2} onChange={e => setName2(e.target.value)} placeholder="Например, Иван"
                  className="w-full rounded-xl bg-purple-950/40 border border-purple-700/30 text-purple-100
                    placeholder-purple-700 px-4 py-3 text-sm outline-none focus:border-purple-500/60 transition-all"/>
              </div>
            </div>
          ) : spread !== "day" ? (
            <div className="flex flex-col gap-2">
              <label className="text-purple-300 text-xs font-cinzel tracking-widest uppercase">Твоя ситуация</label>
              <textarea value={situation} onChange={e => setSituation(e.target.value)}
                placeholder="Опиши что происходит в твоей жизни, какой вопрос тебя беспокоит..."
                rows={4}
                className="w-full rounded-xl bg-purple-950/40 border border-purple-700/30 text-purple-100
                  placeholder-purple-700 px-4 py-3 text-sm leading-relaxed resize-none outline-none
                  focus:border-purple-500/60 focus:bg-purple-950/60 transition-all"/>
            </div>
          ) : (
            <div className="text-center py-4 text-purple-400 text-sm font-cinzel tracking-widest">
              ✦ Просто нажми — карта сама выберет тебя ✦
            </div>
          )}

          {/* Card backs */}
          <div className="flex justify-center gap-3">
            {Array.from({ length: cardCount }).map((_, i) => (
              <div key={i} className={`transition-all duration-500 ${flipping ? "scale-90 opacity-40" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <CardBack flipping={flipping} size={cardCount === 1 ? 140 : 100}/>
              </div>
            ))}
          </div>

          <button onClick={handleDraw} disabled={!canDraw || flipping}
            className="mx-auto px-8 py-3 rounded-full text-sm font-cinzel tracking-widest uppercase
              bg-gradient-to-r from-purple-800 via-violet-700 to-purple-800
              hover:from-purple-700 hover:via-violet-600 hover:to-purple-700
              text-yellow-200 border border-yellow-500/20
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-purple-900/60 hover:scale-105 active:scale-95 transition-all">
            {flipping ? "Перемешиваю..." : `✦ ${info.label} ✦`}
          </button>

          {/* History */}
          {history.length > 0 && (
            <div className="w-full mt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-purple-900/40"/>
                <span className="text-purple-600 text-xs font-cinzel tracking-widest">ИСТОРИЯ</span>
                <div className="flex-1 h-px bg-purple-900/40"/>
              </div>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <button key={i} onClick={() => handleHistorySelect(h)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-purple-950/30 border border-purple-800/20
                      hover:bg-purple-900/30 hover:border-purple-700/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 text-xs font-cinzel">
                        {SPREAD_INFO[h.spread as Spread]?.label ?? h.spread} · {h.cards.map(c => c.name_ru).join(", ")}
                      </span>
                      <span className="text-purple-700 text-xs">{h.date}</span>
                    </div>
                    <p className="text-purple-500 text-xs mt-1 truncate">{h.situation}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DRAWING — flipping */}
      {phase === "drawing" && drawnCards.length === 0 && (
        <div className="relative z-10 flex justify-center gap-4">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div key={i} className="scale-90 opacity-50 animate-pulse">
              <CardBack flipping size={cardCount === 1 ? 140 : 100}/>
            </div>
          ))}
        </div>
      )}

      {/* DRAWING — skeleton */}
      {phase === "drawing" && drawnCards.length > 0 && (
        <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-6">
          <div className="flex justify-center gap-4 flex-wrap">
            {drawnCards.map((card, i) => (
              <div key={i} style={{ animationDelay: `${i * 150}ms` }}>
                <CardFace card={card}/>
              </div>
            ))}
          </div>
          <div className="w-full space-y-3">
            {SKELETON_CONFIGS.map((cfg, i) => (
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
          <p className="text-purple-500 text-xs font-cinzel tracking-widest animate-pulse">✦ Карты читают твою судьбу... ✦</p>
        </div>
      )}

      {/* RESULT */}
      {phase === "result" && (
        <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-4">
          <ReadingResult cards={drawnCards} sections={sections} spread={spread} affirmation={affirmation}/>
          <button onClick={handleReset}
            className="mt-2 px-6 py-2 rounded-full border border-purple-700/30 text-purple-400 text-xs
              font-cinzel tracking-widest uppercase hover:border-purple-500/50 hover:text-purple-300
              transition-all hover:bg-purple-900/20">
            ← Новый расклад
          </button>
        </div>
      )}

      <footer className="relative z-10 mt-16 text-purple-800 text-xs text-center font-cinzel tracking-widest">
        ТАРО AI · ИНТЕРПРЕТАЦИИ ОТ ИСКУССТВЕННОГО ИНТЕЛЛЕКТА
      </footer>
    </main>
  );
}
