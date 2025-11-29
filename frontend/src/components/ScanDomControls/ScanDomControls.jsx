// ScanControls.jsx
import React from "react";
import axios from "axios";

/**
 * Sends a GET request to the backend to run the accessibility scan.
 * Expects a PDF (binary) from the server and triggers a download in the browser.
 */

const URL = import.meta.env.VITE_BACKEND_URL;

export const requestScan = async (url) => {
  if (!url) return alert("Website URL not provided.");

  try {
    const response = await axios.get("/api/playwright/scan-accessibility", { /* dont need to append URL because already appending using proxy in vite.config */
      params: { url },
      responseType: "blob", // We expect a PDF...
      validateStatus: () => true // Accept all status codes so we can handle errors manually
    });

    //checking the url going to the backend
    console.log("url sent back : " + url);

    // CHECK: Did the server return an error?
    if (response.status !== 200) {
        // Convert the Blob (error text) back to a string to read the error
        const errorText = await response.data.text();
        console.error("Server Error:", errorText);
        console.log("error : " + errorText);
        alert(`Server Error: ${errorText}`);
        return; 
    }

    // CHECK: Is the content type actually a PDF?
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/pdf')) {
        const errorText = await response.data.text();
        alert("Received invalid file format: " + errorText);
        console.log("error : " + errorText);
        return;
    }

    // --- Only proceed to download if status is 200 AND it is a PDF ---
    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `accessibility-report-${Date.now()}.pdf`; 
    document.body.appendChild(link); // Required for Firefox
    link.click();
    link.remove();
    window.URL.revokeObjectURL(link.href);

  } catch (error) {
    console.log("error : " + error);
    console.error("Accessibility Scan Error:", error);
    console.log("error : " + error);
    alert("Failed to connect to the server.");
  }
};

/**
 * UI Component: Renders the scan button.
 */
export default function ScanControls({ className,url }) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => requestScan(url)}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Run Accessibility Scan
      </button>
    </div>
  );
}