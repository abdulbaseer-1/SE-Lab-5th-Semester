import React, { useEffect, useRef } from "react";

/**
 * HardOfHearing wrapper (frontend):
 * - Sends audio gain updates to backend via WebSocket.
 * - intensity: 0..10 -> gain factor (0..1)
 * - ws: your active control WebSocket
 */
export function HardOfHearing({ enabled, intensity = 0, ws, children }) {
  const lastRef = useRef({ enabled: false, level: 0 });

  useEffect(() => {
    if (!ws) return;

    if (!enabled) {
      // Fully enabled = no volume reduction
      try {
        ws.send(JSON.stringify({ type: "hoh", enabled: false, gain: 1.0 }));
      } catch (error) {
        console.log("error : ", error);
      }

      return;
    }

    // Map intensity 0..10 to gain 0..1
    const n = Math.max(0, Math.min(10, intensity));
    const gain = n / 10;

    try {
    ws.send(JSON.stringify({ type: "hoh", enabled: true, gain }));
    } catch (error) {
      console.log("error : ", error);
    }

  }, [enabled, intensity, ws]);

  return <>{children}</>;
}

export function HardOfHearingComponent({
  hardoOfHearing,
  setHardOfHearing,
  hardOfHearingIntensity,
  setHardOfHearingIntensity,
  className
}) {
  return (
    <div className={className}>
      <label>
        <input
          type="checkbox"
          checked={hardoOfHearing}
          onChange={(e) => setHardOfHearing(e.target.checked)}
        />
        Hard of Hearing Simulation
      </label>

      {hardoOfHearing && (
        <label>
          Volume Loss:
          <input
            type="range"
            min={0}
            max={10}
            step="0.1"
            value={hardOfHearingIntensity}
            onChange={(e) => setHardOfHearingIntensity(Number(e.target.value))}
          />
        </label>
      )}
    </div>
  );
}
