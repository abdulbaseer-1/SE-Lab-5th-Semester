// ------------------------------------------------------------
// Features implemented:
// 1. Singleton Chromium (playwright-core)
// 2. Context-per-session isolation
// 3. Bounded concurrency + watchdog
// 4. Safe screenshot streaming (time-driven)
// 5. HOH (Hard-of-Hearing) audio capture + volume control
// 6. Explicit page-side cleanup
// 7. WebSocket lifecycle coupling
// 8. pkg-compatible single-file runtime
// ------------------------------------------------------------

import { chromium } from "playwright-core";
import crypto from "crypto";

// ------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------
const MAX_SESSIONS = 3;
const FPS_CAP_MS = 50;           // ~20 FPS
const SCREENSHOT_QUALITY = 60;
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes watchdog

// ------------------------------------------------------------
// GLOBAL BROWSER SINGLETON
// ------------------------------------------------------------
let globalBrowser = null;

async function getBrowser() {
  if (!globalBrowser) {
    globalBrowser = await chromium.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-background-networking",
        "--disable-renderer-backgrounding",
        "--autoplay-policy=no-user-gesture-required",
        "--use-fake-ui-for-media-stream",
        "--window-position=-32000,-32000"
      ]
    });
    console.log("[system] Chromium launched (singleton)");
  }
  return globalBrowser;
}

// ------------------------------------------------------------
// SESSION REGISTRY
// ------------------------------------------------------------
const sessions = new Map(); // sid -> session

export function getSessionByOwnerWs(ws) {
  for (const s of sessions.values()) {
    if (s.ownerWs === ws) return s;
  }
  return null;
}


// ------------------------------------------------------------
// Minimal Hard-of-Hearing volume injection
// ------------------------------------------------------------
async function injectVolumeControl(page) {
  await page.evaluate(() => {
    if (window.__hohInjected) return;
    window.__hohInjected = true;

    /**
     * Set volume for all audio/video elements
     * @param {number} gain 0.0 (mute) → 1.0 (full)
     */
    window.setHardOfHearingGain = (gain) => {
      const clamped = Math.max(0, Math.min(1, gain));
      const elements = Array.from(document.querySelectorAll("audio, video"));
      elements.forEach(el => {
        try { el.volume = clamped; } catch (_) {}
      });
      window.__serverLog?.(`[HOH] set volume to ${clamped}`);
    };

    // Automatically attach to future audio/video elements
    const observer = new MutationObserver(() => {
      const elements = Array.from(document.querySelectorAll("audio, video"));
      elements.forEach(el => {
        if (!el.__hohAttached) {
          try { el.volume = 1.0; el.__hohAttached = true; } catch (_) {}
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup if needed
    window.__hohCleanup = () => observer.disconnect();
  });
}


// ------------------------------------------------------------
// START SESSION
// ------------------------------------------------------------
export async function startSession(ownerWs, url) {
  if (sessions.size >= MAX_SESSIONS) {
    throw new Error("Server at capacity");
  }

  const old = getSessionByOwnerWs(ownerWs);
  if (old) await stopSession(ownerWs);

  const sid = crypto.randomUUID();
  const browser = await getBrowser();

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  await page.exposeFunction("__serverLog", (m) =>
    console.log(`[page][${sid}]`, m)
  );

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  await injectVolumeControl(page);

  const session = {
    sid,
    ownerWs,
    context,
    page,
    streaming: false,
    startedAt: Date.now(),
    watchdog: null
  };

  // Watchdog
  session.watchdog = setInterval(() => {
    if (Date.now() - session.startedAt > SESSION_TTL_MS) {
      console.warn(`[watchdog] killing sid=${sid}`);
      stopSession(ownerWs);
    }
  }, 30_000);

  sessions.set(sid, session);
  ownerWs.sessionId = sid;
  return session;
}

// ------------------------------------------------------------
// STOP SESSION (DETERMINISTIC)
// ------------------------------------------------------------
export async function stopSession(ownerWs) {
  const s = getSessionByOwnerWs(ownerWs);
  if (!s) return;

  s.streaming = false;
  clearInterval(s.watchdog);

  try {
    await s.page.evaluate(() => window.__hohCleanup?.());
  } catch (_) {}

  try {
    await s.context.close();
  } catch (_) {}

  sessions.delete(s.sid);
  console.log(`[session] stopped sid=${s.sid}`);
}

// ------------------------------------------------------------
// SCREENSHOT STREAMING (SAFE LOOP)
// ------------------------------------------------------------
export async function startStreaming(ownerWs, url) {
  let session;
  try {
    session = await startSession(ownerWs, url);
  } catch (err) {
    ownerWs.send(JSON.stringify({ type: "error", message: err.message }));
    return;
  }

  session.streaming = true;
  const header = Buffer.from([0x01]);

  const loop = async () => {
    if (!session.streaming || ownerWs.readyState !== ownerWs.OPEN) return;

    const start = Date.now();
    try {
      const img = await session.page.screenshot({
        type: "jpeg",
        quality: SCREENSHOT_QUALITY,
        optimizeForSpeed: true
      });
      ownerWs.send(Buffer.concat([header, img]));
    } catch (e) {
      if (String(e).includes("Target closed")) {
        stopSession(ownerWs);
        return;
      }
    }

    const delay = Math.max(0, FPS_CAP_MS - (Date.now() - start));
    setTimeout(loop, delay);
  };

  loop();
}

// ------------------------------------------------------------
// INPUT HANDLERS (SAFE)
// ------------------------------------------------------------
export async function handleClick(ws, x, y, frontendSize) {
  const s = getSessionByOwnerWs(ws);
  if (!s) return;

  s.page.evaluate(({ x, y, w, h }) => {
    const el = document.elementFromPoint(
      x * (window.innerWidth / w),
      y * (window.innerHeight / h)
    );
    el?.click();
  }, { x, y, w: frontendSize.width, h: frontendSize.height }).catch(() => {});
}

export async function handleScroll(ws, dy) {
  const s = getSessionByOwnerWs(ws);
  if (!s) return;
  s.page.mouse.wheel(0, dy).catch(() => {});
}

export async function handleKey(ws, data) {
  const s = getSessionByOwnerWs(ws);
  if (!s) return;

  const k = s.page.keyboard;
  (async () => {
    if (data.ctrl) await k.down("Control");
    if (data.shift) await k.down("Shift");
    if (data.alt) await k.down("Alt");
    if (data.meta) await k.down("Meta");
    await k.press(data.key);
    if (data.ctrl) await k.up("Control");
    if (data.shift) await k.up("Shift");
    if (data.alt) await k.up("Alt");
    if (data.meta) await k.up("Meta");
  })().catch(() => {});
}

// ------------------------------------------------------------
// GRACEFUL SHUTDOWN (pkg-safe)
// ------------------------------------------------------------
process.on("SIGINT", async () => {
  console.log("[system] shutdown");
  for (const s of sessions.values()) {
    try { await stopSession(s.ownerWs); } catch (_) {}
  }
  try { await globalBrowser?.close(); } catch (_) {}
  process.exit(0);
});
