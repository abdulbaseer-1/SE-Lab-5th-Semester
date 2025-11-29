import { chromium } from "playwright";

const sessions = new Map(); // Map<ws, { browser, page, streaming }>

export async function startSession(ws, url) {
  if (sessions.has(ws)) await stopSession(ws);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

  const session = { browser, page, streaming: false };
  sessions.set(ws, session);
  return session;
}

export async function stopSession(ws) {
  const session = sessions.get(ws);
  if (!session) return;
  session.streaming = false;
  await session.browser.close().catch(() => {});
  sessions.delete(ws);
}

/** Stream compressed JPEG frames */
export async function startStreaming(ws, url) {
  const session = await startSession(ws, url);
  const { page } = session;
  session.streaming = true;

  while (session.streaming && ws.readyState === ws.OPEN) {
    try {
      const buf = await page.screenshot({ type: "jpeg", quality: 60 });
      ws.send(JSON.stringify({ type: "frame", data: buf.toString("base64") }));

      // Optionally send DOM occasionally (every ~1s)
      if (!session.lastDomTime || Date.now() - session.lastDomTime > 1000) {
        const html = await page.content();
        ws.send(JSON.stringify({ type: "dom", html }));
        session.lastDomTime = Date.now();
      }

      await new Promise(r => setTimeout(r, 150)); // ~6–7 fps
    } catch (e) {
      console.error("stream error:", e.message);
      break;
    }
  }
}

/** Input events */
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
  const { page } = session;
  if (!page) return;

  try {
    // Use mouse.wheel to scroll the page
    await page.mouse.wheel(0, deltaY);
  } catch (err) {
    console.error("handleScroll error:", err.message);
  }
}


export async function handleKey(ws, data) {
  // data = { key, code, ctrl, shift, alt, meta }
  const session = sessions.get(ws);
  if (!session) return;

  const { page } = session;
  if (!page) return;

  try {
    // Press modifier keys first
    if (data.ctrl) await page.keyboard.down("Control");
    if (data.shift) await page.keyboard.down("Shift");
    if (data.alt) await page.keyboard.down("Alt");
    if (data.meta) await page.keyboard.down("Meta");

    // Press the actual key
    await page.keyboard.press(data.key); // handles Backspace, Enter, letters, etc.

    // Release modifier keys
    if (data.ctrl) await page.keyboard.up("Control");
    if (data.shift) await page.keyboard.up("Shift");
    if (data.alt) await page.keyboard.up("Alt");
    if (data.meta) await page.keyboard.up("Meta");

  } catch (err) {
    console.error("handleKey error:", err.message);
  }
}

export async function getPage(ws) {
  return sessions.get(ws)?.page;
}
