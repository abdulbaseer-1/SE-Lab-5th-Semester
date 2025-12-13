// useStreamControls.jsx
import { useEffect } from "react";

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

  // ---------------------------
  // AUDIO INITIALIZATION
  // ---------------------------
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let audioBusy = false;

  async function playAudioChunk(arrayBuffer) {
    try {
      const clone = arrayBuffer.slice(0);

      const audioBuf = await audioCtx.decodeAudioData(clone);

      const src = audioCtx.createBufferSource();
      src.buffer = audioBuf;
      src.connect(audioCtx.destination);
      src.start(audioCtx.currentTime + 0.01);
    } catch (err) {
      console.warn("Audio decode failed:", err.message);
    }
  }

  // ---------------------------
  // START STREAM
  // ---------------------------
  const startStream = () => {
    if (!url.trim()) return alert("Please enter a valid URL.");

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setLoading(true);

    const ws = new WebSocket(`ws://${HOST}`);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to backend");
      ws.send(JSON.stringify({ type: "start", url }));
      setIsStreaming(true);
      setLoading(false);
    };

    ws.onmessage = async (msg) => {
      const data = msg.data;

      // ---------------------------
      // BINARY: frames or audio
      // ---------------------------
      if (data instanceof ArrayBuffer) {
        const view = new DataView(data);
        const tag = view.getUint8(0);

        if (tag === 0x01) {
          // JPEG frame
          const blob = new Blob([data.slice(1)], { type: "image/jpeg" });
          const url = URL.createObjectURL(blob);

          frameBuffer.current.push(url);
        }

        else if (tag === 0x02) {
          // Audio chunk
          await playAudioChunk(data.slice(1));
        }

        return;
      }

      // ---------------------------
      // JSON text messages
      // ---------------------------
      try {
        const parsed = JSON.parse(data);

        switch (parsed.type) {
          case "scan_result":
            setScanResult(parsed.result);
            break;

          case "error":
            alert(parsed.message || "Error from backend");
            stopStream();
            break;

          case "dom":
            // optional DOM snapshot
            break;

          default:
            break;
        }
      } catch (err) {
        console.warn("JSON parse failed:", err.message);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setIsStreaming(false);
      setLoading(false);
    };
  };

  // ---------------------------
  // STOP STREAM
  // ---------------------------
  const stopStream = () => {
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: "stop" }));
      } catch (_) {}

      wsRef.current.close();
      wsRef.current = null;
    }

    setIsStreaming(false);

    // Revoke used object URLs to prevent leaks
    frameBuffer.current.forEach((url) => URL.revokeObjectURL(url));
    frameBuffer.current = [];
  };

  // ---------------------------
  // FRAME RENDER LOOP (0-latency)
  // ---------------------------
  useEffect(() => {
    let active = true;

    const renderLoop = () => {
      if (!active) return;

      if (frameBuffer.current.length > 0) {
        const frameUrl = frameBuffer.current.shift();
        setImage(frameUrl);
      }

      requestAnimationFrame(renderLoop);
    };

    requestAnimationFrame(renderLoop);

    return () => {
      active = false;
    };
  }, []);

  // ---------------------------
  // CLEANUP ON UNMOUNT
  // ---------------------------
  useEffect(() => {
    return () => stopStream();
  }, []);

  return { startStream, stopStream };
}
// StreamControls.jsx
export function StreamControls({
  url,
  setUrl,
  isStreaming,
  loading,
  startStream,
  stopStream
}) {
  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter website URL (e.g. https://example.com)"
        className="w-[400px] p-2 border rounded"
      />

      {!isStreaming ? (
        <button
          onClick={startStream}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Connecting..." : "Start"}
        </button>
      ) : (
        <button
          onClick={stopStream}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Stop
        </button>
      )}
    </div>
  );
}
