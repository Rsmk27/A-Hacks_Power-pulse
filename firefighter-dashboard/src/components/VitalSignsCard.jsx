import React from "react";

export default function VitalSignsCard({ heartRate, spo2, status }) {
  const isHrHigh = heartRate > 110;
  const isSpo2Low = spo2 < 93;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md hover:border-slate-600 transition-all flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <span className="text-lg">❤️</span> Vital Signs
        </h2>
        {status === "critical" && (
          <span className="animate-pulse bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 uppercase">
            WARNING ALERT
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6">
        {/* Heart Rate */}
        <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Heart Rate</div>
            <div className={`text-4xl font-bold font-mono tracking-tighter ${isHrHigh ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>
              {heartRate} <span className="text-sm text-slate-500 ml-1">BPM</span>
            </div>
          </div>
          <div className="h-12 w-24">
             {/* Mock mini chart for heart rate */}
             <svg viewBox="0 0 100 30" className="w-full h-full stroke-emerald-500 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               {isHrHigh ? (
                  <path d="M0,15 L10,15 L15,5 L25,25 L35,0 L45,30 L55,5 L65,25 L75,10 L85,20 L90,15 L100,15" className="stroke-red-500 animate-pulse" />
               ) : (
                  <path d="M0,15 L20,15 L25,5 L35,25 L45,15 L80,15 L85,5 L95,25 L100,15" />
               )}
             </svg>
          </div>
        </div>

        {/* SpO2 */}
        <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Oxygen (SpO2)</div>
            <div className={`text-4xl font-bold font-mono tracking-tighter ${isSpo2Low ? "text-orange-500 animate-pulse" : "text-sky-400"}`}>
              {spo2} <span className="text-sm text-slate-500 ml-1">%</span>
            </div>
          </div>
          <div className="h-12 w-24 flex items-center justify-end">
             <div className="flex gap-1 items-end h-8">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className={`w-3 rounded-sm bg-sky-500 transition-all duration-300 ${i > (spo2 - 90)/2 ? "opacity-20" : "opacity-100"}`} style={{ height: `${20 + i*4}px` }} />
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
