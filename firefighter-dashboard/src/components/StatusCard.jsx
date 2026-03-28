export default function StatusCard({ icon, label, value, unit, color = "green", sublabel }) {
  const colorMap = {
    green: {
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/10",
      text: "text-emerald-600",
      badge: "bg-emerald-500/10 text-emerald-600",
      dot: "bg-emerald-500",
    },
    orange: {
      border: "border-orange-500/30",
      glow: "shadow-orange-500/10",
      text: "text-orange-600",
      badge: "bg-orange-500/10 text-orange-600",
      dot: "bg-orange-500",
    },
    red: {
      border: "border-red-500/30",
      glow: "shadow-red-500/10",
      text: "text-red-600",
      badge: "bg-red-500/10 text-red-600",
      dot: "bg-red-500",
    },
    blue: {
      border: "border-blue-500/30",
      glow: "shadow-blue-500/10",
      text: "text-blue-600",
      badge: "bg-blue-500/10 text-blue-600",
      dot: "bg-blue-500",
    },
  };

  const c = colorMap[color] || colorMap.green;

  return (
    <div
      className={`relative rounded-xl border ${c.border} bg-white/95 p-3 shadow-md backdrop-blur-md overflow-hidden group hover:border-slate-400 transition-all duration-200 h-full flex flex-col`}
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{label}</p>
          </div>
          <span className={`w-1.5 h-1.5 rounded-sm ${c.dot} animate-pulse shadow-sm`} />
        </div>

        {/* Value */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-baseline gap-1">
             <span className={`text-4xl font-bold font-mono tracking-tighter ${c.text} leading-none`}>{value ?? "—"}</span>
             {unit && <span className="text-sm text-slate-400 font-bold">{unit}</span>}
          </div>
        </div>

        {sublabel && (
          <p className="text-[9px] text-slate-400 mt-2 font-mono font-bold uppercase tracking-widest bg-slate-50 p-1 rounded border border-slate-100">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
