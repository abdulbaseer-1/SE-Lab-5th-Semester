// StreamControls.jsx
import { useEffect } from "react";

/**
 * This hook encapsulates:
 *  - WebSocket connection handling
 *  - startStream()
 *  - stopStream()
 *  - frame buffering
 *  - smooth rendering loop
 *
 * It exposes startStream + stopStream so parent components can call them.
 */

const HOST = import.meta.env.VITE_BACKEND_HOST_WS;

export function useStreamControls({
  url,
  setImage,
  setScanResult,
  setIsStreaming,
  setLoading,
  wsRef,
  frameBuffer,
}) {

// START STREAM
  const startStream = () => {
    if (!url.trim()) return alert("Please enter a valid URL.");
    if (wsRef.current) wsRef.current.close();

    setLoading(true);

    wsRef.current = new WebSocket(`wss://${HOST}`);

    wsRef.current.onopen = () => {
      console.log("✅ Connected to backend");
      wsRef.current.send(JSON.stringify({ type: "start", url }));
      setIsStreaming(true);
      setLoading(false);
    };

    wsRef.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      switch (data.type) {
        case "frame":
          frameBuffer.current.push(
            `data:image/png;base64,${data.data}`
          );
          break;

        case "scan_result":
          setScanResult(data.result);
          break;

        case "error":
          alert(data.message || "Error from backend");
          stopStream();
          break;

        case "dom_update":
          console.log("DOM Update received");
          break;

        default:
          // console.log("Unknown message type:", data);
      }
    };

    wsRef.current.onclose = () => {
      console.log("❌ WebSocket closed");
      setIsStreaming(false);
      setLoading(false);
    };
  };

  // STOP STREAM
  const stopStream = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsStreaming(false);
    frameBuffer.current = [];
  };

  // SMOOTH FRAME RENDER LOOP
  useEffect(() => {
    const interval = setInterval(() => {
      if (frameBuffer.current.length > 0) {
        setImage(frameBuffer.current.shift());
      }
    }, 100); // ~10 FPS
    return () => clearInterval(interval);
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => stopStream();
  }, []);

  return { startStream, stopStream };
}

// StreamControlGroup.jsx

export function StreamControls({ 
  url,          // Current state value for the input
  setUrl,       // Setter function for the input's onChange
  isStreaming,  // State for showing Start/Stop
  loading,      // State for disabling Start/showing 'Connecting...'
  startStream,  // Handler for the Start button
  stopStream    // Handler for the Stop button
}) {
  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        value={url}
        // Uses the setUrl prop received from LiveViewer
        onChange={(e) => setUrl(e.target.value)} 
        placeholder="Enter website URL (e.g. https://example.com)"
        className="w-[400px] p-2 border rounded"
      />
      {!isStreaming ? (
        <button
          onClick={startStream}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Connecting..." : "Start"}
        </button>
      ) : (
        <button
          onClick={stopStream}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Stop
        </button>
      )}
    </div>
  );
}
