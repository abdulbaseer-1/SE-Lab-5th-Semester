import {
  startStreaming,
  stopSession,
  handleClick,
  handleScroll,
  handleKey,
} from "./playwrightService.js";

/**
 * Initialize WebSocket message handling
 * @param {WebSocketServer} ws
 */
export function wsHandler(ws) {
  ws.on("connection", (ws) => {
    console.log("🔌 WebSocket connected");

    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg);

        switch (data.type) {
          case "start":
            console.log("▶️ Starting stream for:", data.url);
            startStreaming(ws, data.url);
            break;

          case "stop":
            console.log("⏹️ Stopping session");
            await stopSession(ws);
            break;

          case "click":
            console.log(`🖱️ Click event at (${data.x}, ${data.y})`);
            await handleClick(ws, data.x, data.y, data.frontendSize);
            break;

          case "scroll":
            console.log(`🧭 Scroll event: ${data.deltaY}`);
            await handleScroll(ws, data.deltaY);
            break;

          case "keypress":
            console.log(`⌨️ Key press: ${data.key}`);
            await handleKey(ws, data.key);
            break;

          case "keydown":
            console.log(`⌨️ Key down: ${data.key}`);
            await handleKey(ws, data); // pass full data
            break;

          case "keyup":
            console.log(`⌨️ Key up: ${data.key}`);
            // optionally implement handleKeyUp(ws, data)
            break;

          default:
            console.warn("❓ Unknown message type:", data.type);
        }
      } catch (err) {
        console.error("❌ WebSocket message error:", err.message);
      }
    });

    ws.on("close", async () => {
      console.log("🔌 WebSocket disconnected");
      await stopSession(ws);
    });
  });
}
