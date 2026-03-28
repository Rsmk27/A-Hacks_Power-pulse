function getTempColor(temp) {
  if (temp >= 60) return "red";
  if (temp >= 45) return "orange";
  return "green";
}

const colorMap = {
  green: { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/5", label: "NORMAL", dot: "bg-emerald-500" },
  orange: { text: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/5", label: "WARNING", dot: "bg-orange-500" },
  red: { text: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/5", label: "CRITICAL", dot: "bg-red-500 animate-ping" },
};

export default function TempHumidityCard({ temperature, humidity }) {
  const tempColor = getTempColor(temperature ?? 0);
  const c = colorMap[tempColor];

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} bg-[#111111] p-5 shadow-lg hover:scale-[1.02] transition-transform duration-200`}>
      {/* Temperature Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌡️</span>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Temperature</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
            <span className={`text-xs font-bold ${c.text}`}>{c.label}</span>
          </div>
        </div>

        {/* Gauge bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${
              tempColor === "green" ? "bg-emerald-500" : tempColor === "orange" ? "bg-orange-500" : "bg-red-500"
            }`}
            style={{ width: `${Math.min(100, ((temperature ?? 0) / 100) * 100)}%` }}
          />
        </div>

        <div className="flex items-end gap-1">
          <span className={`text-5xl font-bold ${c.text} leading-none`}>
            {temperature != null ? temperature.toFixed(1) : "—"}
          </span>
          <span className="text-lg text-gray-400 mb-1">°C</span>
        </div>

        <div className="flex gap-3 mt-2 text-xs text-gray-600">
          <span>Safe: &lt;45°C</span>
          <span className="text-orange-600">Warn: 45–60°C</span>
          <span className="text-red-600">Crit: &gt;60°C</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 my-3" />

      {/* Humidity Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">💧</span>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Humidity</p>
        </div>

        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-700"
            style={{ width: `${humidity ?? 0}%` }}
          />
        </div>

        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-blue-400 leading-none">{humidity ?? "—"}</span>
          <span className="text-base text-gray-400 mb-0.5">%</span>
        </div>
      </div>
    </div>
  );
}
