export default function StatusCard({ icon, label, value, unit, color = "green", sublabel }) {
  const colorMap = {
    green: {
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/10",
      text: "text-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-400",
      dot: "bg-emerald-500",
    },
    orange: {
      border: "border-orange-500/30",
      glow: "shadow-orange-500/10",
      text: "text-orange-400",
      badge: "bg-orange-500/10 text-orange-400",
      dot: "bg-orange-500",
    },
    red: {
      border: "border-red-500/30",
      glow: "shadow-red-500/10",
      text: "text-red-400",
      badge: "bg-red-500/10 text-red-400",
      dot: "bg-red-500",
    },
    blue: {
      border: "border-blue-500/30",
      glow: "shadow-blue-500/10",
      text: "text-blue-400",
      badge: "bg-blue-500/10 text-blue-400",
      dot: "bg-blue-500",
    },
  };

  const c = colorMap[color] || colorMap.green;

  return (
    <div
      className={`relative rounded-2xl border ${c.border} bg-[#111111] p-5 shadow-lg ${c.glow} overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}
    >
      {/* Background glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${c.badge} blur-xl`} />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          <span className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
        </div>

        {/* Label */}
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">{label}</p>

        {/* Value */}
        <div className="flex items-end gap-1 mt-2">
          <span className={`text-4xl font-bold ${c.text} leading-none`}>{value ?? "—"}</span>
          {unit && <span className="text-lg text-gray-400 mb-0.5">{unit}</span>}
        </div>

        {sublabel && (
          <p className="text-xs text-gray-600 mt-2">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
