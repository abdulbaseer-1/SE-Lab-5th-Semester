import { useEffect } from "react";

export default function ClickHandler({ targetRef, wsRef }) {
  useEffect(() => {
    const imgEl = targetRef.current;
    if (!imgEl) return;

    const handleClick = (e) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const rect = imgEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      wsRef.current.send(
        JSON.stringify({
          type: "click",
          x,
          y,
          frontendSize: { width: imgEl.clientWidth, height: imgEl.clientHeight },
        })
      );
    };

    imgEl.addEventListener("click", handleClick);

    // Cleanup
    return () => imgEl.removeEventListener("click", handleClick);
  }, [targetRef.current, wsRef.current]); // <-- watch for current values

  return null;
}
