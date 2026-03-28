import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useFirefighterData } from "./hooks/useFirefighterData";
import StatusCard from "./components/StatusCard";
import FallAlert from "./components/FallAlert";
import GPSMap from "./components/GPSMap";
import TempHumidityCard from "./components/TempHumidityCard";
import FirefighterStatus from "./components/FirefighterStatus";
import LastUpdated from "./components/LastUpdated";
import TempHistoryChart from "./components/TempHistoryChart";

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
  const { data, loading, error, tempHistory, mode, firebaseOk, toggleMode } =
    useFirefighterData("firefighter_01", "live");

  const isDemo = mode === "demo";

  return (
    <div className="w-screen h-screen bg-[#f5f7fb] text-gray-900 flex flex-col overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif", maxWidth: "100vw" }}>
      <Toaster position="top-right" />

      {/* ── TOP BAR ── */}
      <header className="flex flex-wrap items-center justify-between px-2 sm:px-4 py-2 border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm gap-2 sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-sm sm:text-lg flex-shrink-0">🔥</div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight truncate">Firefighter Safety</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          {data && <LastUpdated lastUpdated={data.lastUpdated} />}

          {/* FF-01 Badge */}
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gray-100 border border-gray-300 hidden sm:flex">
            <span className="text-xs text-gray-600">Unit:</span>
            <span className="text-xs font-bold text-orange-400">FF-01</span>
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
      <main className="flex-1 w-full p-1 sm:p-2 flex flex-col gap-1 sm:gap-2 overflow-hidden">

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

        {!loading && data && (
          <>
            {/* ── ROW 1: Status Cards ── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 w-full">
              {/* Temperature card */}
              <TempHumidityCard temperature={data.temperature} humidity={data.humidity} />

              {/* MQ-2 Gas level */}
              <StatusCard
                icon="🧪"
                label="MQ-2 Gas"
                value={data.gasLevel}
                unit="ppm"
                color={data.gasLevel >= 450 ? "red" : data.gasLevel >= 320 ? "orange" : "green"}
                sublabel={data.gasLevel >= 450 ? "Critical gas concentration" : data.gasLevel >= 320 ? "Elevated gas levels" : "Air quality stable"}
              />

              {/* Status */}
              <FirefighterStatus status={data.status} />

              {/* Fall detection */}
              <FallAlert fallDetected={data.fallDetected} />
            </section>

            {/* ── ROW 2: GPS Map + Temperature Chart (Side by Side) ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-2 w-full flex-1 min-h-0">
              {/* GPS Map */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden w-full min-h-[140px] sm:min-h-[160px]">
                <GPSMap gps={data.gps} gpsFallback={data.gpsFallback} />
              </div>

              {/* Temperature History Chart */}
              <div className="rounded-xl border border-gray-200 bg-white p-1 sm:p-2 flex flex-col w-full min-h-[140px] sm:min-h-[160px]">
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
                  <TempHistoryChart data={tempHistory} />
                </div>
              </div>
            </section>

            {/* ── BOTTOM: Device Info Bar ── */}
            <section className="rounded-xl border border-gray-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 flex flex-wrap items-center gap-1 sm:gap-3 text-xs w-full">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 hidden sm:inline">Device:</span>
                <span className="font-mono text-orange-400 text-xs">ESP32</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 hidden sm:inline">Mode:</span>
                <span className="text-gray-700 text-xs">{isDemo ? "Demo" : "Live"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 hidden sm:inline">GPS:</span>
                <span className="font-mono text-gray-700 text-xs truncate">{data.gps?.lat?.toFixed(2)}, {data.gps?.lng?.toFixed(2)}</span>
              </div>
              <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                <span className="text-orange-400 font-semibold text-xs">A-Hacks</span>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
