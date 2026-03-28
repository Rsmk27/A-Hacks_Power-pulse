import { useState, useEffect } from "react";

function timeAgo(unixTimestamp) {
  if (!unixTimestamp) return null;
  const now = Math.floor(Date.now() / 1000);
  return now - unixTimestamp;
}

export default function LastUpdated({ lastUpdated }) {
  const [secondsAgo, setSecondsAgo] = useState(timeAgo(lastUpdated));

  useEffect(() => {
    setSecondsAgo(timeAgo(lastUpdated));
    const interval = setInterval(() => {
      setSecondsAgo(timeAgo(lastUpdated));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const isStale = secondsAgo !== null && secondsAgo > 30;

  return (
    <div className={`flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase font-bold ${isStale ? "text-red-600" : "text-slate-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-sm ${isStale ? "bg-red-500 animate-pulse" : "bg-slate-400"}`} />
      {secondsAgo === null ? (
        <span>NO SIGNAL</span>
      ) : isStale ? (
        <span className="font-bold">⚠ SIGNAL LOST [T-MINUS {secondsAgo}S]</span>
      ) : (
        <span>SYNC: T-MINUS {secondsAgo}S</span>
      )}
    </div>
  );
}
