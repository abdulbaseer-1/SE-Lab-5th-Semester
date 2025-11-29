import { useEffect, useRef } from "react";

/**
 * Smooth, natural hand tremor cursor overlay.
 * Perfectly follows the user's pointer across the streamed image.
 */
export function useJitterCursor(enabled, intensity = 2, frameRef) {
  const cursorRef = useRef(null);
  const basePos = useRef({ x: 0, y: 0 });
  let animationFrame;

  useEffect(() => {
    if (!frameRef?.current) return;

    // Create floating cursor if missing
    if (!cursorRef.current) {
      const el = document.createElement("div");
      el.style.position = "fixed"; // ✅ absolute to viewport for no offset
      el.style.width = "10px";
      el.style.height = "10px";
      el.style.borderRadius = "50%";
      el.style.background = "rgba(0,0,0,0.8)";
      el.style.pointerEvents = "none";
      el.style.zIndex = "9999";
      el.style.transform = "translate(-50%, -50%)";
      el.style.transition = "transform 0.05s ease-out";
      document.body.appendChild(el);
      cursorRef.current = el;
    }

    const cursor = cursorRef.current;
    let angle = 0;

    const handleMouseMove = (e) => {
      const rect = frameRef.current.getBoundingClientRect();

      // Check if cursor is inside image bounds
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        cursor.style.display = "none";
        return;
      }

      cursor.style.display = "block";
      basePos.current.x = e.clientX;
      basePos.current.y = e.clientY;
    };

    const animate = () => {
      if (!enabled) {
        cursor.style.display = "none";
        return;
      }

      angle += 0.04; // slower and smoother
      const jitterX =
        Math.sin(angle * 2) * intensity +
        (Math.random() - 0.5) * (intensity * 0.3);
      const jitterY =
        Math.cos(angle * 2.3) * intensity +
        (Math.random() - 0.5) * (intensity * 0.3);

      const x = basePos.current.x + jitterX;
      const y = basePos.current.y + jitterY;

      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", handleMouseMove);
      if (cursorRef.current) cursorRef.current.style.display = "none";
    };
  }, [enabled, intensity, frameRef]);
}

// JitterControls.jsx (or whatever file holds the JitterCursor component)

// export function JitterCursor({
//   jitterEnabled,
//   setJitterEnabled,
//   jitterIntensity,
//   setJitterIntensity,
// }) {
//   return (
//     <div className="flex flex-col items-start mb-4 p-3 border rounded bg-gray-50">
//       <label className="flex items-center gap-2 mb-2">
//         <input
//           type="checkbox"
//           // 💡 FIX: Use prop
//           checked={jitterEnabled} 
//           // 💡 FIX: Use prop
//           onChange={(e) => setJitterEnabled(e.target.checked)} 
//         />
//         Enable Hand Tremor Simulation
//       </label>
//       <label className="flex items-center gap-2">
//         Jitter Intensity:
//         <input
//           type="range"
//           min="0"
//           max="10"
//           // 💡 FIX: Use prop
//           value={jitterIntensity} 
//           // 💡 FIX: Use prop
//           onChange={(e) => setJitterIntensity(Number(e.target.value))} 
//         />
//         <span className="text-sm text-gray-700">{jitterIntensity}px</span>
//       </label>
//     </div>
//   );
// }