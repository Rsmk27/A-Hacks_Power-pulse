const statusConfig = {
  safe: {
    label: "SAFE",
    emoji: "✅",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
    pulsing: false,
  },
  warning: {
    label: "WARNING",
    emoji: "⚠️",
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/10",
    dot: "bg-orange-500",
    pulsing: false,
  },
  critical: {
    label: "CRITICAL",
    emoji: "🚨",
    color: "text-red-400",
    border: "border-red-500/50",
    bg: "bg-red-500/20",
    dot: "bg-red-500 animate-ping",
    pulsing: true,
  },
  unknown: {
    label: "UNKNOWN",
    emoji: "❓",
    color: "text-gray-400",
    border: "border-gray-700",
    bg: "bg-gray-800/50",
    dot: "bg-gray-500",
    pulsing: false,
  },
};

export default function FirefighterStatus({ status }) {
  const cfg = statusConfig[status] ?? statusConfig.unknown;

  return (
    <div
      className={`relative rounded-2xl border ${cfg.border} bg-[#111111] p-5 shadow-lg overflow-hidden hover:scale-[1.02] transition-transform duration-200 ${
        cfg.pulsing ? "animate-pulse" : ""
      }`}
    >
      {cfg.pulsing && <div className="absolute inset-0 bg-red-500/5 animate-pulse" />}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{cfg.emoji}</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          </div>
        </div>

        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Unit Status</p>

        <div className="mt-2">
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${cfg.color} ${cfg.bg} border ${cfg.border}`}
          >
            {cfg.label}
          </span>
        </div>

        <p className="text-xs text-gray-600 mt-3">
          {status === "safe" && "Firefighter is operating normally"}
          {status === "warning" && "Attention required — monitor closely"}
          {status === "critical" && "Emergency! Immediate action required!"}
          {status === "unknown" && "Waiting for device signal..."}
        </p>
      </div>
    </div>
  );
}
