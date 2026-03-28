import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio not supported:", e);
  }
}

export default function FallAlert({ fallDetected }) {
  const prevFall = useRef(false);

  useEffect(() => {
    if (fallDetected && !prevFall.current) {
      playAlertSound();
      toast.error("⚠️ FALL DETECTED! Immediate assistance required!", {
        duration: 6000,
        style: {
          background: "#1a0000",
          color: "#ff4444",
          border: "1px solid #ff444460",
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: "600",
        },
      });
    }
    prevFall.current = fallDetected;
  }, [fallDetected]);

  if (!fallDetected) {
    return (
      <div className="relative rounded-2xl border border-emerald-500/30 bg-[#111111] p-5 shadow-lg overflow-hidden hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">🛡️</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Fall Detection</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-4xl font-bold text-emerald-400 leading-none">STABLE</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">No fall events detected</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border-2 border-red-500 bg-red-950/40 p-5 shadow-2xl shadow-red-500/30 overflow-hidden animate-pulse-border">
      {/* Pulsing glow overlay */}
      <div className="absolute inset-0 bg-red-500/10 animate-pulse" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl animate-bounce">⚠️</span>
          <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full animate-pulse">ALERT</span>
        </div>
        <p className="text-xs text-red-400/70 uppercase tracking-widest font-medium mb-1">Fall Detection</p>
        <div className="mt-2">
          <p className="text-2xl font-bold text-red-400 leading-none">⚠ FALL DETECTED</p>
          <p className="text-xs text-red-400/80 mt-2 animate-pulse">Immediate assistance needed!</p>
        </div>
      </div>
    </div>
  );
}
