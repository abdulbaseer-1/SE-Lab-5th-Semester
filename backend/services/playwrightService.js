// services/playwrightService.js
import { chromium } from "playwright";
import crypto from "crypto";

//
// sessions: Map<sid, session>
// session = {
//   sid,
//   ownerWs,
//   browser,
//   page,
//   audioSocket,
//   streaming,
//   lastFrameTime,
//   lastDomTime,
//   fpsCapMs
// }
//
const sessions = new Map();

// simple sleep helper
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

//
// Query helpers
//
export function getSessionById(sid) {
  return sessions.get(sid) || null;
}

export function getSessionByOwnerWs(ownerWs) {
  for (const session of sessions.values()) {
    if (session.ownerWs === ownerWs) return session;
  }
  return null;
}

export function getPage(ownerWs) {
  const session = getSessionByOwnerWs(ownerWs);
  return session?.page || null;
}

//
// Stop session by WebSocket
//
export async function stopSession(ownerWs) {
  const session = getSessionByOwnerWs(ownerWs);
  if (!session) return;
  await stopSessionBySid(session.sid);
}

//
// Stop session by sid
//
export async function stopSessionBySid(sid) {
  const session = sessions.get(sid);
  if (!session) return;

  session.streaming = false;

  // close audio socket
  if (session.audioSocket) {
    try { session.audioSocket.close(); } catch (_) {}
    session.audioSocket = null;
  }

  // close browser
  try { await session.browser.close(); } catch (_) {}

  // closing the owner websocket is optional. Keep it alive.
  // try { session.ownerWs?.close?.(); } catch (_) {}

  sessions.delete(sid);
  console.log(`Session stopped sid=${sid}`);
}

//
// Start session (creates browser + page)
//
// export async function startSession(ownerWs, url, sid) {
//   try {
//     // owner already had a session?
//     const old = getSessionByOwnerWs(ownerWs);
//     if (old) {
//       await stopSessionBySid(old.sid);
//     }

//     // need to run in headful mode for audio stream capture, but hiding ui using tricks on windows and some Vms for Linux, not hidden in mac
//     const browser = await chromium.launch({
//     headless: false,
//     args: [
//       "--autoplay-policy=no-user-gesture-required",
//       "--no-sandbox",
//       "--use-fake-ui-for-media-stream",
//       "--window-position=-32000,-32000"
//     ],
//   });


//     const page = await browser.newPage({
//       viewport: { width: 1280, height: 720 }
//     });

//     // page logger
//     await page.exposeFunction("__serverLog", (msg) => {
//       console.log(`[page][${sid}]`, msg);
//     });

//     // load target url
//     await page.goto(url, {
//       waitUntil: "domcontentloaded",
//       timeout: 15000
//     });


//     // HoH node exposed
// // after page.goto() in startSession()
// await page.evaluate(() => {
//   window.setHardOfHearingGain = (gain) => {
//     if (!window.audioCtx) window.audioCtx = new AudioContext();
//     if (!window.hohGainNode) {
//       window.hohGainNode = window.audioCtx.createGain();
//       window.hohGainNode.connect(window.audioCtx.destination);

//       const elements = Array.from(document.querySelectorAll("audio, video"));
//       elements.forEach(el => {
//         try {
//           const stream = el.captureStream();
//           if (stream) {
//             const src = window.audioCtx.createMediaStreamSource(stream);
//             src.connect(window.hohGainNode);
//           }
//         } catch (_) {}
//       });
//     }
//     window.hohGainNode.gain.value = gain;
//   };
// });



//     // inject audio capture script
//     // await injectAudioCapture(page, sid);

//     // create session
//     const session = {
//       sid,
//       ownerWs,
//       browser,
//       page,
//       streaming: false,
//       audioSocket: null,
//       lastFrameTime: 0,
//       lastDomTime: 0,
//       fpsCapMs: 50
//     };

//     sessions.set(sid, session);
//     return session;

//   } catch (err) {
//     console.error("startSession error:", err?.message || err);
//     try {
//       ownerWs.send(JSON.stringify({
//         type: "error",
//         message: "Failed to open page: " + (err?.message || err)
//       }));
//     } catch (_) {}
//     return null;
//   }
// }

export async function startSession(ownerWs, url, sid) {
  try {
    // Stop any existing session for this WS
    const old = getSessionByOwnerWs(ownerWs);
    if (old) {
      await stopSessionBySid(old.sid);
    }

    // Launch headful browser
    const browser = await chromium.launch({
      headless: false,
      args: [
        "--autoplay-policy=no-user-gesture-required",
        "--no-sandbox",
        "--use-fake-ui-for-media-stream",
        "--window-position=-32000,-32000"
      ],
    });

    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

    // Page logger
    await page.exposeFunction("__serverLog", (msg) => console.log(`[page][${sid}]`, msg));

    // Navigate to target URL
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // --- HOH gain setup ---
    await page.evaluate(() => {
      // Create gain node if missing
    window.setHardOfHearingGain = (gain) => {
      const elements = Array.from(document.querySelectorAll("video, audio"));
      elements.forEach(el => {
        try {
          el.volume = Math.max(0, Math.min(1, gain));
        } catch (_) {}
      });
      window.__serverLog(`[HOH] element volumes set to ${gain}`);

      // Observe future media elements
      if (!window.__hohObserver) {
        const observer = new MutationObserver(() => {
          const newElements = Array.from(document.querySelectorAll("video, audio"));
          newElements.forEach(el => {
            if (!el.__hohAttached) {
              try {
                el.volume = Math.max(0, Math.min(1, gain));
                el.__hohAttached = true;
                window.__serverLog("[HOH] attached new element volume");
              } catch (_) {}
            }
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        window.__hohObserver = observer;
      }
    };



      // Watch for dynamically added media elements
      const observer = new MutationObserver(() => {
        if (!window.hohGainNode) return;
        const elements = Array.from(document.querySelectorAll("audio, video"));
        elements.forEach(el => {
          try {
            if (!el.__hohAttached) {
              const stream = el.captureStream();
              if (stream) {
                const src = window.audioCtx.createMediaStreamSource(stream);
                src.connect(window.hohGainNode);
                el.__hohAttached = true;
                window.__serverLog("[HOH] attached new media element");
              }
            }
          } catch (_) {}
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });

    // Create session object
    const session = {
      sid,
      ownerWs,
      browser,
      page,
      streaming: false,
      audioSocket: null,
      lastFrameTime: 0,
      lastDomTime: 0,
      fpsCapMs: 50
    };

    sessions.set(sid, session);
    return session;

  } catch (err) {
    console.error("startSession error:", err?.message || err);
    try {
      ownerWs.send(JSON.stringify({
        type: "error",
        message: "Failed to open page: " + (err?.message || err)
      }));
    } catch (_) {}
    return null;
  }
}



//
// Inject MediaRecorder-based audio capture into the page
//
// async function injectAudioCapture(page, sid) {
//   const wsHost =
//     (process.env.VITE_BACKEND_HOST_WS ||
//      process.env.BACKEND_HOST_WS ||
//      "localhost:5000")
//       .replace(/^wss?:\/\//, "")
//       .replace(/\/$/, "");

//   const code = `
//     (async () => {
//       try {
//         const elements = Array.from(document.querySelectorAll('audio,video'));
//         const streams = [];

//         for (const el of elements) {
//           try {
//             const s = (typeof el.captureStream === 'function') ? el.captureStream() : null;
//             if (s) streams.push(s);
//           } catch (_) {}
//         }

//         let finalStream = null;

//         if (streams.length === 1) {
//           finalStream = streams[0];
//         } else if (streams.length > 1) {
//           const ctx = new AudioContext();
//           const dest = ctx.createMediaStreamDestination();
//           for (const s of streams) {
//             try {
//               const src = ctx.createMediaStreamSource(s);
//               src.connect(dest);
//             } catch (_) {}
//           }
//           finalStream = dest.stream;
//         }

//         if (!finalStream) {
//           const ctxCandidates = [
//             window.audioCtx,
//             window.context,
//             window.audioContext,
//             window._audioContext
//           ];
//           const ctx = ctxCandidates.find(x => x && x instanceof AudioContext);
//           if (ctx) {
//             try {
//               const dest = ctx.createMediaStreamDestination();
//               if (ctx.destination?.connect) {
//                 ctx.destination.connect(dest);
//               }
//               finalStream = dest.stream;
//             } catch (_) {}
//           }
//         }

//         if (!finalStream) {
//           window.__serverLog('[audio-capture] no audio detected');
//           return;
//         }

//         const wsUrl =
//           (location.protocol === 'https:' ? 'wss://' : 'ws://') +
//           '${wsHost}' +
//           '/audio?sid=${sid}';

//         const sock = new WebSocket(wsUrl);
//         sock.binaryType = 'arraybuffer';

//         sock.onopen = () => window.__serverLog('[audio-capture] ws open');
//         sock.onerror = () => window.__serverLog('[audio-capture] ws error');

//         const rec = new MediaRecorder(finalStream, {
//           mimeType: 'audio/webm;codecs=opus'
//         });

//         rec.ondataavailable = (ev) => {
//           if (ev.data && ev.data.size > 0 && sock.readyState === 1) {
//             ev.data.arrayBuffer().then((ab) => {
//               const out = new Uint8Array(ab.byteLength + 1);
//               out[0] = 0x02; // audio tag
//               out.set(new Uint8Array(ab), 1);
//               try { sock.send(out.buffer); } catch (_) {}
//             });
//           }
//         };

//         rec.start(40);
//         window.__audioCapture = { running: true, recorder: rec, socket: sock };
//       } catch (err) {
//         window.__serverLog('[audio-capture] init error: ' + (err?.message || err));
//       }
//     })();
//   `;

//   await page.addInitScript({ content: code });
//   try { await page.evaluate(code); } catch (_) {}
// }

//
// Streaming loop (video + periodic DOM)
//
export async function startStreaming(ownerWs, url) {
  const sid = crypto.randomUUID();
  ownerWs.sessionId = sid;

  const session = await startSession(ownerWs, url, sid);
  if (!session) {
    try {
      ownerWs.send(JSON.stringify({
        type: "error",
        message: "Could not start streaming session."
      }));
    } catch (_) {}
    return;
  }

  session.streaming = true;
  console.log(`Session started: sid=${sid}`);

  const { page } = session;

  while (session.streaming && ownerWs.readyState === ownerWs.OPEN) {
    try {
      const now = Date.now();

      if (now - session.lastFrameTime < session.fpsCapMs) {
        await sleep(5);
        continue;
      }

      // screenshot frame
      const buf = await page.screenshot({ type: "jpeg", quality: 60 });
      const payload = Buffer.allocUnsafe(buf.length + 1);
      payload.writeUInt8(0x01, 0);
      buf.copy(payload, 1);

      try { ownerWs.send(payload); }
      catch (e) { break; }

      session.lastFrameTime = Date.now();

      await sleep(5);

    } catch (err) {
      console.error("Streaming error:", err?.message || err);
      try {
        ownerWs.send(JSON.stringify({
          type: "error",
          message: "Streaming error: " + (err?.message || err)
        }));
      } catch (_) {}
      break;
    }
  }

  console.log(`Session stream ended sid=${sid}`);
  await stopSession(ownerWs);
}

//
// Input handlers (click / scroll / key)
//
export async function handleClick(ws, x, y, frontendSize) {
  const session = getSessionByOwnerWs(ws);
  if (!session) return;

  (async () => {
    try {
      const vp = (await session.page.viewportSize()) || { width: 1280, height: 720 };
      const scaleX = vp.width / frontendSize.width;
      const scaleY = vp.height / frontendSize.height;
      await session.page.mouse.click(x * scaleX, y * scaleY);
    } catch (err) {
      console.error("Click error:", err.message);
    }
  })();
}

export async function handleScroll(ws, deltaY) {
  const session = getSessionByOwnerWs(ws);
  if (!session) return;

  (async () => {
    try {
      await session.page.mouse.wheel(0, deltaY);
    } catch (err) {
      console.error("Scroll error:", err.message);
    }
  })();
}

export async function handleKey(ws, data) {
  const session = getSessionByOwnerWs(ws);
  if (!session) return;

  (async () => {
    try {
      const { page } = session;

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
  })();
}
