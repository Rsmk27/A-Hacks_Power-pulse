import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Fix default marker icon issue with Vite/webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom fire emoji marker
const fireIcon = L.divIcon({
  html: `<div style="
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 0 8px #FF4500);
    animation: pulse 1.5s infinite;
  ">🔥</div>`,
  className: "fire-marker",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Component to auto-pan map to latest position
function PanToLocation({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

const DEFAULT_CENTER = [16.5062, 80.648];

export default function GPSMap({ gps }) {
  const lat = gps?.lat ?? DEFAULT_CENTER[0];
  const lng = gps?.lng ?? DEFAULT_CENTER[1];

  return (
    <div className="rounded-2xl border border-gray-800 bg-[#111111] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Live GPS Tracking</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>LAT: <span className="text-emerald-400 font-mono">{lat.toFixed(4)}</span></span>
          <span>LNG: <span className="text-emerald-400 font-mono">{lng.toFixed(4)}</span></span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <Marker position={[lat, lng]} icon={fireIcon}>
            <Popup className="fire-popup">
              <div style={{ fontFamily: "Space Grotesk, sans-serif", minWidth: 150 }}>
                <strong>🔥 Firefighter 01</strong>
                <br />
                <small>Lat: {lat.toFixed(6)}</small>
                <br />
                <small>Lng: {lng.toFixed(6)}</small>
              </div>
            </Popup>
          </Marker>
          <PanToLocation lat={lat} lng={lng} />
        </MapContainer>
      </div>
    </div>
  );
}
