import { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { useFirefighterData } from "./hooks/useFirefighterData";
import StatusCard from "./components/StatusCard";
import FallAlert from "./components/FallAlert";
import GPSMap from "./components/GPSMap";
import TempHumidityCard from "./components/TempHumidityCard";
import FirefighterStatus from "./components/FirefighterStatus";
import LastUpdated from "./components/LastUpdated";
import TempHistoryChart from "./components/TempHistoryChart";

// Removed: VitalSignsCard, CameraFeedCard, CommandControlCard

// ── Live Clock ────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs sm:text-sm text-slate-600 hidden sm:inline tracking-widest pl-2">
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
        flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm border text-xs font-semibold uppercase tracking-widest transition-all duration-300 flex-shrink-0
        ${isDemo
          ? "bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-500/20"
          : isFailed
            ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
        }
      `}
    >
      <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-none flex-shrink-0 ${isDemo ? "bg-fuchsia-400" : isFailed ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`} />
      <span className="hidden sm:inline">{isDemo ? "SIMULATION" : isFailed ? "ERR" : "LIVE UPLINK"}</span>
    </button>
  );
}

// ── Demo Banner ───────────────────────────────────────────────────────────
function DemoBanner({ error, onGoLive }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-fuchsia-950/40 border-b border-fuchsia-500/30 text-xs">
      <span className="text-fuchsia-400 font-bold tracking-widest uppercase flex items-center gap-2">
        <span className="animate-pulse w-2 h-2 bg-fuchsia-500 inline-block rounded-full"></span>
        SIMULATION MODE
      </span>
      <span className="text-fuchsia-500/70 hidden sm:inline">—</span>
      <span className="text-fuchsia-300/80 font-mono tracking-wide">
        {error
          ? `UPLINK FAILURE (${error}). RUNNING LOCAL MOCK PARAMETERS.`
          : "SYSTEM RUNNING IN ISOLATED FIREFIGHTER MOCK DEMO CUBE."}
      </span>
      <button
        onClick={onGoLive}
        className="sm:ml-auto px-4 py-1.5 rounded-sm bg-fuchsia-500/10 border border-fuchsia-300/50 text-fuchsia-300 hover:bg-fuchsia-500/20 transition-colors uppercase font-bold tracking-widest text-xs flex-shrink-0 shadow-[0_0_10px_rgba(217,70,239,0.3)]"
      >
        INITIATE UPLINK
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [selectedFF, setSelectedFF] = useState("firefighter_01");
  const unitNames = {
    firefighter_01: "FF-ALPHA",
    firefighter_02: "FF-BRAVO",
    firefighter_03: "FF-CHARLIE",
  };
  const unitName = unitNames[selectedFF] || "UNKNOWN UNIT";

  const { data, loading: dataLoading, error, tempHistory, mode, firebaseOk, toggleMode } =
    useFirefighterData(selectedFF, "live");

  const [showOverlay, setShowOverlay] = useState(true);
  const [fadeExit, setFadeExit] = useState(false);
  const [progress, setProgress] = useState(0);
  const gateOpenRef = useRef(false);

  useEffect(() => {
    // Progress counter simulation
    const interval = setInterval(() => {
      setProgress(prev => (prev < 99 ? prev + Math.floor(Math.random() * 5) + 1 : 99));
    }, 100);

    // Initial 3s wait gate
    const timer = setTimeout(() => {
      gateOpenRef.current = true;
      // If data is ready by now, start exit sequence
      if (!dataLoading) {
        setFadeExit(true);
        setTimeout(() => setShowOverlay(false), 1000);
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [dataLoading]);

  // Handle data-ready if it arrives AFTER the 3s window
  useEffect(() => {
    if (!dataLoading && gateOpenRef.current && !fadeExit) {
       setFadeExit(true);
       setTimeout(() => setShowOverlay(false), 1000);
    }
  }, [dataLoading]);

  // We redefined isLoading slightly to handle the initial 3s window locally
  // but we can just use showOverlay for the actual mounting
  const isDemo = mode === "demo";

  return (
    <div className="w-screen h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans relative" style={{ maxWidth: "100vw" }}>
      <Toaster position="top-right" />

      {/* ── PROFESSIONAL LOADING OVERLAY ── */}
      {showOverlay && (
        <div 
          className={`fixed inset-0 z-[999] bg-slate-50 flex flex-col items-center justify-center transition-all duration-1000 ${fadeExit ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}
        >
          {/* Tactical Background Elements (Bright Mode) */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: "linear-gradient(rgba(14, 165, 233, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 via-transparent to-slate-100/50 opacity-40" />
          
          <div className="relative flex flex-col items-center gap-10 scale-90 sm:scale-100">
            {/* Logo Core */}
            <div className="relative group">
              {/* Outer Scanning Rings (Refined for Brightness) */}
              <div className="absolute inset-[-40px] border border-slate-300/60 rounded-full animate-[spin_12s_linear_infinite]" />
              <div className="absolute inset-[-20px] border-2 border-t-orange-500/60 border-r-transparent border-b-sky-500/60 border-l-transparent rounded-full animate-spin" />
              
              <div className="relative z-10 w-52 h-52 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.12)] bg-white flex items-center justify-center">
                <img 
                  src="/loading_logo.jpg" 
                  alt="FFSD Final Logo" 
                  className="w-full h-full object-cover animate-pulse duration-[3000ms]" 
                />
              </div>

              {/* Scanning Line Effect (Modern Blue) */}
              <div className="absolute top-0 left-0 w-full h-1 bg-sky-500/20 blur-[2px] animate-[scan_2.5s_ease-in-out_infinite]" />
            </div>

            {/* Loading Status HUD (Bright Typography) */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center">
                <p className="text-slate-800 text-[10px] sm:text-xs tracking-[0.5em] font-mono font-black uppercase mb-2">
                  FFSD DASHBOARD INITIALIZING
                </p>
                <div className="h-[3px] w-56 bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                   <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-300 relative" 
                    style={{ width: `${progress}%` }} 
                  >
                    <div className="absolute right-0 top-0 h-full w-2 bg-white/50 blur-[2px]" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-10 font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  CORE_LINK
                </span>
                <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-black w-14 text-center">{progress}%</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  SAT_LINK
                </span>
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes scan {
              0% { top: 15%; opacity: 0; }
              50% { opacity: 1; }
              100% { top: 85%; opacity: 0; }
            }
          `}} />
        </div>
      )}

      {/* ── TOP BAR (TACTICAL HEADER) ── */}
      <header className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-300 bg-white/90 sticky top-0 z-50 backdrop-blur-md gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-600/20 border border-red-500/50 flex items-center justify-center text-lg flex-shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.4)] relative">
            🚨
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] drop-shadow-sm">Fire Fighter Safety Device</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {data && <LastUpdated lastUpdated={data.lastUpdated} />}

          {/* Unit Switcher */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-slate-100 border border-orange-500/40 hidden sm:flex shadow-[0_0_10px_rgba(249,115,22,0.1)] focus-within:border-orange-500 transition-colors cursor-pointer group">
            <span className="text-[10px] text-slate-600 font-mono uppercase">Assigned Unit:</span>
            <select
              value={selectedFF}
              onChange={(e) => setSelectedFF(e.target.value)}
              className="bg-transparent text-xs font-black text-orange-600 tracking-wider outline-none cursor-pointer appearance-none pr-1"
            >
              <option value="firefighter_01" className="bg-white text-orange-600">FF-ALPHA</option>
              <option value="firefighter_02" className="bg-white text-orange-600">FF-BRAVO</option>
              <option value="firefighter_03" className="bg-white text-orange-600">FF-CHARLIE</option>
            </select>
            <span className="text-orange-500/80 text-xs pointer-events-none group-hover:text-orange-500 transition-colors">▼</span>
          </div>

          <ModeToggle mode={mode} firebaseOk={firebaseOk} onToggle={toggleMode} />

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-3 border-l border-slate-300 pl-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-sm opacity-75 ${
                    isDemo ? "bg-fuchsia-400" : "bg-emerald-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-sm h-2 w-2 ${
                    isDemo ? "bg-fuchsia-500" : "bg-emerald-500"
                  }`}
                />
              </span>
              <span
                className={`text-[10px] font-black tracking-[0.2em] hidden sm:inline ${
                  isDemo ? "text-fuchsia-400" : "text-emerald-400"
                }`}
              >
                {data?.connectionStatus || "SYS_READY"}
              </span>
            </div>
            <LiveClock />
          </div>
        </div>
      </header>

      {/* ── DEMO BANNER ── */}
      {isDemo && <DemoBanner error={error} onGoLive={toggleMode} />}

      {/* ── MAIN CONTENT (SINGLE-PAGE MISSION CONTROL) ── */}
      <main className="flex-1 w-full p-3 sm:px-5 sm:pb-3 flex flex-col gap-3 min-h-0">
        {!showOverlay && data && (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            {/* ROW 1: MISSION PARAMETERS (Top Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0">
              
              {/* Column 1: Env Sensors */}
              <div className="flex flex-col gap-3">
                <TempHumidityCard temperature={data.temperature} humidity={data.humidity} />
              </div>

              {/* Column 2: Critical Status */}
              <div className="flex flex-col gap-3">
                <StatusCard
                  icon="🔬"
                  label="Air Toxicity"
                  value={data.gasLevel}
                  unit="ppm"
                  color={data.gasLevel >= 450 ? "red" : data.gasLevel >= 320 ? "orange" : "green"}
                  sublabel={data.gasLevel >= 450 ? "CRITICAL: TOXIC" : data.gasLevel >= 320 ? "ELEVATED: RESPIRATOR" : "NORMAL"}
                />
              </div>

              {/* Column 3: Fall Alert Array */}
              <div className="flex flex-col gap-3">
                <FallAlert fallDetected={data.fallDetected} />
              </div>

            </div>

            {/* ROW 2: TACTICAL ARRAY (Chart & Map) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1 min-h-0 pb-1">
              <div className="md:col-span-1 flex flex-col gap-3 h-full">
                <div className="flex-1 min-h-0">
                  <FirefighterStatus status={data.status} />
                </div>
                <div className="rounded-xl border border-slate-300 bg-white/95 p-3 shadow-sm backdrop-blur-md flex-1 min-h-0 flex flex-col hover:border-slate-400 transition-colors">
                  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 border-b border-slate-200 pb-1 flex justify-between items-center">
                    <span>Temp History</span>
                  </h2>
                  <div className="flex-1 w-full relative">
                    <TempHistoryChart data={tempHistory} />
                  </div>
                </div>
              </div>

              {/* GPS TACTICAL MAP (Large area) */}
              <div className="md:col-span-3 h-full relative group">
                <div className="rounded-xl border border-slate-300 bg-white/95 shadow-md backdrop-blur-md overflow-hidden h-full flex flex-col relative">
                  <div className="absolute top-3 left-4 z-10 flex items-center gap-2 pointer-events-none">
                     <span className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full"></span>
                     <span className="text-[9px] font-mono tracking-widest text-slate-800 font-bold bg-white/80 px-2 rounded-sm border border-slate-200">TACTICAL_GRID [ACTIVE]</span>
                  </div>
                  <GPSMap gps={data.gps} gpsFallback={data.gpsFallback} unitName={unitName} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
