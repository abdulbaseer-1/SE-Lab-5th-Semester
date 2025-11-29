import { useEffect } from "react";

export default function KeyboardHandler({ wsRef }) {

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      // Optional: prevent default so backspace doesn't erase local input
      e.preventDefault();

      wsRef.current.send(JSON.stringify({
        type: "keydown",
        key: e.key,    // 'a', 'Enter', 'Backspace', etc.
        code: e.code,  // 'KeyA', 'Enter', 'Backspace'
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey
      }));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wsRef]);

  return null;
}


/**
 * Was using keypress before, thats deprecated and dosent fire for control keys
 * 
 * keydown is modern, supports all keys and action keys!
 */