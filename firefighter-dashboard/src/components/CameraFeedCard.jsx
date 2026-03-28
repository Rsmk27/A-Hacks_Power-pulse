import React from "react";

export default function CameraFeedCard({ firefighterId }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md hover:border-slate-600 transition-all flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-3 z-10 relative">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <span className="text-lg">📷</span> Helmet Feed
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
          <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-red-500">REC</span>
        </div>
      </div>

      <div className="relative flex-1 bg-black rounded-lg border border-slate-700 overflow-hidden min-h-[160px] group">
        <img
          src="https://images.unsplash.com/photo-1543881261-2d7c00e1dc6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          alt="Firefighter simulation POV"
          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[40%] contrast-125 group-hover:opacity-90 transition-opacity"
        />
        
        {/* Overlay scanning effect */}
        <div className="absolute inset-0 w-full h-[5px] bg-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.5)] animate-[scan_3s_infinite_linear]" />

        {/* AI Overlay Box */}
        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 border-2 border-dashed border-red-500/80">
          <span className="absolute -top-6 left-0 bg-red-500/80 text-white text-[9px] px-1 tracking-widest font-mono">
             HAZARD: THERMAL OUTLIER
          </span>
        </div>

        {/* Technical crosshairs */}
        <div className="absolute top-1/2 left-0 right-0 border-t border-sky-500/20" />
        <div className="absolute left-1/2 top-0 bottom-0 border-l border-sky-500/20" />

        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-sky-400">
           VISION_AI_v4.2 // SYS_ONLINE
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
