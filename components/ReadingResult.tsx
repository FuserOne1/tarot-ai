"use client";

import TarotCardSvg from "./TarotCardSvg";

interface Card {
  id: number;
  name: string;
  name_ru: string;
  arcana: string;
  keywords: string;
  suit?: string;
}

interface Section { title: string; text: string; }

interface Props {
  cards: Card[];
  sections: Section[];
  spread: "one" | "three";
}

const SECTION_CONFIG = [
  { icon: "🔮", gradient: "from-violet-900/60 to-purple-950/60", border: "border-violet-500/30", titleColor: "text-violet-300", accent: "#8b5cf6" },
  { icon: "🌊", gradient: "from-blue-900/50 to-indigo-950/60",   border: "border-blue-500/30",   titleColor: "text-blue-300",   accent: "#3b82f6" },
  { icon: "⭐", gradient: "from-amber-900/40 to-yellow-950/50",  border: "border-amber-500/30",  titleColor: "text-amber-300",  accent: "#f59e0b" },
  { icon: "🌟", gradient: "from-emerald-900/40 to-teal-950/50",  border: "border-emerald-500/30",titleColor: "text-emerald-300",accent: "#10b981" },
];

const SPREAD_LABELS = ["Прошлое", "Настоящее", "Будущее"];

function CardImg({ card, label, spread }: { card: Card; label?: string; spread: "one" | "three" }) {
  const slug = card.name.toLowerCase().replace(/\s+/g, "-");
  const w = spread === "one" ? "w-[160px]" : "w-[110px]";
  const h = spread === "one" ? "h-[256px]" : "h-[176px]";
  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-purple-500 text-xs font-cinzel tracking-widest uppercase">{label}</span>
      )}
      <div className={`relative ${w} ${h} rounded-xl overflow-hidden animate-card-reveal animate-float`}
        style={{ boxShadow: "0 0 28px #7c3aed55", background: "#0d0a1a" }}>
        <img
          src={`/cards/${slug}.jpg`}
          alt={card.name_ru}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fb = e.currentTarget.nextElementSibling as HTMLElement;
            if (fb) fb.style.display = "flex";
          }}
        />
        <div style={{ display: "none" }} className="absolute inset-0 items-center justify-center">
          <TarotCardSvg card={card} size="sm" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-yellow-300/80 text-xs font-cinzel">{card.name_ru}</p>
      </div>
    </div>
  );
}

export default function ReadingResult({ cards, sections, spread }: Props) {
  return (
    <div className="w-full max-w-xl mx-auto mt-2 animate-fade-in">
      {/* Cards row */}
      <div className={`flex justify-center gap-4 mb-6 ${spread === "one" ? "" : "gap-3"}`}>
        {cards.map((card, i) => (
          <CardImg key={card.id} card={card} spread={spread}
            label={spread === "three" ? SPREAD_LABELS[i] : undefined}
          />
        ))}
      </div>

      {/* Single card name */}
      {spread === "one" && (
        <div className="text-center mb-6">
          <h2 className="font-cinzel text-2xl shimmer-text tracking-wide">{cards[0].name_ru}</h2>
          <p className="text-purple-500 text-xs mt-1 tracking-widest uppercase font-cinzel">{cards[0].name}</p>
          <div className="flex flex-wrap justify-center gap-1 mt-3 max-w-xs mx-auto">
            {cards[0].keywords.split(", ").map((kw) => (
              <span key={kw} className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-700/30 text-purple-300 text-xs">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-600/50 to-transparent"/>
        <span className="text-yellow-500/70 text-xs font-cinzel tracking-[0.3em]">
          {spread === "one" ? "ПОСЛАНИЕ КАРТЫ" : "РАСКЛАД"}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-600/50 to-transparent"/>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, i) => {
          const cfg = SECTION_CONFIG[i % SECTION_CONFIG.length];
          return (
            <div key={i}
              className={`rounded-2xl bg-gradient-to-br ${cfg.gradient} border ${cfg.border} p-5
                shadow-lg transition-all duration-200 hover:scale-[1.01]`}>
              {section.title && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{cfg.icon}</span>
                  <h3 className={`font-cinzel text-xs tracking-widest uppercase ${cfg.titleColor}`}>
                    {section.title}
                  </h3>
                  <div className="flex-1 h-px ml-1" style={{ background: cfg.accent + "33" }}/>
                </div>
              )}
              <p className="text-purple-100/85 text-sm leading-relaxed">{section.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
