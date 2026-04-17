"use client";

import { useCallback } from "react";

interface Card { name: string; name_ru: string; reversed?: boolean; }
interface Section { title: string; text: string; }

interface Props {
  cards: Card[];
  sections: Section[];
  affirmation?: string;
  spread: string;
}

export default function ShareButton({ cards, sections, affirmation, spread }: Props) {
  const generate = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;

    // Background
    const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
    bg.addColorStop(0, "#0d0a1a");
    bg.addColorStop(0.5, "#1a0f3a");
    bg.addColorStop(1, "#0d0a1a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    // Stars
    for (let i = 0; i < 120; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 1080, Math.random() * 1920, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.3})`;
      ctx.fill();
    }

    // Glow orb
    const glow = ctx.createRadialGradient(540, 400, 0, 540, 400, 400);
    glow.addColorStop(0, "rgba(124,58,237,0.2)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1920);

    // Title
    ctx.textAlign = "center";
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 52px serif";
    ctx.fillText("✦ ТАРО AI ✦", 540, 100);

    // Card images
    const cardCount = cards.length;
    const cardW = cardCount === 1 ? 280 : 200;
    const cardH = cardCount === 1 ? 448 : 320;
    const startX = cardCount === 1 ? 400 : 540 - (cardCount * (cardW + 20)) / 2 + cardW / 2;

    for (let i = 0; i < cardCount; i++) {
      const x = cardCount === 1 ? startX : startX + i * (cardW + 20);
      const y = 160;
      const slug = cards[i].name.toLowerCase().replace(/\s+/g, "-");

      try {
        const img = await loadImage(`/cards/${slug}.jpg`);
        ctx.save();
        if (cards[i].reversed) {
          ctx.translate(x + cardW / 2, y + cardH / 2);
          ctx.rotate(Math.PI);
          ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);
        } else {
          ctx.drawImage(img, x - cardW / 2, y, cardW, cardH);
        }
        ctx.restore();

        // Card glow
        ctx.save();
        ctx.shadowColor = "#7c3aed";
        ctx.shadowBlur = 30;
        ctx.strokeStyle = "rgba(124,58,237,0.6)";
        ctx.lineWidth = 2;
        roundRect(ctx, x - cardW / 2, y, cardW, cardH, 12);
        ctx.stroke();
        ctx.restore();
      } catch { /* skip if image fails */ }

      // Card name
      ctx.fillStyle = "#fde68a";
      ctx.font = "24px serif";
      ctx.textAlign = "center";
      ctx.fillText(
        cards[i].name_ru + (cards[i].reversed ? " ↓" : ""),
        x, y + cardH + 36
      );
    }

    // Sections
    let textY = cardCount === 1 ? 780 : 640;
    const sectionColors = ["#a78bfa", "#60a5fa", "#fbbf24", "#34d399"];

    for (let i = 0; i < Math.min(sections.length, 4); i++) {
      const s = sections[i];
      const color = sectionColors[i % sectionColors.length];

      // Section bg
      ctx.save();
      ctx.fillStyle = color + "18";
      ctx.strokeStyle = color + "44";
      ctx.lineWidth = 1;
      roundRect(ctx, 60, textY - 10, 960, 180, 16);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      // Title
      ctx.fillStyle = color;
      ctx.font = "bold 28px serif";
      ctx.textAlign = "left";
      if (s.title) ctx.fillText(s.title, 90, textY + 28);

      // Text (wrapped)
      ctx.fillStyle = "rgba(233,213,255,0.85)";
      ctx.font = "26px sans-serif";
      wrapText(ctx, s.text, 90, textY + 68, 900, 36);

      textY += 200;
    }

    // Affirmation
    if (affirmation) {
      ctx.fillStyle = "rgba(245,158,11,0.15)";
      ctx.strokeStyle = "rgba(245,158,11,0.4)";
      ctx.lineWidth = 1;
      roundRect(ctx, 100, textY + 20, 880, 100, 50);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = "#fde68a";
      ctx.font = "italic bold 32px serif";
      ctx.textAlign = "center";
      ctx.fillText(`✦ ${affirmation} ✦`, 540, textY + 82);
    }

    // Footer
    ctx.fillStyle = "rgba(124,58,237,0.5)";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.fillText("tarot-ai.vercel.app", 540, 1880);

    // Download
    const link = document.createElement("a");
    link.download = "tarot-reading.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [cards, sections, affirmation, spread]);

  return (
    <button
      onClick={generate}
      className="flex items-center gap-2 px-5 py-2 rounded-full border border-purple-600/40
        text-purple-300 text-xs font-cinzel tracking-widest uppercase
        hover:border-purple-500/60 hover:text-purple-200 hover:bg-purple-900/20 transition-all"
    >
      <span>📤</span> Поделиться
    </button>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, cy);
      line = word + " ";
      cy += lineH;
      if (cy > y + lineH * 3) break; // max 4 lines
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line.trim(), x, cy);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
