"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: string;
}

const COLORS = ["#c084fc", "#f59e0b", "#818cf8", "#fde68a", "#a78bfa", "#ffffff"];

export default function Particles({ trigger }: { trigger: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Spawn burst of particles from center
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.35;

    for (let i = 0; i < 60; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 1.5 + Math.random() * 4;
      particles.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0,
        maxLife: 60 + Math.random() * 60,
        size: 2 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.current = particles.current.filter(p => p.life < p.maxLife);

      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.vx *= 0.99;
        p.life++;

        const alpha = 1 - p.life / p.maxLife;
        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = p.color;
        ctx!.shadowColor = p.color;
        ctx!.shadowBlur = 6;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife * 0.5), 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      if (particles.current.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      }
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: trigger ? 1 : 0 }}
    />
  );
}
