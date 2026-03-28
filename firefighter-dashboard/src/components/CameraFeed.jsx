import { useState } from "react";

const STREAM_URL = import.meta.env.VITE_CAM_STREAM_URL || "http://192.168.1.100/stream";

export default function CameraFeed() {
  const [offline, setOffline] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-800 bg-[#111111] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">📷</span>
          <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Camera Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          {!offline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400">LIVE CAM</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              <span className="text-xs text-gray-600">OFFLINE</span>
            </>
          )}
        </div>
      </div>

      {/* Feed area */}
      <div className="flex-1 min-h-0 relative bg-black flex items-center justify-center">
        {offline ? (
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-3xl">📷</span>
            </div>
            <div>
              <p className="text-gray-400 font-semibold">Camera Offline</p>
              <p className="text-xs text-gray-600 mt-1">Check ESP32-CAM connection</p>
              <p className="text-xs text-gray-700 mt-1 font-mono">{STREAM_URL}</p>
            </div>
            <button
              onClick={() => setOffline(false)}
              className="px-4 py-1.5 text-xs font-medium text-orange-400 border border-orange-400/40 rounded-lg hover:bg-orange-400/10 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <img
            src={STREAM_URL}
            alt="Live ESP32-CAM feed"
            className="w-full h-full object-cover"
            onError={() => setOffline(true)}
            style={{ display: "block" }}
          />
        )}

        {/* Corner overlay */}
        {!offline && (
          <>
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-500/60" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-500/60" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-red-500/60" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-red-500/60" />
          </>
        )}
      </div>
    </div>
  );
}
