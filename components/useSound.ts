"use client";
import { useRef, useCallback } from "react";

export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }

  const playFlip = useCallback(() => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch { /* ignore */ }
  }, [enabled]);

  const playReveal = useCallback(() => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      [0, 0.1, 0.2].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        const freqs = [523, 659, 784];
        osc.frequency.value = freqs[i];
        gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.6);
      });
    } catch { /* ignore */ }
  }, [enabled]);

  return { playFlip, playReveal };
}
