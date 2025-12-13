import React, { useMemo } from "react";

/**
 * Practical, working glaucoma simulation using backdrop-filter overlay.
 *
 * Props:
 *  - enabled (bool)
 *  - intensity (0..10)
 *  - maskSize (%)  — tunnel radius (30..90)
 *  - peripheralBlur (px)
 */
export function Glaucoma({
  enabled,
  intensity = 0,
  maskSize = 60,
  peripheralBlur = 6,
  children
}) {
  if (!enabled) return children;

  // normalize intensity (0..1)
  const n = Math.max(0, Math.min(1, intensity / 10));

  // Derived parameters
  const blur = useMemo(() => Math.max(0, peripheralBlur * (0.4 + n)), [peripheralBlur, n]);
  const contrast = useMemo(() => 1 - n * 0.45, [n]);         // lower -> less contrast
  const saturate = useMemo(() => 1 - n * 0.6, [n]);          // lower -> desaturate
  const radius = useMemo(() => Math.max(20, Math.min(90, maskSize - n * 20)), [maskSize, n]);
  const darkness = useMemo(() => 0.12 + n * 0.55, [n]);      // periphery darkening alpha

  // Container is the normal content
  const containerStyle = { position: "relative", overflow: "hidden" };

  // Overlay uses backdrop-filter so it affects the content behind it
  // Use a tiny alpha background to ensure backdrop-filter triggers in all browsers
  // Mask: keep center clear (transparent) and apply overlay only to the periphery
  const overlayStyle = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    transition: "backdrop-filter 280ms ease, opacity 280ms ease, -webkit-backdrop-filter 280ms ease, mask-image 280ms ease",
    // tiny alpha to ensure backdrop-filter applies; final "darkness" uses rgba black multiplied by alpha
    background: `rgba(255,255,255,0.0001)`,
    backdropFilter: `blur(${blur}px) contrast(${contrast}) saturate(${saturate})`,
    WebkitBackdropFilter: `blur(${blur}px) contrast(${contrast}) saturate(${saturate})`,
    // mask: transparent center, opaque periphery
    maskImage: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${Math.round(
      radius * 0.55
    )}%, rgba(0,0,0,1) ${Math.round(radius)}%)`,
    WebkitMaskImage: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${Math.round(
      radius * 0.55
    )}%, rgba(0,0,0,1) ${Math.round(radius)}%)`,
    // overlay darkness to simulate peripheral dimming (applies on top of backdrop-filter)
    boxShadow: `inset 0 0 0 9999px rgba(0,0,0,${darkness})`,
    opacity: 1
  };

  return (
    <div style={containerStyle}>
      {children}
      <div style={overlayStyle} />
    </div>
  );
}

/**
 * Control panel for the glaucoma filter (advanced settings).
 * Add this to your control panel; its props map directly to LiveViewer state.
 */
export function GlaucomaComponent({
  className,
  glaucoma,
  setGlaucoma,
  glaucomaIntensity,
  setGlaucomaIntensity,
  glaucomaMaskSize,
  setGlaucomaMaskSize,
  glaucomaBlur,
  setGlaucomaBlur
}) {
  return (
    <div className={className}>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={glaucoma}
          onChange={(e) => setGlaucoma(e.target.checked)}
        />
        <span style={{ fontWeight: 600 }}>Glaucoma Simulation</span>
      </label>

      {glaucoma && (
        <>
          <label style={{ display: "block", marginTop: 8 }}>
            Severity:
            <input
              type="range"
              min={0}
              max={10}
              value={glaucomaIntensity}
              onChange={(e) => setGlaucomaIntensity(Number(e.target.value))}
            />
            <span style={{ marginLeft: 8 }}>{glaucomaIntensity}</span>
          </label>

          <div style={{ marginTop: 8, fontWeight: 600 }}>Advanced</div>

          <label style={{ display: "block", marginTop: 6 }}>
            Tunnel radius (maskSize %):
            <input
              type="range"
              min={30}
              max={90}
              value={glaucomaMaskSize}
              onChange={(e) => setGlaucomaMaskSize(Number(e.target.value))}
            />
            <span style={{ marginLeft: 8 }}>{glaucomaMaskSize}%</span>
          </label>

          <label style={{ display: "block", marginTop: 6 }}>
            Peripheral blur (px):
            <input
              type="range"
              min={0}
              max={30}
              value={glaucomaBlur}
              onChange={(e) => setGlaucomaBlur(Number(e.target.value))}
            />
            <span style={{ marginLeft: 8 }}>{glaucomaBlur}px</span>
          </label>
        </>
      )}
    </div>
  );
}
