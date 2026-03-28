import { useEffect, useState, useRef, useCallback } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";

// ── Demo data seed ─────────────────────────────────────────────────────────
const BASE_DEMO = {
  temperature: 42.5,
  humidity: 68,
  fallDetected: false,
  gps: { lat: 16.5062, lng: 80.648 },
  status: "safe",
  lastUpdated: Math.floor(Date.now() / 1000),
};

/** Build a richer animated demo data set with a subtle simulation curve */
function buildDemoSnapshot(tick) {
  // Temperature oscillates between 39 – 55 °C and occasionally spikes
  const tempBase = 42 + Math.sin(tick * 0.18) * 4 + Math.sin(tick * 0.07) * 3;
  const temp = parseFloat((tempBase + (Math.random() - 0.5) * 0.8).toFixed(1));

  const humidity = parseFloat((68 + Math.sin(tick * 0.12) * 6 + (Math.random() - 0.5) * 2).toFixed(1));

  // GPS drifts very slightly to simulate movement
  const lat = parseFloat((BASE_DEMO.gps.lat + Math.sin(tick * 0.05) * 0.0003).toFixed(6));
  const lng = parseFloat((BASE_DEMO.gps.lng + Math.cos(tick * 0.05) * 0.0003).toFixed(6));

  // Status escalates when temp is high
  let status = "safe";
  if (temp >= 55) status = "critical";
  else if (temp >= 47) status = "warning";

  return {
    temperature: temp,
    humidity,
    fallDetected: false,
    gps: { lat, lng },
    status,
    lastUpdated: Math.floor(Date.now() / 1000),
  };
}

/** Generate a realistic seed history for the chart (last 20 readings) */
function buildDemoHistory() {
  const history = [];
  const now = Date.now();
  for (let i = 19; i >= 0; i--) {
    const t = new Date(now - i * 5000);
    const temp = parseFloat((38 + Math.sin(i * 0.4) * 5 + (Math.random() - 0.5) * 1.2).toFixed(1));
    history.push({ time: t.toLocaleTimeString(), temp });
  }
  return history;
}

// ── How long (ms) to wait for Firebase before auto-switching to demo ───────
const FIREBASE_TIMEOUT_MS = 6000;

/**
 * useFirefighterData
 *
 * mode: "live" | "demo"
 *   live  → connects to Firebase RTDB; if it times-out, auto-falls back to demo
 *   demo  → runs animated mock data immediately, no Firebase attempt
 */
export function useFirefighterData(firefighterId = "firefighter_01", initialMode = "live") {
  const [mode, setMode] = useState(initialMode);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempHistory, setTempHistory] = useState([]);
  const [firebaseOk, setFirebaseOk] = useState(null); // null=unknown true=ok false=failed

  const tickRef = useRef(0);
  const demoIntervalRef = useRef(null);
  const firebaseUnsubRef = useRef(null);
  const timeoutRef = useRef(null);

  // ── Demo runner ───────────────────────────────────────────────────────────
  const startDemo = useCallback(() => {
    // Seed history immediately
    setTempHistory(buildDemoHistory());
    // Instant first data point
    const snap = buildDemoSnapshot(tickRef.current++);
    setData(snap);
    setLoading(false);

    // Animate every 3 s
    demoIntervalRef.current = setInterval(() => {
      const snap = buildDemoSnapshot(tickRef.current++);
      setData(snap);
      setTempHistory((prev) => {
        const next = [...prev, { time: new Date().toLocaleTimeString(), temp: snap.temperature }];
        return next.slice(-20);
      });
    }, 3000);
  }, []);

  const stopDemo = useCallback(() => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  }, []);

  // ── Live Firebase runner ──────────────────────────────────────────────────
  const startLive = useCallback(() => {
    // Start a timeout — if Firebase doesn't respond, switch to demo
    timeoutRef.current = setTimeout(() => {
      console.warn("Firebase timed out — switching to Demo Mode");
      setFirebaseOk(false);
      setError("Firebase connection timed out");
      setMode("demo");
    }, FIREBASE_TIMEOUT_MS);

    const dbRef = ref(db, firefighterId);
    firebaseUnsubRef.current = onValue(
      dbRef,
      (snapshot) => {
        clearTimeout(timeoutRef.current); // cancel timeout on first response
        setFirebaseOk(true);
        if (snapshot.exists()) {
          const raw = snapshot.val();
          const parsed = {
            temperature: raw.temperature ?? 0,
            humidity: raw.humidity ?? 0,
            fallDetected: raw.fall_detected ?? false,
            gps: raw.gps ?? { lat: 16.5062, lng: 80.648 },
            status: raw.status ?? "unknown",
            lastUpdated: raw.last_updated ?? Math.floor(Date.now() / 1000),
          };
          setData(parsed);
          setTempHistory((prev) => {
            const next = [
              ...prev,
              {
                time: new Date(parsed.lastUpdated * 1000).toLocaleTimeString(),
                temp: parsed.temperature,
              },
            ];
            return next.slice(-20);
          });
        } else {
          // Connected but node missing — show demo data as fallback
          const snap = buildDemoSnapshot(tickRef.current++);
          setData(snap);
        }
        setLoading(false);
      },
      (err) => {
        clearTimeout(timeoutRef.current);
        console.error("Firebase error:", err);
        setFirebaseOk(false);
        setError(err.message);
        setMode("demo"); // auto-fallback
      }
    );
  }, [firefighterId]);

  const stopLive = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (firebaseUnsubRef.current) {
      firebaseUnsubRef.current();
      firebaseUnsubRef.current = null;
    }
  }, []);

  // ── Main effect: react to mode changes ───────────────────────────────────
  useEffect(() => {
    // Reset state
    setData(null);
    setLoading(true);
    setError(null);

    if (mode === "demo") {
      stopLive();
      startDemo();
    } else {
      stopDemo();
      startLive();
    }

    return () => {
      stopDemo();
      stopLive();
    };
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "live" ? "demo" : "live"));
  }, []);

  return { data, loading, error, tempHistory, mode, firebaseOk, toggleMode };
}
