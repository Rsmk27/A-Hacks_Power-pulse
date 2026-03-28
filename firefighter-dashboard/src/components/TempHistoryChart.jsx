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
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-gray-600 mb-1">{label}</p>
        <p className="text-lg font-bold" style={{ color }}>
          {temp.toFixed(1)}°C
        </p>
      </div>
    );
  }
  return null;
};

export default function TempHistoryChart({ data, emptyMessage = "Waiting for temperature data..." }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="time"
          tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "Space Grotesk" }}
          axisLine={{ stroke: "#d1d5db" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "Space Grotesk" }}
          axisLine={{ stroke: "#d1d5db" }}
          tickLine={false}
          tickFormatter={(v) => `${v}°`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={45} stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "WARN", fill: "#f97316", fontSize: 10 }} />
        <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "CRIT", fill: "#ef4444", fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey="temp"
          stroke="#FF4500"
          strokeWidth={2.5}
          dot={(props) => {
            const { cx, cy, payload } = props;
            const color = payload.temp >= 60 ? "#ef4444" : payload.temp >= 45 ? "#f97316" : "#10b981";
            return (
              <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill={color} stroke="transparent" />
            );
          }}
          activeDot={{ r: 5, fill: "#FF4500", stroke: "#fff", strokeWidth: 1 }}
          isAnimationActive={true}
          animationDuration={300}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
