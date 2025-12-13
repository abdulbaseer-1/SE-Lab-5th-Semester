import React, { useMemo } from "react";

/**
 * Cataracts wrapper.
 * intensity: 0..10
 */
export function Cataracts({ enabled, intensity = 0, children }) {
  if (!enabled) return children;

  const n = Math.max(0, Math.min(1, intensity / 10));

  // map to blur and haze
  const blur = useMemo(() => (0.5 + n * 8), [n]);        // px
  const brightness = useMemo(() => (1 - n * 0.25), [n]);
  const contrast = useMemo(() => (1 - n * 0.35), [n]);
  const vignetteAlpha = useMemo(() => (0.02 + n * 0.35), [n]); // subtle overall haze

  const wrapperStyle = {
    position: "relative",
    transition: "filter 300ms ease"
  };

  const filter = `blur(${blur}px) brightness(${brightness}) contrast(${contrast})`;

  const hazeStyle = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: `rgba(255,255,255,${vignetteAlpha})`, // slight veiling glare
    mixBlendMode: "screen",
    transition: "opacity 300ms ease",
  };

  return (
    <div style={wrapperStyle}>
      <div style={{ filter }}>{children}</div>
      <div style={hazeStyle} />
    </div>
  );
}

export function CataractsComponent({
  cataracts,
  setCataracts,
  cataractsIntensity,
  setCataractsIntensity,
  className
}) {
  return (
    <div className={className}>
      <label>
        <input type="checkbox" checked={cataracts} onChange={(e) => setCataracts(e.target.checked)} />
        Enable Cataracts Simulation
      </label>

      {cataracts && (
        <label>
          Intensity:
          <input
            type="range"
            min={0}
            max={10}
            value={cataractsIntensity}
            onChange={(e) => setCataractsIntensity(Number(e.target.value))}
          />
        </label>
      )}
    </div>
  );
}
