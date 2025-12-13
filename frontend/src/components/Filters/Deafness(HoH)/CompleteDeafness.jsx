import React, { useEffect } from "react";

export function CompleteDeafness({ enabled, ws, children }) {
  useEffect(() => {
    if (enabled && ws) {
      ws.send(JSON.stringify({ type: "audio-mute-all" }));
    }
  }, [enabled, ws]);

  return children;
}
