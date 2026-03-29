import { useState, useEffect, useMemo } from "react";
import { Toaster } from "react-hot-toast";
import { useFirefighterData } from "./hooks/useFirefighterData";
import StatusCard from "./components/StatusCard";
import FallAlert from "./components/FallAlert";
import GPSMap from "./components/GPSMap";
import TempHumidityCard from "./components/TempHumidityCard";
import FirefighterStatus from "./components/FirefighterStatus";
import LastUpdated from "./components/LastUpdated";
import TempHistoryChart from "./components/TempHistoryChart";

const FIREFIGHTER_UNITS = [
  { id: "firefighter_01", label: "FF-01", role: "Entry Lead" },
  { id: "firefighter_02", label: "FF-02", role: "Search" },
  { id: "firefighter_03", label: "FF-03", role: "Backup" },
  { id: "firefighter_04", label: "FF-04", role: "Ventilation" },
  { id: "firefighter_05", label: "FF-05", role: "Rescue" },
];

const PRIMARY_REAL_UNIT_ID = "firefighter_01";
const REMAINING_VISIBLE_UNIT_IDS = ["firefighter_02", "firefighter_03"];

const STATUS_CLASS_MAP = {
  safe: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
  offline: "bg-slate-100 text-slate-700 border-slate-200",
  unknown: "bg-gray-100 text-gray-700 border-gray-200",
};

function getSeedFromId(id) {
  return String(id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function buildMockRosterSnapshot(unitId, tick) {
  const seed = getSeedFromId(unitId);
  const phase = (seed % 19) * 0.15;

  const temperature = parseFloat((41 + Math.sin(tick * 0.2 + phase) * 4.5 + (Math.random() - 0.5) * 0.6).toFixed(1));
  const gasLevel = Math.max(90, Math.round(210 + Math.sin(tick * 0.24 + phase) * 90 + (Math.random() - 0.5) * 24));
  const fallDetected = (tick + seed) % 31 === 0;

  let status = "safe";
  if (fallDetected || temperature >= 54 || gasLevel >= 450) status = "critical";
  else if (temperature >= 47 || gasLevel >= 320) status = "warning";

  return {
    temperature,
    gasLevel,
    fallDetected,
    status,
    lastUpdated: Math.floor(Date.now() / 1000),
  };
}

// ── Live Clock ────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs sm:text-sm text-gray-600 hidden sm:inline">
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

// ── Mode Toggle Button ────────────────────────────────────────────────────
function ModeToggle({ mode, firebaseOk, onToggle }) {
  const isDemo = mode === "demo";
  const isFailed = firebaseOk === false;

  return (
    <button
      onClick={onToggle}
      title={isDemo ? "Switch to Live Firebase mode" : "Switch to Demo mode (no Firebase needed)"}
      className={`
        flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 flex-shrink-0
        ${isDemo
          ? "bg-violet-500/15 border-violet-500/40 text-violet-300 hover:bg-violet-500/25"
          : isFailed
            ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
        }
      `}
    >
      <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0 ${isDemo ? "bg-violet-400" : isFailed ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`} />
      <span className="hidden sm:inline">{isDemo ? "DEMO" : isFailed ? "ERR" : "LIVE"}</span>
      <span className="opacity-50 hidden sm:inline">·</span>
      <span className="opacity-70 font-normal hidden sm:inline">{isDemo ? "→L" : "→D"}</span>
    </button>
  );
}

// ── Demo Banner ───────────────────────────────────────────────────────────
function DemoBanner({ error, onGoLive }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-violet-100 border-b border-violet-200 text-xs">
      <span className="text-violet-700 font-semibold tracking-wide">🎭 DEMO MODE</span>
      <span className="text-violet-500/70 hidden sm:inline">—</span>
      <span className="text-violet-700/80">
        {error
          ? `Firebase unavailable (${error}). Showing simulated live data.`
          : "Viewing with animated mock data. No Firebase connection required."}
      </span>
      <button
        onClick={onGoLive}
        className="sm:ml-auto px-2 sm:px-3 py-1 rounded-full bg-violet-200 border border-violet-300 text-violet-700 hover:bg-violet-300 transition-colors text-xs flex-shrink-0"
      >
        Connect→
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [activeFirefighterId, setActiveFirefighterId] = useState(PRIMARY_REAL_UNIT_ID);
  const [rosterTick, setRosterTick] = useState(0);
  const { data, loading, error, tempHistory, mode, firebaseOk, toggleMode } =
    useFirefighterData(PRIMARY_REAL_UNIT_ID, "live");

  useEffect(() => {
    const t = setInterval(() => setRosterTick((prev) => prev + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const activeUnit = FIREFIGHTER_UNITS.find((unit) => unit.id === activeFirefighterId) ?? FIREFIGHTER_UNITS[0];
  const isRealDataMode = activeFirefighterId === PRIMARY_REAL_UNIT_ID;
  const displayData = isRealDataMode ? data : buildMockRosterSnapshot(activeFirefighterId, rosterTick);

  const remainingFighters = useMemo(() => {
    return FIREFIGHTER_UNITS
      .filter((unit) => REMAINING_VISIBLE_UNIT_IDS.includes(unit.id))
      .map((unit, index) => ({
        ...unit,
        ...buildMockRosterSnapshot(unit.id, rosterTick + index * 3),
      }));
  }, [rosterTick]);

  const isDemo = mode === "demo";
  const isDeviceOffline = data?.status === "offline";
  const telemetryUnavailable =
    isDeviceOffline &&
    data?.temperature == null &&
    data?.humidity == null &&
    data?.gasLevel == null;

  return (
    <div className="w-screen h-screen bg-[#f5f7fb] text-gray-900 flex flex-col overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif", maxWidth: "100vw" }}>
      <Toaster position="top-right" />

      {/* ── TOP BAR ── */}
      <header className="flex flex-wrap items-center justify-between px-2 sm:px-4 py-2 border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm gap-2 sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-sm sm:text-lg flex-shrink-0">🔥</div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight truncate">FireFighter Safety Device</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          {data && <LastUpdated lastUpdated={data.lastUpdated} />}

          {/* FF-01 Badge */}
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gray-100 border border-gray-300 hidden sm:flex">
            <span className="text-xs text-gray-600">Unit:</span>
            <span className="text-xs font-bold text-orange-400">{activeUnit.label}</span>
          </div>

          {/* Mode Toggle */}
          <ModeToggle mode={mode} firebaseOk={firebaseOk} onToggle={toggleMode} />

          {/* Live / Demo indicator */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isDemo ? "bg-violet-400" : "bg-emerald-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isDemo ? "bg-violet-500" : "bg-emerald-500"
                }`}
              />
            </span>
            <span
              className={`text-xs font-bold tracking-widest hidden sm:inline ${
                isDemo ? "text-violet-400" : "text-emerald-400"
              }`}
            >
              {isDemo ? "DEMO" : "LIVE"}
            </span>
            <LiveClock />
          </div>
        </div>
      </header>

      {/* ── DEMO BANNER ── */}
      {isDemo && <DemoBanner error={error} onGoLive={toggleMode} />}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full p-1 sm:p-2 flex flex-col gap-1 sm:gap-2 overflow-y-auto overflow-x-hidden">

        {/* Unit Access */}
        <section className="rounded-xl border border-gray-200 bg-white p-2 sm:p-3 w-full flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Squad Access</h2>
            <span className="text-[11px] text-gray-500">{FIREFIGHTER_UNITS.length} Units</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {FIREFIGHTER_UNITS.map((unit, index) => {
              const isRealUnit = unit.id === PRIMARY_REAL_UNIT_ID;
              const preview = isRealUnit
                ? {
                    status: data?.status ?? "unknown",
                    temperature: data?.temperature,
                  }
                : buildMockRosterSnapshot(unit.id, rosterTick + index * 2);

              const isActive = unit.id === activeFirefighterId;
              return (
                <button
                  key={unit.id}
                  onClick={() => setActiveFirefighterId(unit.id)}
                  className={`rounded-lg border px-2 py-2 text-left transition-all cursor-pointer ${
                    isActive
                      ? "border-orange-300 bg-orange-50 shadow-md ring-2 ring-orange-200"
                      : isRealUnit
                        ? "border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
                        : "border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">{unit.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                        STATUS_CLASS_MAP[preview.status] ?? STATUS_CLASS_MAP.unknown
                      }`}
                    >
                      {String(preview.status || "unknown").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">{unit.role}</p>
                  <p className="text-[11px] mt-1 text-gray-700">
                    {preview.temperature != null ? `${preview.temperature}°C` : "No telemetry"}
                    {!isRealUnit && <span className="text-gray-400"> · mock</span>}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center flex-1 w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-orange-500/40 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-gray-500 text-xs sm:text-sm text-center px-2">
                {mode === "live" ? "Connecting to Firebase…" : "Loading demo data…"}
              </p>
            </div>
          </div>
        )}

        {!loading && displayData && (
          <>
            {/* ── ROW 1: Status Cards ── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 w-full flex-shrink-0">
              {/* Temperature card */}
              <TempHumidityCard
                temperature={displayData.temperature}
                humidity={displayData.humidity}
                isOffline={telemetryUnavailable}
              />

              {/* MQ-2 Gas level */}
              <StatusCard
                icon="🧪"
                label="MQ-2 Gas"
                value={displayData.gasLevel}
                unit="ppm"
                color={telemetryUnavailable ? "blue" : displayData.gasLevel >= 450 ? "red" : displayData.gasLevel >= 320 ? "orange" : "green"}
                sublabel={
                  telemetryUnavailable
                    ? "Sensor offline"
                    : isDeviceOffline
                      ? "Showing last known reading"
                      : displayData.gasLevel >= 450
                        ? "Critical gas concentration"
                        : displayData.gasLevel >= 320
                          ? "Elevated gas levels"
                          : "Air quality stable"
                }
              />

              {/* Status */}
              <FirefighterStatus status={displayData.status} />

              {/* Fall detection */}
              <FallAlert fallDetected={Boolean(displayData.fallDetected)} />
            </section>

            {/* ── ROW 2: GPS Map + Temperature Chart (Side by Side) ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-2 w-full flex-1 min-h-0">
              {/* GPS Map */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden w-full h-full">
                {isRealDataMode ? (
                  <GPSMap gps={displayData.gps} gpsFallback={displayData.gpsFallback} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Mock {activeUnit.label}</p>
                      <p className="text-xs text-blue-700">Simulated GPS data</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Temperature History Chart */}
              <div className="rounded-xl border border-gray-200 bg-white p-1 sm:p-2 flex flex-col w-full h-full">
                <div className="flex items-center justify-between mb-0.5 sm:mb-1 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm sm:text-base">📈</span>
                    <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Temp</h2>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-0.5 sm:w-1.5 bg-emerald-500 inline-block" />
                      <span className="text-gray-600 hidden sm:inline">Safe</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-0.5 sm:w-1.5 bg-orange-500 inline-block" />
                      <span className="text-gray-600 hidden sm:inline">Warn</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-0.5 sm:w-1.5 bg-red-500 inline-block" />
                      <span className="text-gray-600 hidden sm:inline">Crit</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-h-0 w-full">
                  <TempHistoryChart
                    data={isRealDataMode ? tempHistory : []}
                    emptyMessage={isRealDataMode ? (telemetryUnavailable ? "N/A (Device offline)" : "Waiting for temperature data...") : `Mock data for ${activeUnit.label}`}
                  />
                </div>
              </div>
            </section>

            {/* ── BOTTOM: Device Info Bar ── */}
            <section className="relative rounded-xl border border-gray-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 flex flex-wrap items-center gap-1 sm:gap-3 text-xs w-full flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 hidden sm:inline">Device:</span>
                <span className="font-mono text-orange-400 text-xs">ESP32</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 hidden sm:inline">Mode:</span>
                <span className="text-gray-700 text-xs">{isDemo ? "Demo" : "Live"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 hidden sm:inline">Active Unit:</span>
                <span className="font-semibold text-gray-700 text-xs">{activeUnit.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 hidden sm:inline">GPS:</span>
                <span className="font-mono text-gray-700 text-xs truncate">{displayData.gps?.lat?.toFixed(2)}, {displayData.gps?.lng?.toFixed(2)}</span>
              </div>

              <a
                href="https://github.com/Rsmk27/A-Hacks_Power-pulse"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:block absolute left-1/2 -translate-x-1/2 text-[11px] font-bold text-gray-600 hover:text-orange-500 transition-colors"
              >
                © Power Pulse Team · A-Hacks Hackathon
              </a>

              <a
                href="https://github.com/Rsmk27/A-Hacks_Power-pulse"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:hidden text-center text-[11px] font-bold text-gray-600 hover:text-orange-500 transition-colors"
              >
                © Power Pulse Team · A-Hacks Hackathon
              </a>

              <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                {!isRealDataMode && <span className="text-blue-500 font-semibold text-xs">MOCK</span>}
                <span className="text-orange-400 font-semibold text-xs">A-Hacks</span>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
