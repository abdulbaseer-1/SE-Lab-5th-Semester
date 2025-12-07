import { chromium } from "playwright";

const sessions = new Map(); // Map<ws, { browser, page, streaming }>

// ------------------ START SESSION ------------------
export async function startSession(ws, url) {
  try {
    if (sessions.has(ws)) await stopSession(ws);

    const browser = await chromium.launch({
      headless: true,
      args: ["--autoplay-policy=no-user-gesture-required"]
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000
    });

    const session = { browser, page, streaming: false };
    sessions.set(ws, session);

    return session;

  } catch (err) {
    console.error("startSession error:", err.message);

    ws.send(
      JSON.stringify({
        type: "error",
        message: "Failed to open page: " + err.message
      })
    );

    return null;   // <---- CRITICAL FIX
  }
}

// ------------------ STOP SESSION ------------------
export async function stopSession(ws) {
  const session = sessions.get(ws);
  if (!session) return;

  session.streaming = false;

  try {
    await session.browser.close();
  } catch (_) {}

  sessions.delete(ws);
}

// ------------------ STREAMING LOOP ------------------
export async function startStreaming(ws, url) {
  const session = await startSession(ws, url);

  // ❗ FAIL SAFELY if session creation failed
  if (!session) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Could not start streaming session."
      })
    );
    return;
  }

  const { page } = session;
  session.streaming = true;

  while (session.streaming && ws.readyState === ws.OPEN) {
    try {
      const buf = await page.screenshot({
        type: "jpeg",
        quality: 60
      });

      ws.send(
        JSON.stringify({
          type: "frame",
          data: buf.toString("base64")
        })
      );

      // DOM update every 1000ms
      if (!session.lastDomTime || Date.now() - session.lastDomTime > 1000) {
        const html = await page.content();
        ws.send(JSON.stringify({ type: "dom", html }));
        session.lastDomTime = Date.now();
      }

      await new Promise((r) => setTimeout(r, 150)); // ~6-7 fps
    } catch (e) {
      console.error("Streaming error:", e.message);

      ws.send(
        JSON.stringify({
          type: "error",
          message: "Streaming error: " + e.message
        })
      );

      break;
    }
  }
}

// ------------------ INPUT HANDLERS ------------------
export async function handleClick(ws, x, y, frontendSize) {
  const session = sessions.get(ws);
  if (!session) return;

  const vp = session.page.viewportSize();
  const scaleX = vp.width / frontendSize.width;
  const scaleY = vp.height / frontendSize.height;

  await session.page.mouse.click(x * scaleX, y * scaleY);
}

export async function handleScroll(ws, deltaY) {
  const session = sessions.get(ws);
  if (!session) return;

  try {
    await session.page.mouse.wheel(0, deltaY);
  } catch (err) {
    console.error("Scroll error:", err.message);
  }
}

export async function handleKey(ws, data) {
  const session = sessions.get(ws);
  if (!session) return;

  const { page } = session;

  try {
    if (data.ctrl) await page.keyboard.down("Control");
    if (data.shift) await page.keyboard.down("Shift");
    if (data.alt) await page.keyboard.down("Alt");
    if (data.meta) await page.keyboard.down("Meta");

    await page.keyboard.press(data.key);

    if (data.ctrl) await page.keyboard.up("Control");
    if (data.shift) await page.keyboard.up("Shift");
    if (data.alt) await page.keyboard.up("Alt");
    if (data.meta) await page.keyboard.up("Meta");

  } catch (err) {
    console.error("Key error:", err.message);
  }
}

export async function getPage(ws) {
  return sessions.get(ws)?.page;
}
