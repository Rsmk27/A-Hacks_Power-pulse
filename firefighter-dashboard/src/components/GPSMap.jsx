import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

const DEFAULT_CENTER = [16.5062, 80.648];
const OPEN_3D_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
      maxzoom: 19,
    },
    terrain: {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      tileSize: 256,
      encoding: "terrarium",
      maxzoom: 14,
    },
  },
  layers: [
    {
      id: "osm-base",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
  terrain: {
    source: "terrain",
    exaggeration: 1.2,
  },
};

export default function GPSMap({ gps }) {
  const lat = gps?.lat ?? DEFAULT_CENTER[0];
  const lng = gps?.lng ?? DEFAULT_CENTER[1];
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPEN_3D_STYLE,
      center: [lng, lat],
      zoom: 15,
      pitch: 60,
      bearing: -20,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      setMapError(false);
      map.resize();
    });

    map.on("error", () => {
      setMapError(true);
    });

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    const markerElement = document.createElement("div");
    markerElement.className = "fire-marker-3d";
    markerElement.textContent = "🔥";

    const popup = new maplibregl.Popup({ offset: 24 }).setHTML(
      `<div style="font-family: Space Grotesk, sans-serif; min-width: 160px; color: #111827;">
        <strong>🔥 Firefighter 01</strong><br/>
        <small>Lat: ${lat.toFixed(6)}</small><br/>
        <small>Lng: ${lng.toFixed(6)}</small>
      </div>`
    );

    markerRef.current = new maplibregl.Marker({ element: markerElement, anchor: "bottom" })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    mapRef.current = map;

    return () => {
      window.removeEventListener("resize", handleResize);
      markerRef.current?.remove();
      mapRef.current?.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [lat, lng]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.setLngLat([lng, lat]);
    mapRef.current.easeTo({ center: [lng, lat], duration: 1000 });
  }, [lat, lng]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Live GPS Tracking</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span>LAT: <span className="text-emerald-600 font-mono">{lat.toFixed(4)}</span></span>
          <span>LNG: <span className="text-emerald-600 font-mono">{lng.toFixed(4)}</span></span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <div ref={mapContainerRef} className="w-full h-full" aria-label="3D open-source map" />
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/85 text-gray-700 text-sm font-medium">
            Map tiles are loading slowly. Please check internet and retry.
          </div>
        )}
      </div>
    </div>
  );
}
