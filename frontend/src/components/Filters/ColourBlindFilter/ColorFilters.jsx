// --- colorFilters.js ---
// This module contains the SVG color filters and the control component.
// NOTE: For this to work in a React project, you must ensure your JSX
// build step (Babel/Webpack) is configured for the "automatic" runtime,
// which is standard in modern React setups.

/**
 * SVG color-matrix filters for color blindness simulation.
 * The wrapper applies `filter: url(#...)` to children (works for <img>, <canvas>, <div>).
 */

import ColorBlindFilterCSS from "./ColourFilters.module.css";

/* --- Protanopia --- */
export function Protanopia({ children, className, id = "protanopia-filter" }) {
  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id={id}>
            <feColorMatrix
              type="matrix"
              values="
                0.567,0.433,0,0,0
                0.558,0.442,0,0,0
                0,0.242,0.758,0,0
                0,0,0,1,0
              "
            />
          </filter>
        </defs>
      </svg>
      <div style={{ filter: `url(#${id})` }} className={className}>
        {children}
      </div>
    </>
  );
}

/* --- Deuteranopia --- */
export function Deuteranopia({ children, className, id = "deuteranopia-filter" }) {
  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id={id}>
            <feColorMatrix
              type="matrix"
              values="
                0.625,0.375,0,0,0
                0.7,0.3,0,0,0
                0,0.3,0.7,0,0
                0,0,0,1,0
              "
            />
          </filter>
        </defs>
      </svg>
      <div style={{ filter: `url(#${id})` }} className={className}>
        {children}
      </div>
    </>
  );
}

/* --- Tritanopia --- */
export function Tritanopia({ children, className, id = "tritanopia-filter" }) {
  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id={id}>
            <feColorMatrix
              type="matrix"
              values="
                0.95,0.05,0,0,0
                0,0.433,0.567,0,0
                0,0.475,0.525,0,0
                0,0,0,1,0
              "
            />
          </filter>
        </defs>
      </svg>
      <div style={{ filter: `url(#${id})` }} className={className}>
        {children}
      </div>
    </>
  );
}

/* --- Achromatopsia (complete color blindness) --- */
export function Acromatopsia({ children, className, id = "acromatopsia-filter" }) {
  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id={id}>
            <feColorMatrix
              type="matrix"
              values="
                0.2126,0.7152,0.0722,0,0
                0.2126,0.7152,0.0722,0,0
                0.2126,0.7152,0.0722,0,0
                0,0,0,1,0
              "
            />
          </filter>
        </defs>
      </svg>
      <div style={{ filter: `url(#${id})` }} className={className}>
        {children}
      </div>
    </>
  );
}

/**
 * Component to select and apply the correct color blind filter.
 * @param {string} type - The type of color blindness ("protanopia", "deuteranopia", etc.).
 * @param {ReactNode} children - The content to filter.
 */
export const ColourBlindFilterSelector = ({ type, children }) => {
  switch (type) {
    case "protanopia": return <Protanopia>{children}</Protanopia>;
    case "deuteranopia": return <Deuteranopia>{children}</Deuteranopia>;
    case "tritanopia": return <Tritanopia>{children}</Tritanopia>;
    case "acromatopsia": return <Acromatopsia>{children}</Acromatopsia>;
    default: return <>{children}</>; // No filter applied
  }
};

/**
 * Control component for selecting the color blindness simulation type.
 * @param {string} colourBlindness - The current selected type.
 * @param {function} setColourBlindness - State setter function.
 */
export function ColourBlindFilter({
  className,
  colourBlindness,
  setColourBlindness
}) {
  return(
    <div className={`${ColorBlindFilterCSS.color_blindness_controls} ${className}`}> {/*Only one pair of backticks for the whole string.*/}
      <label htmlFor="colourBlindTypes" className="select-label">
        Color Blindness Simulation:
      </label>
      <select
        id="colourBlindTypes"
        value={colourBlindness}
        onChange={(e) => setColourBlindness(e.target.value)}
        className="select-input"
      >
        <option value="none">None</option>
        <option value="protanopia">Protanopia (Red-weak)</option>
        <option value="deuteranopia">Deuteranopia (Green-weak)</option>
        <option value="tritanopia">Tritanopia (Blue-weak)</option>
        <option value="acromatopsia">Achromatopsia (Total)</option>
      </select>
    </div>
  );
}