import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const EMERGENCY_SOUND_URL = "https://www.myinstants.com/media/sounds/wrong-lie-incorrect-buzzer.mp3";

export default function FallAlert({ fallDetected }) {
  const prevFall = useRef(false);
  const alarmAudioRef = useRef(null);

  useEffect(() => {
    if (fallDetected && !prevFall.current) {
      toast.error("⚠️ FALL DETECTED! Immediate assistance required!", {
        duration: 6000,
        style: {
          background: "#fff5f5",
          color: "#b91c1c",
          border: "1px solid #fecaca",
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: "600",
        },
      });
    }
    prevFall.current = fallDetected;
  }, [fallDetected]);

  useEffect(() => {
    if (fallDetected) {
      // Prefer the requested custom emergency sound and keep it looping.
      if (!alarmAudioRef.current) {
        const audio = new Audio(EMERGENCY_SOUND_URL);
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = 0.9;
        alarmAudioRef.current = audio;
      }

      alarmAudioRef.current
        .play()
        .then(() => { })
        .catch(() => {
          // Browser may block autoplay until user interacts with the page.
        });
    }

    if (!fallDetected) {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
      }
    };
  }, [fallDetected]);

  if (!fallDetected) {
    return (
      <div className="relative rounded-xl border border-emerald-500/30 bg-white/95 p-3 shadow-md backdrop-blur-md overflow-hidden hover:border-slate-400 transition-all duration-200 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Motion/Fall Array</p>
          </div>
          <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500 animate-pulse shadow-sm" />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-600 leading-none">STABLE</span>
          </div>
        </div>
        <p className="text-[9px] text-slate-400 mt-2 font-mono font-bold uppercase tracking-widest bg-slate-50 p-1 rounded border border-slate-100">GYRO_STABLE: Baseline Nominal</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-red-500 bg-red-50/95 p-3 shadow-md backdrop-blur-md overflow-hidden animate-pulse-border h-full flex flex-col">
      {/* Pulsing glow overlay */}
      <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2 border-b border-red-500/30 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-bounce">⚠️</span>
            <p className="text-[10px] text-red-600 uppercase tracking-widest font-bold">Fall Alert</p>
          </div>
          <span className="text-[9px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded-sm animate-pulse tracking-widest shadow-sm">IMPACT</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-2xl font-bold font-mono text-red-600 leading-none">⚠ FALL DETECTED</p>
        </div>
        <p className="text-[9px] text-red-600 mt-2 font-mono font-bold uppercase tracking-widest bg-red-100 p-1 rounded animate-pulse">IMMEDIATE ASSISTANCE REQ!</p>
      </div>
    </div>
  );
}
