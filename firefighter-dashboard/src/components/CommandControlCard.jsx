import { useState } from "react";

export default function CommandControlCard({ firefighterId, battery, signal }) {
  const [task, setTask] = useState("");
  const [mission, setMission] = useState("Search and clear Sector Alpha");

  const assignTask = () => {
    if (task) {
      setMission(task);
      setTask("");
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md hover:border-slate-600 transition-all flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <span className="text-lg">📟</span> Command Panel
        </h2>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
          UPLINK ACTIVE
        </span>
      </div>

      {/* Unit Status Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col bg-slate-800/40 p-2 rounded border border-slate-700">
          <span className="text-slate-500 uppercase tracking-wider mb-1">Signal strength</span>
          <div className="flex gap-1 items-end mt-1">
            {[1, 2, 3, 4, 5].map((bars) => (
              <div
                key={bars}
                className={`w-2 h-${bars * 1.5 + 2} rounded-sm ${bars <= signal ? "bg-emerald-400" : "bg-slate-700"}`}
              ></div>
            ))}
          </div>
        </div>
        <div className="flex flex-col bg-slate-800/40 p-2 rounded border border-slate-700">
           <span className="text-slate-500 uppercase tracking-wider mb-1">Battery (EXO)</span>
           <div className="flex items-center justify-between">
             <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mr-2">
               <div className={`h-full ${battery < 20 ? "bg-red-500" : "bg-emerald-400"}`} style={{ width: `${battery}%` }} />
             </div>
             <span className="text-slate-300 font-mono">{battery}%</span>
           </div>
        </div>
      </div>

      {/* Mission Tracking */}
      <div className="flex-1 bg-slate-800/30 p-3 rounded-lg border border-slate-700">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold flex items-center justify-between">
          Current Objective
          <span className="text-sky-400 animate-pulse font-mono">EN ROUTE</span>
        </div>
        <p className="text-slate-200 text-sm font-medium border-l-2 border-orange-500 pl-2 py-1 mb-2 tracking-wide">
          {mission}
        </p>
      </div>

      {/* Action panel */}
      <div className="flex gap-2">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="New coordinate/task..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button
           onClick={assignTask}
           className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-1.5 rounded transition-all uppercase tracking-widest active:scale-95 flex-shrink-0 shadow-[0_0_15px_rgba(2,132,199,0.5)]"
        >
          Dispatch
        </button>
      </div>
    </div>
  );
}
