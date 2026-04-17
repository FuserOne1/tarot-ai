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

interface Props {
  card: Card;
  reading: string;
  isLoading: boolean;
}

// Strip all markdown formatting
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, "")          // ### headers
    .replace(/\*\*(.+?)\*\*/g, "$1")    // **bold**
    .replace(/\*(.+?)\*/g, "$1")        // *italic*
    .replace(/__(.+?)__/g, "$1")        // __bold__
    .replace(/_(.+?)_/g, "$1")          // _italic_
    .replace(/`(.+?)`/g, "$1")          // `code`
    .replace(/^\s*[-*+]\s+/gm, "")      // bullet points
    .replace(/^\s*\d+\.\s+/gm, "")      // numbered lists
    .trim();
}

// Parse into sections by numbered pattern or bold headers
function parseSections(raw: string): { title: string; content: string }[] {
  const cleaned = stripMarkdown(raw);

  // Try to split by numbered sections like "1. Title\nContent"
  const numbered = cleaned.split(/\n(?=\d+\.\s)/);
  if (numbered.length > 1) {
    return numbered.map((block) => {
      const match = block.match(/^\d+\.\s+(.+?)\n([\s\S]+)$/);
      if (match) return { title: match[1].trim(), content: match[2].trim() };
      return { title: "", content: block.trim() };
    }).filter(s => s.content);
  }

  // Try to split by double newlines as paragraphs
  const paras = cleaned.split(/\n{2,}/).filter(Boolean);
  if (paras.length > 1) {
    return paras.map((p) => ({ title: "", content: p.trim() }));
  }

  return [{ title: "", content: cleaned }];
}

const SECTION_ICONS = ["🔮", "🌊", "⭐", "🌟", "✦", "🌙"];

export default function ReadingResult({ card, reading, isLoading }: Props) {
  const sections = parseSections(reading);

  return (
    <div className="w-full max-w-xl mx-auto mt-6 animate-fade-in">
      {/* Card + name header */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="animate-float">
          <TarotCardSvg card={card} size="lg" />
        </div>
        <div className="text-center">
          <h2 className="font-cinzel text-2xl shimmer-text tracking-wide">{card.name_ru}</h2>
          <p className="text-purple-400 text-xs mt-1 tracking-widest uppercase font-cinzel">{card.name}</p>
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
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-600/40 to-transparent"/>
        <span className="text-yellow-500/60 text-xs font-cinzel tracking-widest">ПОСЛАНИЕ</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-600/40 to-transparent"/>
      </div>

      {/* Reading */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="rounded-xl bg-purple-950/30 border border-purple-800/20 p-4 animate-pulse">
              <div className="h-3 bg-purple-800/30 rounded w-1/3 mb-3"/>
              <div className="space-y-2">
                <div className="h-2.5 bg-purple-800/20 rounded w-full"/>
                <div className="h-2.5 bg-purple-800/20 rounded w-5/6"/>
                <div className="h-2.5 bg-purple-800/20 rounded w-4/6"/>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <div key={i}
              className="rounded-xl bg-purple-950/25 border border-purple-800/25 p-4
                hover:bg-purple-950/40 hover:border-purple-700/40 transition-all duration-200">
              {section.title && (
                <h3 className="text-yellow-400/80 text-xs font-cinzel tracking-widest uppercase mb-2 flex items-center gap-2">
                  <span>{SECTION_ICONS[i % SECTION_ICONS.length]}</span>
                  {section.title}
                </h3>
              )}
              <p className="text-purple-100/80 text-sm leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
