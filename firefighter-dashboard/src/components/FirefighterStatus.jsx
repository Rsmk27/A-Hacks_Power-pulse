const statusConfig = {
  normal: {
    label: "NORMAL",
    emoji: "✅",
    color: "text-emerald-600",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
    pulsing: false,
  },
  warning: {
    label: "WARNING",
    emoji: "⚠️",
    color: "text-orange-600",
    border: "border-orange-500/30",
    bg: "bg-orange-500/10",
    dot: "bg-orange-500",
    pulsing: true,
  },
  critical: {
    label: "CRITICAL",
    emoji: "🚨",
    color: "text-red-600",
    border: "border-red-500/50",
    bg: "bg-red-500/10",
    dot: "bg-red-500 animate-ping",
    pulsing: true,
  },
  sos: {
    label: "S.O.S",
    emoji: "🆘",
    color: "text-fuchsia-600",
    border: "border-fuchsia-500/80",
    bg: "bg-fuchsia-500/10",
    dot: "bg-fuchsia-500 animate-ping",
    pulsing: true,
  },
  offline: {
    label: "OFFLINE",
    emoji: "🔌",
    color: "text-slate-500",
    border: "border-slate-300",
    bg: "bg-slate-200",
    dot: "bg-slate-400",
    pulsing: false,
  },
};

export default function FirefighterStatus({ status }) {
  // Normalize status string just in case
  const normStatus = (status || "").toLowerCase().trim();
  const cfg = statusConfig[normStatus] || statusConfig[normStatus === "safe" ? "normal" : "offline"];

  return (
    <div
      className={`relative rounded-xl border ${cfg.border} bg-white/95 p-3 shadow-md backdrop-blur-md overflow-hidden hover:border-slate-400 transition-all duration-200 h-full flex flex-col`}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{cfg.emoji}</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Unit Status</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-sm ${cfg.dot} shadow-sm`} />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center">
            <span
              className={`inline-block px-3 py-1 rounded-sm text-3xl font-black font-mono tracking-[0.1em] ${cfg.color} ${cfg.bg} border ${cfg.border}`}
            >
              {cfg.label}
            </span>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 mt-2 font-mono font-bold uppercase tracking-widest bg-slate-50 p-1 rounded border border-slate-100 truncate">
          {normStatus === "normal" && "SYS_NOMINAL: Operating at baseline limits"}
          {normStatus === "safe" && "SYS_NOMINAL: Operating at baseline limits"}
          {normStatus === "warning" && "WARN_LEVEL_1: Physiological threshold approaching"}
          {normStatus === "critical" && "CRITICAL_ALERT: Immediate evacuation recommended"}
          {normStatus === "sos" && "DISTRESS_SIGNAL: IMMEDIATE MAYDAY DEPLOYMENT"}
          {(normStatus === "offline" || normStatus === "unknown" || !normStatus) && "AWAITING_UPLINK: Telemetry stream disconnected"}
        </p>
      </div>
    </div>
  );
}
