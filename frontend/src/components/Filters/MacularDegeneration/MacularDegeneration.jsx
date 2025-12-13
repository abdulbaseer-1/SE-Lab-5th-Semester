import React, { useMemo } from "react";

/**
 * Macular degeneration: central scotoma
 * intensity: 0..10
 */
export function MacularDegeneration({ enabled, intensity = 0, children }) {
  if (!enabled) return children;

  const n = Math.max(0, Math.min(1, intensity / 10));
  const spotPct = useMemo(() => (8 + n * 42), [n]);     // center black region size %
  const featherPct = useMemo(() => (spotPct + 10), [spotPct]);
  const overlayOpacity = useMemo(() => (0.7 + n * 0.3), [n]);

  const container = { position: "relative" };
  const overlay = {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,1)",
    transition: "mask-image 300ms ease, opacity 300ms ease",
    opacity: overlayOpacity,
    maskImage: `radial-gradient(circle ${spotPct}% at center, black 0%, rgba(0,0,0,0) ${featherPct}%)`,
    WebkitMaskImage: `radial-gradient(circle ${spotPct}% at center, black 0%, rgba(0,0,0,0) ${featherPct}%)`
  };

  return (
    <div style={container}>
      {children}
      <div style={overlay} />
    </div>
  );
}

export function MacularDegenerationComponent({
  macularDegeneration,
  setMacularDegeneration,
  macularDegenerationIntensity,
  setMacularDegenerationIntensity,
  className
}) {
  return (
    <div className={className}>
      <label>
        <input type="checkbox" checked={macularDegeneration} onChange={(e) => setMacularDegeneration(e.target.checked)} />
        Enable Macular Degeneration Simulation
      </label>

      {macularDegeneration && (
        <label>
          Intensity:
          <input
            type="range"
            min={0}
            max={10}
            value={macularDegenerationIntensity}
            onChange={(e) => setMacularDegenerationIntensity(Number(e.target.value))}
          />
        </label>
      )}
    </div>
  );
}
