import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const temp = payload[0].value;
    const color = temp >= 60 ? "#ef4444" : temp >= 45 ? "#f97316" : "#10b981";
    return (
      <div className="rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm px-3 py-2 shadow-lg">
        <p className="text-[11px] text-gray-500 mb-0.5">{label}</p>
        <p className="text-base font-semibold" style={{ color }}>
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

  const displayData = data.map((point) => {
    const timeLabel = String(point.time ?? "");
    return {
      ...point,
      shortTime: timeLabel.split(" ")[0] || timeLabel,
    };
  });

  const latestTemp = displayData[displayData.length - 1]?.temp;
  const yValues = displayData.map((point) => point.temp).filter((value) => value != null);
  const yMinRaw = yValues.length ? Math.min(...yValues) : 35;
  const yMaxRaw = yValues.length ? Math.max(...yValues) : 65;
  const yMin = Math.max(20, Math.floor((yMinRaw - 2) / 5) * 5);
  const yMax = Math.ceil((yMaxRaw + 2) / 5) * 5;

  const xTickInterval = Math.max(0, Math.floor(displayData.length / 6));

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between px-1 pb-1">
        <p className="text-[11px] text-gray-500">Last 20 readings</p>
        {latestTemp != null && <p className="text-xs font-semibold text-gray-700">Now: {latestTemp.toFixed(1)}°C</p>}
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 8, right: 12, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id="tempAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 4" stroke="#e5e7eb" vertical={false} />

            <ReferenceArea y1={45} y2={60} fill="#f97316" fillOpacity={0.04} />
            <ReferenceArea y1={60} y2={Math.max(65, yMax)} fill="#ef4444" fillOpacity={0.05} />

        <XAxis
          dataKey="shortTime"
          tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "Space Grotesk" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
          interval={xTickInterval}
          minTickGap={24}
        />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "Space Grotesk" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
          tickFormatter={(v) => `${v}°`}
          width={34}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#9ca3af", strokeDasharray: "3 4" }} />
        <ReferenceLine y={45} stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "WARN", fill: "#f97316", fontSize: 10, position: "right" }} />
        <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "CRIT", fill: "#ef4444", fontSize: 10, position: "right" }} />
        <Line
          type="monotone"
          dataKey="temp"
          stroke="#f97316"
          strokeWidth={2.75}
          dot={false}
          activeDot={{ r: 4.5, fill: "#f97316", stroke: "#fff", strokeWidth: 1.5 }}
          fill="url(#tempAreaFill)"
          isAnimationActive={true}
          animationDuration={450}
        />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
