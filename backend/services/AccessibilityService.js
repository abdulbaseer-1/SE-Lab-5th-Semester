// accessibilityReport.js
import AxeBuilder from "@axe-core/playwright";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Run accessibility scan on a Playwright page using axe-core-playwright.
 * @param {import('playwright').Page} page
 * @returns {Promise<Object>} axe results object
 */
export async function runAccessibilityScan(page) {
  try {
    // Wait until page load completes (safe for many sites)
    await page.waitForLoadState("load", { timeout: 20000 });

    const results = await new AxeBuilder({ page })
      .include("body")
      .analyze();

    return results;
  } catch (err) {
    // Re-throw to let caller handle logging / user feedback
    throw new Error("Accessibility scan failed: " + (err.message || String(err)));
  }
}

/**
 * Sanitize HTML snippets returned by axe to remove unprintable/control characters
 * and truncate to a reasonable length for the PDF.
 * @param {string} html
 * @param {number} maxLen
 * @returns {string}
 */
function sanitizeHtmlForPdf(html = "", maxLen = 800) {
  // Convert to string and replace nulls/control characters except common whitespace
  let s = String(html)
    // Replace control characters (except \t \n \r) with a space
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]+/g, " ")
    // Collapse multiple whitespace into a single space (preserve newlines a bit)
    .replace(/\s+/g, " ")
    .trim();

  if (s.length > maxLen) {
    s = s.slice(0, maxLen - 3).trim() + "...";
  }
  return s || "[html snippet omitted]";
}

/**
 * Generate a PDF report from the axe results.
 * @param {Object} results - axe results object
 * @param {string} outPath - output file path for the PDF (optional). If omitted, uses ./accessibility-report-<timestamp>.pdf
 * @param {Object} opts - optional settings { url }
 * @returns {Promise<string>} resolves to the outPath on success
 */
export async function generateReportPDF(results, outPath = null, opts = {}) {
  return new Promise((resolve, reject) => {
    try {
      if (!results || typeof results !== "object") {
        return reject(new Error("Invalid results object"));
      }

      const timestamp = Date.now();
      const filename =
        outPath ||
        path.resolve(process.cwd(), `accessibility-report-${timestamp}.pdf`);

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(filename);
      doc.pipe(stream);

      // Header
      doc.font("Helvetica-Bold").fontSize(20).fillColor("black").text("WCAG Accessibility Report", { align: "left" });
      doc.moveDown(0.5);

      // Meta info line
      const urlLine = opts.url ? `URL: ${opts.url}` : "URL: (not provided)";
      const dateLine = `Generated: ${new Date().toLocaleString()}`;
      doc.font("Helvetica").fontSize(10).fillColor("gray").text(`${urlLine}    ${dateLine}`);
      doc.moveDown(1);

      // Summary
      const totalViolations = Array.isArray(results.violations) ? results.violations.length : 0;
      doc.font("Helvetica-Bold").fontSize(12).fillColor("black").text(`Violations found: ${totalViolations}`);
      doc.moveDown(0.5);

      // Count by impact
      const counts = { critical: 0, serious: 0, moderate: 0, minor: 0, unknown: 0 };
      (results.violations || []).forEach((v) => {
        const impact = (v.impact || "unknown").toLowerCase();
        counts[impact] = (counts[impact] || 0) + 1;
      });

      // Draw a compact table-like summary
      const summaryLabels = ["critical", "serious", "moderate", "minor", "unknown"];
      const colorFor = (impact) => {
        switch (impact) {
          case "critical": return "#b00000"; // dark red
          case "serious": return "#e65100";  // orange
          case "moderate": return "#f9a825"; // amber
          case "minor": return "#2e7d32";    // green
          default: return "#6c757d";         // gray
        }
      };

      summaryLabels.forEach((label) => {
        const text = `${label.toUpperCase()}: ${counts[label] || 0}`;
        doc.fillColor(colorFor(label)).font("Helvetica-Bold").fontSize(10).text(text, { continued: true, underline: false });
        doc.fillColor("black").font("Helvetica").text("   ", { continued: true });
      });
      doc.moveDown(1);

      // If no violations, end early with a friendly message
      if ((results.violations || []).length === 0) {
        doc.moveDown(0.5);
        doc.font("Helvetica").fontSize(12).fillColor("green").text("No accessibility violations found by axe-core.", { align: "left" });
        doc.end();
        stream.on("finish", () => resolve(filename));
        stream.on("error", (err) => reject(err));
        return;
      }

      // Violations detail
      doc.addPage(); // Start details on a new page to keep summary clean
      doc.font("Helvetica-Bold").fontSize(16).fillColor("black").text("Violation Details");
      doc.moveDown(0.5);

      (results.violations || []).forEach((v, i) => {
        // Violation header
        const header = `${i + 1}. ${v.id} (${v.impact || "unknown"})`;
        doc.font("Helvetica-Bold").fontSize(12).fillColor(colorFor((v.impact || "unknown").toLowerCase())).text(header);
        doc.moveDown(0.15);

        // Description and help
        if (v.description) {
          doc.font("Helvetica").fontSize(10).fillColor("black").text(v.description);
        }
        if (v.help) {
          doc.font("Helvetica-Oblique").fontSize(9).fillColor("black").text(`Help: ${v.help}`);
        }
        if (v.helpUrl) {
          // Print help URL as plain text (no link)
          doc.font("Helvetica").fontSize(9).fillColor("blue").text(`Reference: ${v.helpUrl}`);
        }

        doc.moveDown(0.2);

        // Affected nodes
        if (Array.isArray(v.nodes) && v.nodes.length > 0) {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("black").text("Affected nodes:");
          doc.moveDown(0.1);
          v.nodes.forEach((node, ni) => {
            const snippet = sanitizeHtmlForPdf(node.html || node.target?.join(", ") || "[no html]");
            // Node header
            doc.font("Helvetica-Bold").fontSize(9).fillColor("#333333").text(`Node ${ni + 1}:`, { continued: true });
            doc.font("Helvetica").fontSize(9).fillColor("#333333").text(` ${node.failureSummary || node.html ? "" : "[no summary]"}`);
            doc.moveDown(0.05);

            // Insert the snippet in monospace for readability
            doc.font("Courier").fontSize(8).fillColor("black").text(snippet, {
              width: 470,
              align: "left",
              indent: 10,
              continued: false
            });
            doc.moveDown(0.25);
          });
        }

        doc.moveDown(0.4);

        // Add a page break if needed to avoid cramped layout
        if (doc.y > 700) doc.addPage();
      });

      // Finalize
      doc.end();

      stream.on("finish", () => resolve(filename));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}
