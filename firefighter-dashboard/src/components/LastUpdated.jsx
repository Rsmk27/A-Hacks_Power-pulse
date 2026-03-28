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
    <div className={`flex items-center gap-2 text-xs ${isStale ? "text-red-600" : "text-gray-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isStale ? "bg-red-500 animate-pulse" : "bg-gray-400"}`} />
      {secondsAgo === null ? (
        <span>No data received</span>
      ) : isStale ? (
        <span className="font-medium">⚠ Device may be offline — Last seen {secondsAgo}s ago</span>
      ) : (
        <span>Last updated: {secondsAgo}s ago</span>
      )}
    </div>
  );
}
