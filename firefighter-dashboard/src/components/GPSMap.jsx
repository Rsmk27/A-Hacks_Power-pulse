import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

const DEFAULT_CENTER = [16.508981286911585, 80.65806564630255];
const SATELLITE_STYLE = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "&copy; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community",
      maxzoom: 19,
    },
    labels: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 19,
    }
  },
  layers: [
    {
      id: "satellite-base",
      type: "raster",
      source: "satellite",
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: "labels-overlay",
      type: "raster",
      source: "labels",
      minzoom: 0,
      maxzoom: 22,
    }
  ],
};

function getMarkerHTML(hasLiveGps, unitName) {
  const title = unitName;
  const rootClass = hasLiveGps ? "ff-marker-root ff-marker-live" : "ff-marker-root ff-marker-default";

  return `
    <div class="${rootClass}">
      <div class="ff-marker-core">
        <img src="/firefighter_marker.png" alt="FF" class="w-full h-full rounded-full object-cover" />
      </div>
      <div class="ff-marker-tail"></div>
      <div class="ff-marker-label">🔥 ${unitName}</div>
    </div>
  `;
}

export default function GPSMap({ gps, gpsFallback = false, unitName = "FF-ALPHA" }) {
  const hasLiveGps = !gpsFallback && gps?.lat != null && gps?.lng != null;
  const lat = gps?.lat ?? DEFAULT_CENTER[0];
  const lng = gps?.lng ?? DEFAULT_CENTER[1];
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const hasFallbackRef = useRef(false);
  const [mapError, setMapError] = useState(false);
  const [isAutoFollowing, setIsAutoFollowing] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: SATELLITE_STYLE,
      center: [lng, lat],
      zoom: 18,
      pitch: 45,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      setMapError(false);
      map.resize();
    });

    map.on("error", (e) => {
      console.warn("MapLibre GL Error:", e);
      setMapError(true);
    });

    // Detect user interaction so we stop auto-centering
    const disableAutoFollow = () => setIsAutoFollowing(false);
    map.on("dragstart", disableAutoFollow);
    map.on("touchstart", disableAutoFollow);
    map.on("wheel", disableAutoFollow);

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    const markerElement = document.createElement("div");
    markerElement.className = "ff-marker-host";
    markerElement.innerHTML = getMarkerHTML(hasLiveGps, unitName);

    markerRef.current = new maplibregl.Marker({ element: markerElement, anchor: "bottom" })
      .setLngLat([lng, lat])
      .addTo(map);

    mapRef.current = map;

    return () => {
      window.removeEventListener("resize", handleResize);
      markerRef.current?.remove();
      mapRef.current?.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [lat, lng, hasLiveGps, unitName]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLngLat([lng, lat]);
    if (isAutoFollowing) {
      mapRef.current.easeTo({ center: [lng, lat], duration: 1000 });
    }
  }, [lat, lng, hasLiveGps, isAutoFollowing, unitName]);

  const handleRecenter = () => {
    setIsAutoFollowing(true);
    if (mapRef.current) {
      mapRef.current.easeTo({
        center: [lng, lat],
        zoom: 19,
        pitch: 60,
        bearing: -20,
        duration: 1500
      });
    }
  };

  return (
    <>
      <div className="flex-1 min-h-0 relative">
        <div ref={mapContainerRef} className="w-full h-full" aria-label="3D open-source map" />
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/95 text-slate-800 text-xs font-mono tracking-widest border border-red-500/50 font-bold">
            [SYS_ERR: GEOLOCATION TILE SERVER UNAVAILABLE]
          </div>
        )}
      </div>

      <div className="absolute top-3 right-14 z-10 pointer-events-auto">
        <button
          onClick={handleRecenter}
          className={`px-3 py-1.5 bg-white/90 border backdrop-blur text-[10px] font-bold uppercase tracking-widest rounded shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all flex items-center gap-1.5 ${
            isAutoFollowing
              ? "text-sky-600 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
              : "text-slate-600 border-slate-300 hover:text-slate-800 hover:border-slate-500"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isAutoFollowing ? "bg-sky-500 animate-pulse" : "bg-slate-500"}`}></span>
          {isAutoFollowing ? "Following" : "Recenter"}
        </button>
      </div>

      <div className="absolute bottom-3 left-4 z-10 pointer-events-none">
         <div className="bg-white/90 border border-slate-300 backdrop-blur p-2 rounded flex flex-col pointer-events-auto shadow-md">
           <span className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 mb-1 font-bold">Coordinates</span>
           <span className="text-xs font-mono text-emerald-600 font-bold">LAT: {lat.toFixed(5)}</span>
           <span className="text-xs font-mono text-emerald-600 font-bold">LNG: {lng.toFixed(5)}</span>
         </div>
      </div>
    </>
  );
}
