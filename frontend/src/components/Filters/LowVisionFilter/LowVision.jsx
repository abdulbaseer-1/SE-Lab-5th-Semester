import React from "react";
import LowVisionFilterCSS from "./LowVision.module.css";
// Assuming 'ControlPanel.css' styles are available

/**
 * Maps low vision intensity (0-7) to CSS blur and brightness.
 * This determines the degree of visual impairment simulation.
 * 0 = worst vision, 7 = perfect vision.
 */
const mapIntensityToBlur = (intensity) => {
  // intensity: 0 (worst vision) → 7 (perfect vision)
  const maxBlur = 10; // maximum blur for lowest vision
  const minBlur = 0; // no blur for perfect vision
  const clamped = Math.min(Math.max(intensity, 0), 7);
  
  // Invert scale: 0 -> maxBlur, 7 -> 0
  const blur = maxBlur * (1 - clamped / 7);
  return blur;
};

/**
 * LowVision component (CSS) — simple blur + contrast + zoom.
 * Wraps the children and applies inline CSS filters and transformation.
 */
export const LowVision = ({
  children,
  blur = 4,
  contrast = 1,
  brightness = 1,
  zoom = 1.0,
  className,
  style,
}) => {
  const wrapStyle = {
    // Ensures the element containing the children is visually zoomed
    overflow: "hidden",
    display: "inline-block",
    transform: `scale(${zoom})`,
    transformOrigin: "center center",
  };

  const contentStyle = {
    // Applies the visual impairment filter effects
    filter: `blur(${blur}px) contrast(${contrast}) brightness(${brightness})`,
    display: "block",
  };

  return (
    <div style={{ ...wrapStyle, ...style }} className={className}>
      <div style={contentStyle}>{children}</div>
    </div>
  );
};

/**
 * Selector component that calculates the required LowVision parameters 
 * based on the user-controlled intensity level and wraps the children.
 */
export const LowVisionFilterSelector = ({ lowVisionIntensity, enabled, children }) => {
  if (!enabled) return <>{children}</>;

  // Calculate blur based on inverted intensity scale (0 = max blur, 7 = min blur)
  const blur = mapIntensityToBlur(lowVisionIntensity); 
  const contrast = 0.9;
  const brightness = 0.95;

  return (
    <LowVision blur={blur} contrast={contrast} brightness={brightness} zoom={1}>
      {children}
    </LowVision>
  );
};

/**
 * Control panel for enabling and adjusting the Low Vision simulation.
 * Uses CSS classes defined in ControlPanel.css.
 */
export function LowVisionComponent({
  className,
  lowVision,
  setLowVision,
  lowVisionIntensity,
  setLowVisionIntensity
}){
  return(
    <div className={`${LowVisionFilterCSS.control_group} ${className}`}>
      <label className="control-label">
        Enable Low Vision:
        <input
          type="checkbox"
          checked={lowVision}
          onChange={(e) => setLowVision(e.target.checked)}
          className="control-input"
        />
      </label>
      <label className="control-label">
        Severity:
        <input
          type="range"
          min="0"
          max="7"
          step="0.1"
          value={lowVisionIntensity}
          onChange={(e) => setLowVisionIntensity(Number(e.target.value))}
          className="control-input"
        />
        {/* Display the value formatted to one decimal place */}
        <span className="control-input">{lowVisionIntensity.toFixed(1)}</span>
      </label>
    </div>
  );
}