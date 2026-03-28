import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

const DEFAULT_CENTER = [16.508981286911585, 80.65806564630255];
const OPEN_VECTOR_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const RASTER_FALLBACK_STYLE = {
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

function getMarkerHTML(hasLiveGps) {
  const title = hasLiveGps ? "Firefighter 01" : "Default Location";
  const emoji = "🔥";
  const rootClass = hasLiveGps ? "ff-marker-root ff-marker-live" : "ff-marker-root ff-marker-default";

  return `
    <div class="${rootClass}" title="${title}">
      <div class="ff-marker-core">${emoji}</div>
      <div class="ff-marker-tail"></div>
      <div class="ff-marker-label">${title}</div>
    </div>
  `;
}

export default function GPSMap({ gps, gpsFallback = false }) {
  const hasLiveGps = !gpsFallback && gps?.lat != null && gps?.lng != null;
  const lat = gps?.lat ?? DEFAULT_CENTER[0];
  const lng = gps?.lng ?? DEFAULT_CENTER[1];
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const popupRef = useRef(null);
  const hasFallbackRef = useRef(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPEN_VECTOR_STYLE_URL,
      center: [lng, lat],
      zoom: 15,
      pitch: 62,
      bearing: -20,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      setMapError(false);
      hasFallbackRef.current = false;

      // Force 3D building visibility for vector styles that expose building footprints.
      const has3DBuildingLayer = !!map.getLayer("building-3d");
      if (has3DBuildingLayer) {
        map.setLayoutProperty("building-3d", "visibility", "visible");
      } else {
        const style = map.getStyle();
        const vectorSourceName = Object.keys(style?.sources || {}).find(
          (sourceName) => style.sources[sourceName]?.type === "vector"
        );
        const symbolLayerId = style?.layers?.find((layer) => layer.type === "symbol")?.id;

        if (vectorSourceName && !map.getLayer("firefighter-buildings-3d")) {
          map.addLayer(
            {
              id: "firefighter-buildings-3d",
              source: vectorSourceName,
              "source-layer": "building",
              type: "fill-extrusion",
              minzoom: 14,
              paint: {
                "fill-extrusion-color": "#cbd5e1",
                "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 12],
                "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
                "fill-extrusion-opacity": 0.72,
              },
            },
            symbolLayerId
          );
        }
      }

      map.resize();
    });

    map.on("error", () => {
      // If vector style fails (network/CORS), fallback once to raster so map still loads.
      if (!hasFallbackRef.current) {
        hasFallbackRef.current = true;
        try {
          map.setStyle(RASTER_FALLBACK_STYLE);
          return;
        } catch (e) {
          console.warn("Failed to switch map fallback style", e);
        }
      }
      setMapError(true);
    });

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    const markerElement = document.createElement("div");
    markerElement.className = "ff-marker-host";
    markerElement.innerHTML = getMarkerHTML(hasLiveGps);

    const popup = new maplibregl.Popup({ offset: 24 });
    popupRef.current = popup;

    popup.setHTML(
      `<div style="font-family: Space Grotesk, sans-serif; min-width: 180px; color: #111827;">
        <strong>${hasLiveGps ? "🔥 Firefighter 01" : "📍 Default Location"}</strong><br/>
        <small>Lat: ${lat.toFixed(6)}</small><br/>
        <small>Lng: ${lng.toFixed(6)}</small><br/>
        <small style="color:#6b7280;">${hasLiveGps ? "Live device GPS" : "Using fallback coordinates"}</small>
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
      popupRef.current = null;
      mapRef.current = null;
    };
  }, [lat, lng, hasLiveGps]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !popupRef.current) return;

    const markerElement = markerRef.current.getElement();
    markerElement.className = "ff-marker-host";
    markerElement.innerHTML = getMarkerHTML(hasLiveGps);
    markerRef.current.setLngLat([lng, lat]);
    popupRef.current.setHTML(
      `<div style="font-family: Space Grotesk, sans-serif; min-width: 180px; color: #111827;">
        <strong>${hasLiveGps ? "🔥 Firefighter 01" : "📍 Default Location"}</strong><br/>
        <small>Lat: ${lat.toFixed(6)}</small><br/>
        <small>Lng: ${lng.toFixed(6)}</small><br/>
        <small style="color:#6b7280;">${hasLiveGps ? "Live device GPS" : "Using fallback coordinates"}</small>
      </div>`
    );
    mapRef.current.easeTo({ center: [lng, lat], duration: 1000 });
  }, [lat, lng, hasLiveGps]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Live GPS Tracking</span>
          {!hasLiveGps && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
              DEFAULT PIN
            </span>
          )}
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
