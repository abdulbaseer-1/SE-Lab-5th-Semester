//import { loadWebsite } from "../services/playwrightService.js";
import { runAccessibilityScan, generateReportPDF } from "../services/AccessibilityService.js";
import * as playwright from "playwright";
import fs from "fs";

export async function openWebsite(req, res) {
  try {
    const { url } = req.query;

    if (!url) return res.status(400).send("Missing URL");

    const html = await loadWebsite(url);
    res.send(html);

  } catch (e) {
    res.status(400).send("Error: " + e.message);
  }
}

export async function scanAccessibility(req, res) {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("URL parameter is missing.");
  }

  // File path for the generated PDF
  const path = `./${Date.now()}-report.pdf`; // Use a unique path to avoid conflicts
  
  // Define variables outside try/catch for clean-up access
  let browser;
  let context; 

  try {
    // 1. Launch the browser (Assuming 'playwright' is properly imported as an alias, e.g., 
    //    import * as playwright from "playwright";)
    browser = await playwright.chromium.launch();

    // 2. 💡 FIX: Create a new context
    context = await browser.newContext();

    // 3. 💡 FIX: Create the page from the context
    const page = await context.newPage(); 
    
    await page.goto(url);

    const results = await runAccessibilityScan(page);
    
    await generateReportPDF(results, path); 
    console.log("generated report for url : " + url);

    await browser.close(); // Closes all contexts and pages

    if (!fs.existsSync(path))
      return res.status(500).send("Failed to generate report");

    // 1. Send the file for download
    res.download(path, "accessibility-report.pdf", (err) => {
        // 2. This callback runs after the headers are sent/download starts
        if (err) {
            console.error("Error during file download:", err);
            // Don't send status/response header again if already sent
        }
        
        // 3. Clean up the generated file from the server's disk
        fs.unlink(path, (unlinkErr) => {
            if (unlinkErr) console.error("Failed to delete report file:", unlinkErr);
            else console.log(`Deleted report file: ${path}`);
        });
    });

  } catch (e) {
    console.error(e);
    
    // Attempt graceful browser close in case of error
    if (browser) {
        try {
            await browser.close();
        } catch (closeError) {
            console.error("Failed to close browser on error:", closeError);
        }
    }

    // Ensure file cleanup on failure as well
    if (fs.existsSync(path)) {
        fs.unlink(path, (unlinkErr) => {
            if (unlinkErr) console.error("Failed to delete report file on error:", unlinkErr);
        });
    }
    // Ensure we send a proper error message string
    const errorMessage = e instanceof Error ? e.message : String(e);
    res.status(500).send("Scan failed: " + errorMessage);
  }
}