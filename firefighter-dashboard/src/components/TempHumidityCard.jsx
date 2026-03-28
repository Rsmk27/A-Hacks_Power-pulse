function getTempColor(temp) {
  if (temp >= 60) return "red";
  if (temp >= 45) return "orange";
  return "green";
}

const colorMap = {
  green: { text: "text-emerald-600", border: "border-emerald-500/30", bg: "bg-emerald-500/10", label: "NORMAL", dot: "bg-emerald-500" },
  orange: { text: "text-orange-600", border: "border-orange-500/30", bg: "bg-orange-500/10", label: "WARNING", dot: "bg-orange-500" },
  red: { text: "text-red-600", border: "border-red-500/30", bg: "bg-red-500/10", label: "CRITICAL", dot: "bg-red-500 animate-ping" },
};

export default function TempHumidityCard({ temperature, humidity }) {
  const tempColor = getTempColor(temperature ?? 0);
  const c = colorMap[tempColor];

  return (
    <>
    <div className="rounded-xl border border-slate-300 bg-white/95 p-3 shadow-md h-full flex flex-col hover:border-slate-400 transition-colors">
      <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌡️</span>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Respiration & Environment</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shadow-sm`} />
          <span className={`text-[10px] font-bold ${c.text}`}>{c.label}</span>
        </div>
      </div>

      <div className="flex gap-4 flex-1 items-center">
        {/* Temp Side */}
        <div className="flex-1">
          <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Ambient Temp</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-bold font-mono tracking-tighter ${c.text} leading-none`}>
              {temperature != null ? temperature.toFixed(1) : "—"}
            </span>
            <span className="text-sm text-slate-400 font-bold">°C</span>
          </div>
          <div className="w-full bg-slate-100 rounded-sm h-1 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 liquid-bar ${
                tempColor === "green" ? "bg-emerald-500" : tempColor === "orange" ? "bg-orange-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, ((temperature ?? 0) / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200" />

        {/* Humidity Side */}
        <div className="flex-1">
          <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Rel. Humidity</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold font-mono text-sky-600 leading-none">
              {humidity ?? "—"}
            </span>
            <span className="text-sm text-slate-400">%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-sm h-1 mt-2 overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-700 liquid-bar"
              style={{ width: `${humidity ?? 0}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-3 text-[8px] text-slate-400 font-mono tracking-widest bg-slate-50 p-1 rounded border border-slate-100 font-bold uppercase">
        <span className="text-emerald-600">SAFE &lt;45</span>
        <span className="text-orange-500">WARN 45-60</span>
        <span className="text-red-500">CRIT &gt;60</span>
      </div>
    </div>
    </>
  );
}
