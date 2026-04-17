"use client";

import Image from "next/image";
import TarotCardSvg from "./TarotCardSvg";

interface Card {
  id: number;
  name: string;
  name_ru: string;
  arcana: string;
  keywords: string;
  suit?: string;
}

interface Section {
  title: string;
  text: string;
}

interface Props {
  card: Card;
  sections: Section[];
  isLoading: boolean;
}

// Section visual config
const SECTION_CONFIG = [
  {
    icon: "🔮",
    gradient: "from-violet-900/60 to-purple-950/60",
    border: "border-violet-500/30",
    titleColor: "text-violet-300",
    glow: "shadow-violet-900/30",
    accent: "#8b5cf6",
  },
  {
    icon: "🌊",
    gradient: "from-blue-900/50 to-indigo-950/60",
    border: "border-blue-500/30",
    titleColor: "text-blue-300",
    glow: "shadow-blue-900/30",
    accent: "#3b82f6",
  },
  {
    icon: "⭐",
    gradient: "from-amber-900/40 to-yellow-950/50",
    border: "border-amber-500/30",
    titleColor: "text-amber-300",
    glow: "shadow-amber-900/30",
    accent: "#f59e0b",
  },
  {
    icon: "🌟",
    gradient: "from-emerald-900/40 to-teal-950/50",
    border: "border-emerald-500/30",
    titleColor: "text-emerald-300",
    glow: "shadow-emerald-900/30",
    accent: "#10b981",
  },
];

function CardImage({ card }: { card: Card }) {
  const slug = card.name.toLowerCase().replace(/\s+/g, "-");
  const src = `/cards/${slug}.jpg`;

  return (
    <div className="relative w-[160px] h-[256px] rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 0 40px #7c3aed55, 0 0 80px #7c3aed22" }}>
      <Image
        src={src}
        alt={card.name_ru}
        fill
        className="object-cover"
        onError={() => {/* fallback handled below */}}
        unoptimized
      />
    </div>
  );
}

function CardDisplay({ card }: { card: Card }) {
  // Check if image exists by trying to render it with error fallback
  return <CardImageWithFallback card={card} />;
}

function CardImageWithFallback({ card }: { card: Card }) {
  const slug = card.name.toLowerCase().replace(/\s+/g, "-");
  const src = `/cards/${slug}.jpg`;

  return (
    <div className="animate-float">
      <div className="relative w-[160px] h-[256px] rounded-2xl overflow-hidden group"
        style={{ boxShadow: "0 0 40px #7c3aed55, 0 0 80px #7c3aed22" }}>
        <img
          src={src}
          alt={card.name_ru}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide img and show SVG fallback
            const target = e.currentTarget;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        {/* SVG fallback — hidden by default, shown on img error */}
        <div style={{ display: "none" }} className="absolute inset-0 items-center justify-center">
          <TarotCardSvg card={card} size="lg" />
        </div>
      </div>
    </div>
  );
}

export default function ReadingResult({ card, sections, isLoading }: Props) {
  return (
    <div className="w-full max-w-xl mx-auto mt-4 animate-fade-in">
      {/* Card display */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <CardDisplay card={card} />
        <div className="text-center">
          <h2 className="font-cinzel text-2xl shimmer-text tracking-wide">{card.name_ru}</h2>
          <p className="text-purple-500 text-xs mt-1 tracking-widest uppercase font-cinzel">{card.name}</p>
          <div className="flex flex-wrap justify-center gap-1 mt-3 max-w-xs mx-auto">
            {card.keywords.split(", ").map((kw) => (
              <span key={kw}
                className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-700/30 text-purple-300 text-xs">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-600/50 to-transparent" />
        <span className="text-yellow-500/70 text-xs font-cinzel tracking-[0.3em]">ПОСЛАНИЕ КАРТЫ</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-600/50 to-transparent" />
      </div>

      {/* Sections */}
      {isLoading ? (
        <div className="space-y-3">
          {SECTION_CONFIG.map((cfg, i) => (
            <div key={i}
              className={`rounded-2xl bg-gradient-to-br ${cfg.gradient} border ${cfg.border} p-5 animate-pulse`}>
              <div className="h-3 rounded w-1/3 mb-3" style={{ background: cfg.accent + "33" }} />
              <div className="space-y-2">
                <div className="h-2.5 rounded w-full"   style={{ background: cfg.accent + "22" }} />
                <div className="h-2.5 rounded w-5/6"   style={{ background: cfg.accent + "22" }} />
                <div className="h-2.5 rounded w-4/6"   style={{ background: cfg.accent + "22" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, i) => {
            const cfg = SECTION_CONFIG[i % SECTION_CONFIG.length];
            return (
              <div key={i}
                className={`rounded-2xl bg-gradient-to-br ${cfg.gradient} border ${cfg.border} p-5
                  shadow-lg ${cfg.glow} transition-all duration-200 hover:scale-[1.01]`}>
                {section.title && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{cfg.icon}</span>
                    <h3 className={`font-cinzel text-xs tracking-widest uppercase ${cfg.titleColor}`}>
                      {section.title}
                    </h3>
                    <div className="flex-1 h-px ml-1" style={{ background: cfg.accent + "33" }} />
                  </div>
                )}
                <p className="text-purple-100/85 text-sm leading-relaxed">
                  {section.text}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
