import { 
  startStreaming, 
  stopSession, 
  handleClick, 
  handleScroll, 
  handleKey, 
  getPage,
  getSessionByOwnerWs 
} from "./playwrightService.js";

export function wsHandler(wss) {
  wss.on("connection", (ws, req) => {
    console.log("🔌 Control WebSocket connection established");
    ws.isControl = true;

    ws.on("message", async (msg) => {
      let text = null;
      try {
        text = typeof msg === "string" ? msg : msg.toString();
        const data = JSON.parse(text);

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
            await handleClick(ws, data.x, data.y, data.frontendSize);
            break;

          case "scroll":
            await handleScroll(ws, data.deltaY);
            break;

          case "keypress":
          case "keydown":
            await handleKey(ws, data);
            break;
            
          // wsHandler.js
          case "hoh":
            const session = getSessionByOwnerWs(ws);
            if (!session?.page) return;

            try {
              await session.page.evaluate((g) => {
                window.setHardOfHearingGain(g);
              }, data.gain);
            } catch (err) {
              console.error("[HOH] evaluation error:", err.message);
            }
            break;


          default:
            console.warn("❓ Unknown message type:", data.type);
        }
      } catch (err) {
        console.error("❌ Control WS message error:", err?.message || err, "raw:", text);
      }
    });

    ws.on("close", async () => {
      console.log("🔌 Control WebSocket disconnected");
      try { await stopSession(ws); } catch (e) {}
    });
  });
}
