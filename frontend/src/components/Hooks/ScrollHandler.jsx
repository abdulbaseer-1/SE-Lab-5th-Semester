import { useEffect, useRef } from "react";

export default function ScrollHandler({ wsRef, targetElement }) {
  // Throttling prevents flooding the WebSocket (which kills performance)
  const throttleTimeout = useRef(null);

  useEffect(() => {
    // 1. If the element isn't ready yet, do nothing.
    if (!targetElement) return;

    const handleWheel = (e) => {
      // 2. STOP the browser from scrolling the host page
      e.preventDefault();
      e.stopPropagation();

      // 3. Safety check for WebSocket
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      // 4. Throttle: Limit events to ~30ms (approx 30fps)
      if (!throttleTimeout.current) {
        
        wsRef.current.send(
          JSON.stringify({
            type: "scroll",
            deltaY: e.deltaY,
            deltaX: e.deltaX, 
          })
        );

        throttleTimeout.current = setTimeout(() => {
          throttleTimeout.current = null;
        }, 40);
      }
    };

    // 5. Attach non-passive listener (CRITICAL for preventDefault)
    targetElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      targetElement.removeEventListener("wheel", handleWheel);
      if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
    };
  }, [wsRef, targetElement]); // Re-run when the DOM node is finally available

  return null;
}