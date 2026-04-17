interface Card {
  id: number;
  name: string;
  name_ru: string;
  arcana: string;
  suit?: string;
}

interface Props {
  card: Card;
  size?: "sm" | "lg";
}

// Suit colors
const SUIT_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  wands:     { primary: "#f97316", secondary: "#fbbf24", glow: "#f97316" },
  cups:      { primary: "#38bdf8", secondary: "#818cf8", glow: "#38bdf8" },
  swords:    { primary: "#e2e8f0", secondary: "#94a3b8", glow: "#cbd5e1" },
  pentacles: { primary: "#4ade80", secondary: "#fbbf24", glow: "#4ade80" },
};

const MAJOR_COLORS = { primary: "#c084fc", secondary: "#f59e0b", glow: "#a855f7" };

// Roman numerals for major arcana
const ROMAN = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];

function SuitSymbol({ suit, color, cx, cy, r }: { suit: string; color: string; cx: number; cy: number; r: number }) {
  if (suit === "wands") {
    return (
      <g transform={`translate(${cx},${cy})`}>
        <line x1="0" y1={-r} x2="0" y2={r} stroke={color} strokeWidth="3" strokeLinecap="round"/>
        <line x1={-r*0.5} y1={-r*0.3} x2={r*0.5} y2={-r*0.3} stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1={-r*0.4} y1={r*0.1} x2={r*0.4} y2={r*0.1} stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="0" cy={-r} r="3" fill={color}/>
      </g>
    );
  }
  if (suit === "cups") {
    const d = `M ${-r*0.7},${-r*0.2} Q ${-r*0.8},${r*0.5} 0,${r*0.7} Q ${r*0.8},${r*0.5} ${r*0.7},${-r*0.2} Q 0,${-r*0.6} ${-r*0.7},${-r*0.2}`;
    return <path d={d} fill="none" stroke={color} strokeWidth="2.5" transform={`translate(${cx},${cy})`}/>;
  }
  if (suit === "swords") {
    return (
      <g transform={`translate(${cx},${cy})`}>
        <line x1="0" y1={-r} x2="0" y2={r} stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1={-r*0.5} y1={-r*0.2} x2={r*0.5} y2={-r*0.2} stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <polygon points={`0,${-r} ${-r*0.15},${-r*0.5} ${r*0.15},${-r*0.5}`} fill={color}/>
      </g>
    );
  }
  if (suit === "pentacles") {
    const pts = Array.from({length:5},(_,i)=>{
      const a = (i*72 - 90) * Math.PI/180;
      return `${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} fill="none" stroke={color} strokeWidth="2" transform=""/>;
  }
  return null;
}

function MajorSymbol({ id, color, cx, cy }: { id: number; color: string; cx: number; cy: number }) {
  // Eye of providence for major arcana
  return (
    <g transform={`translate(${cx},${cy})`}>
      <ellipse rx="28" ry="18" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <circle r="8" fill={color} opacity="0.9"/>
      <circle r="3" fill="#0d0a1a"/>
      {/* lashes */}
      {[-20,-10,0,10,20].map(x => (
        <line key={x} x1={x} y1="-18" x2={x*0.7} y2="-26" stroke={color} strokeWidth="1" opacity="0.5"/>
      ))}
    </g>
  );
}

export default function TarotCardSvg({ card, size = "lg" }: Props) {
  const w = size === "lg" ? 160 : 100;
  const h = size === "lg" ? 256 : 160;
  const colors = card.arcana === "major" ? MAJOR_COLORS : (SUIT_COLORS[card.suit ?? ""] ?? MAJOR_COLORS);

  const cx = w / 2;
  const cy = h / 2;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 18px ${colors.glow}55)` }}
    >
      <defs>
        <linearGradient id={`bg-${card.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1e1040"/>
          <stop offset="50%"  stopColor="#0f0a2a"/>
          <stop offset="100%" stopColor="#1a0f3a"/>
        </linearGradient>
        <linearGradient id={`border-${card.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={colors.primary}/>
          <stop offset="100%" stopColor={colors.secondary}/>
        </linearGradient>
        <radialGradient id={`glow-${card.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={colors.primary} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Card background */}
      <rect x="2" y="2" width={w-4} height={h-4} rx="12" fill={`url(#bg-${card.id})`}/>

      {/* Glow overlay */}
      <rect x="2" y="2" width={w-4} height={h-4} rx="12" fill={`url(#glow-${card.id})`}/>

      {/* Border */}
      <rect x="2" y="2" width={w-4} height={h-4} rx="12" fill="none"
        stroke={`url(#border-${card.id})`} strokeWidth="1.5" opacity="0.8"/>

      {/* Inner border */}
      <rect x="8" y="8" width={w-16} height={h-16} rx="8" fill="none"
        stroke={colors.primary} strokeWidth="0.5" opacity="0.3"/>

      {/* Corner ornaments */}
      {[[12,12],[w-12,12],[12,h-12],[w-12,h-12]].map(([ox,oy],i) => (
        <g key={i} transform={`translate(${ox},${oy})`}>
          <circle r="2" fill={colors.secondary} opacity="0.6"/>
          <circle r="4" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.4"/>
        </g>
      ))}

      {/* Top number/roman */}
      {card.arcana === "major" ? (
        <text x={cx} y="26" textAnchor="middle" fontSize="11"
          fill={colors.secondary} fontFamily="serif" opacity="0.9" letterSpacing="2">
          {ROMAN[card.id]}
        </text>
      ) : (
        <text x={cx} y="26" textAnchor="middle" fontSize="10"
          fill={colors.primary} fontFamily="sans-serif" opacity="0.7">
          {card.name.split(" ")[0].toUpperCase()}
        </text>
      )}

      {/* Decorative horizontal lines */}
      <line x1="16" y1="32" x2={w-16} y2="32" stroke={colors.primary} strokeWidth="0.5" opacity="0.3"/>
      <line x1="16" y1={h-32} x2={w-16} y2={h-32} stroke={colors.primary} strokeWidth="0.5" opacity="0.3"/>

      {/* Main symbol */}
      {card.arcana === "major" ? (
        <MajorSymbol id={card.id} color={colors.primary} cx={cx} cy={cy - 10}/>
      ) : (
        <SuitSymbol suit={card.suit ?? ""} color={colors.primary} cx={cx} cy={cy - 10} r={30}/>
      )}

      {/* Subtle star pattern */}
      {[[cx-30, cy-50],[cx+30,cy-50],[cx,cy-70],[cx-40,cy+20],[cx+40,cy+20]].map(([sx,sy],i) => (
        <circle key={i} cx={sx} cy={sy} r="1" fill={colors.secondary} opacity="0.2"/>
      ))}

      {/* Card name */}
      <text x={cx} y={h-40} textAnchor="middle" fontSize="9"
        fill={colors.secondary} fontFamily="serif" letterSpacing="1" opacity="0.9">
        {card.name_ru.length > 16 ? card.name_ru.slice(0,15)+"…" : card.name_ru}
      </text>

      {/* Arcana label */}
      <text x={cx} y={h-24} textAnchor="middle" fontSize="7"
        fill={colors.primary} fontFamily="sans-serif" opacity="0.5" letterSpacing="1">
        {card.arcana === "major" ? "СТАРШИЙ АРКАН" : (card.suit ?? "").toUpperCase()}
      </text>
    </svg>
  );
}
