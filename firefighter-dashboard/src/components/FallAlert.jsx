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
        .then(() => {})
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
      <div className="relative rounded-2xl border border-emerald-500/30 bg-white p-5 shadow-md overflow-hidden hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">🛡️</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-xs text-gray-600 uppercase tracking-widest font-medium mb-1">Fall Detection</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-4xl font-bold text-emerald-400 leading-none">STABLE</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">No fall events detected</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border-2 border-red-500 bg-red-50 p-5 shadow-xl shadow-red-200 overflow-hidden animate-pulse-border">
      {/* Pulsing glow overlay */}
      <div className="absolute inset-0 bg-red-500/10 animate-pulse" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl animate-bounce">⚠️</span>
          <span className="text-xs font-bold text-red-700 bg-red-200 px-2 py-0.5 rounded-full animate-pulse">ALERT</span>
        </div>
        <p className="text-xs text-red-700/70 uppercase tracking-widest font-medium mb-1">Fall Detection</p>
        <div className="mt-2">
          <p className="text-2xl font-bold text-red-700 leading-none">⚠ FALL DETECTED</p>
          <p className="text-xs text-red-700/80 mt-2 animate-pulse">Immediate assistance needed!</p>
        </div>
      </div>
    </div>
  );
}
