"use client";

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

function parseReading(text: string) {
  // Split by markdown bold headers
  const sections = text.split(/\*\*(.+?)\*\*/g).filter(Boolean);
  const result: { title?: string; content: string }[] = [];

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i].trim();
    if (!s) continue;
    // If next section exists and current looks like a title (short, no newlines)
    if (i + 1 < sections.length && s.length < 60 && !s.includes("\n")) {
      result.push({ title: s, content: sections[i + 1].trim() });
      i++;
    } else if (result.length === 0) {
      result.push({ content: s });
    }
  }

  return result.length > 0 ? result : [{ content: text }];
}

const SECTION_ICONS: Record<string, string> = {
  "Послание карты": "🔮",
  "Что сейчас происходит": "🌊",
  "Совет карты": "⭐",
  "Прогноз": "🌟",
};

export default function ReadingResult({ card, reading, isLoading }: Props) {
  const sections = parseReading(reading);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in">
      {/* Card header */}
      <div className="text-center mb-6">
        <div className="inline-block px-4 py-1 rounded-full bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs mb-3">
          Вытянутая карта
        </div>
        <h2 className="text-2xl font-serif text-yellow-300">{card.name_ru}</h2>
        <p className="text-purple-400 text-sm mt-1">{card.name}</p>
        <div className="flex flex-wrap justify-center gap-1 mt-3">
          {card.keywords.split(", ").map((kw) => (
            <span
              key={kw}
              className="px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-700/30 text-purple-300 text-xs"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        <span className="text-purple-400 text-sm">✦</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      </div>

      {/* Reading content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-purple-900/20 border border-purple-800/30 p-4 animate-pulse">
              <div className="h-4 bg-purple-800/40 rounded w-1/3 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-purple-800/30 rounded w-full" />
                <div className="h-3 bg-purple-800/30 rounded w-5/6" />
                <div className="h-3 bg-purple-800/30 rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, i) => (
            <div
              key={i}
              className="rounded-xl bg-purple-900/20 border border-purple-800/30 p-4 hover:bg-purple-900/30 transition-colors"
            >
              {section.title && (
                <h3 className="text-yellow-400/90 font-serif text-sm font-medium mb-2 flex items-center gap-2">
                  <span>{SECTION_ICONS[section.title] ?? "✦"}</span>
                  {section.title}
                </h3>
              )}
              <p className="text-purple-100/80 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
