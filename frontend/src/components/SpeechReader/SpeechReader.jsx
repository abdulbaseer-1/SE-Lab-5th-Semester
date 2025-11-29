// speechReader.js
/**
 * Speech reader util — reads a friendly summary of the page structure.
 * Usage:
 *   import { readPageStructure, stopReading } from './speechReader';
 *   readPageStructure(document); // or iframe.contentDocument
 */
const URL = import.meta.env.VITE_BACKEND_URL;

export function speak(text, { rate = 1.0, pitch = 1.0, lang = "en-US" } = {}) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech Synthesis not supported in this browser.");
    return Promise.reject(new Error("Speech not supported"));
  }
  return new Promise((res) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = pitch;
    utter.lang = lang;
    utter.onend = () => res();
    window.speechSynthesis.speak(utter);
  });
}

export function stopReading() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/**
 * Extracts high-level structure from a root Document or Element
 * Returns an array of strings (lines) to read.
 */
export function extractStructure(root = document) {
  // Headings summary
  const headings = Array.from(root.querySelectorAll("h1,h2,h3,h4")).map((h) => ({
    tag: h.tagName,
    text: h.textContent.trim().replace(/\s+/g, " "),
  }));

  // Landmarks/regions (main, nav, aside, footer)
  const regions = Array.from(root.querySelectorAll("main, nav, header, footer, aside")).map(
    (r) => r.tagName
  );

  // Links and buttons count
  const links = root.querySelectorAll("a[href]").length;
  const buttons = root.querySelectorAll("button, [role='button']").length;
  const forms = root.querySelectorAll("form").length;
  const imagesWithoutAlt = Array.from(root.querySelectorAll("img")).filter(
    (img) => !img.getAttribute("alt") || img.getAttribute("alt").trim() === ""
  ).length;

  const lines = [];
  lines.push(`Page summary: ${headings.length} headings, ${links} links, ${buttons} buttons.`);
  if (regions.length) lines.push(`Found regions: ${regions.join(", ")}.`);
  if (headings.length) {
    lines.push("Top headings:");
    headings.slice(0, 5).forEach((h) => lines.push(`${h.tag} ${h.text}`));
  }
  if (imagesWithoutAlt > 0) lines.push(`There are ${imagesWithoutAlt} images missing alternative text.`);
  if (forms > 0) lines.push(`This page contains ${forms} form(s).`);

  return lines;
}

/**
 * High-level: read page structure aloud.
 * root can be a Document or an Element (like an iframe.contentDocument)
 */
export async function readPageStructure(root = document, options = {}) {
  stopReading();
  const lines = extractStructure(root);
  for (const line of lines) {
    // await each line to make speech sequential
    // small pause can be added between lines if desired
    // use options (rate/pitch) for customization
    // Note: speaking sequentially uses await so UI can cancel via stopReading()
    if (window.speechSynthesis.speaking) {
      stopReading(); // avoid overlapping voices
    }
    // speak returns a promise that resolves on utterance end
    // but when speechSynthesis is canceled, behavior may vary by browser
    // keep it simple:
    try {
      // eslint-disable-next-line no-await-in-loop
      await speak(line, options);
    } catch (e) {
      console.warn("Speech failed", e);
    }
  }
}
