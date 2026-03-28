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
    <span className="font-mono text-sm text-gray-400">
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
        flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300
        ${isDemo
          ? "bg-violet-500/15 border-violet-500/40 text-violet-300 hover:bg-violet-500/25"
          : isFailed
            ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
        }
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isDemo ? "bg-violet-400" : isFailed ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`} />
      {isDemo ? "DEMO MODE" : isFailed ? "FIREBASE ERR" : "LIVE"}
      <span className="opacity-50">·</span>
      <span className="opacity-70 font-normal">{isDemo ? "→ Live" : "→ Demo"}</span>
    </button>
  );
}

// ── Demo Banner ───────────────────────────────────────────────────────────
function DemoBanner({ error, onGoLive }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 bg-violet-500/10 border-b border-violet-500/20 text-xs">
      <span className="text-violet-300 font-semibold tracking-wide">🎭 DEMO MODE</span>
      <span className="text-violet-400/70">—</span>
      <span className="text-violet-300/70">
        {error
          ? `Firebase unavailable (${error}). Showing simulated live data.`
          : "Viewing with animated mock data. No Firebase connection required."}
      </span>
      <button
        onClick={onGoLive}
        className="ml-auto px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-colors"
      >
        Connect to Firebase →
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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Toaster position="top-right" />

      {/* ── TOP BAR ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-[#0d0d0d] sticky top-0 z-50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-lg">🔥</div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Firefighter Safety Device</h1>
            <p className="text-xs text-gray-600">Command &amp; Control Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {data && <LastUpdated lastUpdated={data.lastUpdated} />}

          {/* FF-01 Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/60 border border-gray-700">
            <span className="text-xs text-gray-400">Unit:</span>
            <span className="text-xs font-bold text-orange-400">FF-01</span>
          </div>

          {/* Mode Toggle */}
          <ModeToggle mode={mode} firebaseOk={firebaseOk} onToggle={toggleMode} />

          {/* Live / Demo indicator */}
          <div className="flex items-center gap-2">
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
              className={`text-xs font-bold tracking-widest ${
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
      <main className="flex-1 p-5 flex flex-col gap-5">

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-orange-500/40 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">
                {mode === "live" ? "Connecting to Firebase…" : "Loading demo data…"}
              </p>
            </div>
          </div>
        )}

        {!loading && data && (
          <>
            {/* ── ROW 1: Status Cards ── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

            {/* ── ROW 2: GPS Map ── */}
            <section style={{ height: "380px" }}>
              <GPSMap gps={data.gps} />
            </section>

            {/* ── ROW 3: Temperature History Chart ── */}
            <section className="rounded-2xl border border-gray-800 bg-[#111111] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📈</span>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Temperature History</h2>
                    <p className="text-xs text-gray-600">
                      Last {tempHistory.length} readings —{" "}
                      {isDemo ? (
                        <span className="text-violet-400/70">simulated</span>
                      ) : (
                        "real-time"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
                    <span className="text-gray-500">Safe &lt;45°C</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-orange-500 inline-block" />
                    <span className="text-gray-500">Warn 45–60°C</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-red-500 inline-block" />
                    <span className="text-gray-500">Crit &gt;60°C</span>
                  </div>
                </div>
              </div>
              <div style={{ height: "220px" }}>
                <TempHistoryChart data={tempHistory} />
              </div>
            </section>

            {/* ── BOTTOM: Device Info Bar ── */}
            <section className="rounded-xl border border-gray-800/50 bg-[#0d0d0d] px-5 py-3 flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Device:</span>
                <span className="font-mono text-orange-400">ESP32 FireSafe v1.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Protocol:</span>
                <span className="text-gray-400">
                  {isDemo ? "Demo Mode — Simulated Data" : "Firebase RTDB • WebSocket"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">GPS:</span>
                <span className="font-mono text-gray-400">
                  {data.gps?.lat?.toFixed(6)}, {data.gps?.lng?.toFixed(6)}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-gray-600">Hackathon Demo</span>
                <span className="text-gray-700">•</span>
                <span className="text-orange-400 font-semibold">A-Hacks Power Pulse</span>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
