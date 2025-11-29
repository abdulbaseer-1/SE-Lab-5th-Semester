import AxeBuilder from "@axe-core/playwright";
import PDFDocument from "pdfkit";
import fs from "fs";

export async function runAccessibilityScan(page) {
  await page.waitForLoadState("load");

  const results = await new AxeBuilder({ page })
    .include("body")
    .analyze();

  return results;
}

export async function generateReportPDF(results, outPath = "accessibility-report.pdf") {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    doc.fontSize(18).text("WCAG Accessibility Report", { underline: true }).moveDown();
    doc.fontSize(12).text(`Violations found: ${results.violations.length}\n\n`);

    results.violations.forEach((v, i) => {
      doc.fontSize(14).text(`${i + 1}. ${v.id} (${v.impact})`, { underline: true });
      doc.fontSize(12).text(v.description);
      doc.text("Help: " + v.helpUrl);

      v.nodes.forEach((node, ni) => {
        doc.text(`  Node ${ni + 1}: ${node.html}`);
      });

      doc.moveDown();
    });

    doc.end();

    stream.on("finish", () => resolve(outPath));
    stream.on("error", reject);
  });
}
