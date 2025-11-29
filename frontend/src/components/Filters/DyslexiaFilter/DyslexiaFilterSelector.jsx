import React, { useEffect, useRef } from "react";
import DyslexiaFilterCSS from "./DyslexiaFilterSelector.module.css";
// Assuming 'ControlPanel.css' styles are available

/**
 * Applies random rotation, jitter, and spacing to individual characters 
 * within the children nodes to simulate effects of dyslexia.
 * * @param {boolean} enabled - Whether the filter is active.
 * @param {number} intensity - The severity level (0 to 10).
 * @param {ReactNode} children - The content to filter.
 */
export function DyslexiaFilterSelector({ enabled, intensity = 1, children }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!enabled || !wrapperRef.current) return;

    const root = wrapperRef.current;

    // Helper: only transform pure text nodes, skipping media elements.
    const isSafeElement = (node) => {
      if (node.nodeType === Node.TEXT_NODE) return true;
      if (node.nodeType !== Node.ELEMENT_NODE) return false;

      // ❌ DO NOT touch these elements
      const forbidden = ["IMG", "VIDEO", "CANVAS", "SVG", "SCRIPT", "STYLE"];
      if (forbidden.includes(node.tagName)) return false;

      return true;
    };

    // Processes a text node by replacing it with a fragment of styled <span> elements.
    const processTextNode = (node) => {
      const text = node.textContent;
      if (!text.trim()) return;

      const fragment = document.createDocumentFragment();

      for (let ch of text) {
        const span = document.createElement("span");
        span.textContent = ch;

        // Apply random transform based on intensity
        const rotate = (Math.random() - 0.5) * (intensity * 2);
        const jitterX = (Math.random() - 0.5) * (intensity * 0.6);
        const jitterY = (Math.random() - 0.5) * (intensity * 0.6);
        const spacing = (Math.random() - 0.5) * (intensity * 0.06);

        span.style.display = "inline-block";
        span.style.transform = `translate(${jitterX}px, ${jitterY}px) rotate(${rotate}deg)`;
        span.style.letterSpacing = `${spacing}em`;

        fragment.appendChild(span);
      }

      // Replace the original TextNode with the new fragment.
      node.replaceWith(fragment); 
    };

    // Recursively walks the DOM tree from the root element.
    const walk = (el) => {
      // Create a copy of childNodes to allow modification during iteration
      for (let node of [...el.childNodes]) { 
        if (!isSafeElement(node)) continue; 

        if (node.nodeType === Node.TEXT_NODE) {
          // Process text nodes
          processTextNode(node);
        } else if (node.childNodes?.length) {
          // Continue walking through child elements
          walk(node);
        }
      }
    };

    // Apply the transformation
    walk(root);

    // Cleanup: In a production React environment, the current cleanup 
    // (clearing innerHTML) can be unreliable and cause React to lose track 
    // of its virtual DOM. For this specific type of high-fidelity simulation, 
    // a page refresh or a more complex state management system to store/restore 
    // the original DOM structure might be necessary, but we'll leave the original 
    // cleanup as per the requirement for file preservation.
    return () => {
      // if (!wrapperRef.current) return;
      // wrapperRef.current.innerHTML = ""; 
    };
  }, [enabled, intensity]); // Dependencies control when the effect runs

  // If disabled, render children normally.
  if (!enabled) return <>{children}</>;

  // If enabled, render children inside a ref-equipped span for DOM access.
  return <span ref={wrapperRef}>{children}</span>;
}


/**
 * Control panel for enabling and adjusting dyslexia simulation intensity.
 */
export function DyslexiaComponent({
  className,
  dyslexiaEnabled,
  setDyslexiaEnabled,
  dyslexiaIntensity,
  setDyslexiaIntensity
}) {
  return (
    // Reusing .control-group from ControlPanel.css
    <div className={`${DyslexiaFilterCSS.control_group} ${className}`}> 
      <label className="control-label"> 
        Dyslexia Simulation:
        <input
          type="checkbox"
          checked={dyslexiaEnabled}
          onChange={(e) => setDyslexiaEnabled(e.target.checked)}
          className="control-input"
        />
      </label>
      <label className="control-label">
        Severity: (Level {dyslexiaIntensity.toFixed(1)})
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={dyslexiaIntensity}
          onChange={(e) => setDyslexiaIntensity(Number(e.target.value))}
          className="control-input"
        />
      </label>
    </div>
  );
}