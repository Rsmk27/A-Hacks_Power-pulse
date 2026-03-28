import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const temp = payload[0].value;
    const color = temp >= 60 ? "#ef4444" : temp >= 45 ? "#f97316" : "#10b981";
    return (
      <div className="bg-white/95 border border-slate-300 backdrop-blur rounded p-3 shadow-lg">
        <p className="text-[10px] text-slate-500 mb-1 font-mono font-bold uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold font-mono" style={{ color }}>
          {temp.toFixed(1)}°C
        </p>
      </div>
    );
  }
  return null;
};

export default function TempHistoryChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Waiting for temperature data...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="time"
          tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace", fontWeight: "bold" }}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace", fontWeight: "bold" }}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={false}
          tickFormatter={(v) => `${v}°`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={45} stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "WARN", fill: "#f97316", fontSize: 10 }} />
        <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "CRIT", fill: "#ef4444", fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey="temp"
          stroke="#0ea5e9"
          strokeWidth={2.5}
          dot={(props) => {
            const { cx, cy, payload } = props;
            const color = payload.temp >= 60 ? "#ef4444" : payload.temp >= 45 ? "#f97316" : "#10b981";
            return (
              <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill={color} stroke="transparent" />
            );
          }}
          activeDot={{ r: 5, fill: "#0ea5e9", stroke: "#ffffff", strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={300}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
