# 🌐 Accessibility Simulator Web Application

**Developers:** 
Abdul Baseer (22pwbcs0913)
Saad Abdullah (23pwbcs1055)
Muhammad Mohsin (23pwbcs)
Hooria Altaf (23pwbcs)

**Course:** Software Engineering – Semester Project

---

## 📌 Overview

The **Accessibility Simulator Web Application** allows users to load any website and preview how it appears to individuals with disabilities.

It streams a **real Playwright-controlled browser** to the frontend, simulates multiple impairments, and performs **WCAG accessibility scans** with automated PDF reports.

---

## 🎯 Key Features

### 🔍 Accessibility Simulation

* Color-blindness filters
* Low-vision filters (blur, zoom, contrast)
* Jitter cursor (motor impairment)
* High-contrast + brightness filters
* Multiple filters can run simultaneously

### 🖥️ Live Browser Streaming

* Real Chromium instance (Playwright)
* Streams frames via WebSocket
* Provides DOM snapshots
* Supports remote interaction (click, scroll, typing)

### ♿ WCAG Accessibility Scanner

* Uses **axe-core/playwright**
* Generates a **professional PDF report**
* Summaries + violations + sanitized HTML snippets

### 📄 PDF Report Generation

* Styled headers
* Summary tables (critical/serious/moderate/minor)
* Truncated + sanitized failing nodes
* Timestamp + URL metadata

---

## 🏗️ System Architecture (Overview Diagram)

```
┌──────────────┐    WebSocket Frames     ┌──────────────┐
│   Frontend    │ <────────────────────── │   Backend     │
│ React + Vite  │ ───── Input Events ───► │ Node + WS     │
│ Filters + UI  │                          │ Playwright    │
└──────┬────────┘      HTTP Requests       └───────┬──────┘
       │                                           │
       ▼                                           ▼
     Browser                                    Target
     Client                                     Website
```

---

## 📦 Project Structure

```
project/
├── backend/
│   ├── server.js
│   ├── services/
│   │   ├── playwrightService.js
│   │   ├── wsHandler.js
│   │   └── accessibilityReport.js
│   ├── controllers/
│   ├── routes/
│   └── config/.env
└── frontend/
    ├── src/components/
    ├── src/hooks/useStreamControls.js
    ├── App.jsx
    └── vite.config.js
```

---

## 🛠️ Requirements

**Backend:**

* Node 18+
* Playwright (Chromium)
* Axe-core/playwright
* PDFKit

**Frontend:**

* Node 16+
* Vite
* React

---

## ⚙️ Installation & Setup

### 1️⃣ Clone

```bash
git clone <repo-url>
cd project
```

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
npx playwright install
```

### Create `.env`

```
PORT=5000
```

### Run server

```bash
npm run dev
```

Expected output:

```
HTTP + WS server running on port 5000
Frontend should connect via ws://localhost:5000
```

---

## 🖥️ Frontend Setup

```bash
cd frontend
npm install
```

### Create `.env`

```
VITE_BACKEND_HOST_WS=localhost:5000
VITE_BACKEND_HOST_HTTP=http://localhost:5000
```

### Run frontend

```bash
npm run dev
```

---

## 🔌 WebSocket Protocol (Backend ↔ Frontend)

### Messages Frontend Sends → Backend

| Type                             | Purpose                      |
| -------------------------------- | ---------------------------- |
| `start`                          | Start streaming a website    |
| `stop`                           | Stop session                 |
| `click`                          | Mouse click with coordinates |
| `scroll`                         | Scroll page                  |
| `keypress` / `keydown` / `keyup` | Keyboard events              |

Example:

```json
{
  "type": "start",
  "url": "https://example.com"
}
```

---

### Backend Sends → Frontend

| Type          | Description       |
| ------------- | ----------------- |
| `frame`       | Base64 JPEG frame |
| `dom`         | DOM snapshot      |
| `scan_result` | WCAG scan results |
| `error`       | Any error message |

---

## 🌐 REST API

### `GET /api/playwright/scan-accessibility?url=...`

Runs axe-core scan and **returns PDF download**.

### `GET /api/playwright/open-website?url=...`

Returns raw HTML (debug use only).

---

## 📚 Domain Model (Concepts)

| Class                   | Attributes                   | Actions                       |
| ----------------------- | ---------------------------- | ----------------------------- |
| **UserSession**         | ws, browser, page, streaming | start(), stop(), stream()     |
| **BrowserController**   | viewport, state              | click(), scroll(), keyPress() |
| **AccessibilityReport** | violations, stats            | generatePDF()                 |
| **FilterManager**       | activeFilters[]              | applyFilters()                |
| **StreamManager**       | buffer[], FPS                | pushFrame(), throttle()       |

---

## 📘 Class Diagram (Textual Summary)

```
UserSession
  - browser
  - page
  - streaming
  + startSession()
  + stopSession()

StreamManager
  - buffer
  + startStreaming()
  + stopStreaming()

BrowserController
  + handleClick()
  + handleScroll()
  + handleKey()

AccessibilityScanner
  + runAccessibilityScan()

AccessibilityReport
  + generatePDF()
```

Relationships:

* UserSession **has-a** BrowserController
* StreamManager **uses** UserSession
* AccessibilityReport **uses** AccessibilityScanner

---

## 🔁 Activity Diagram (Streaming Process)

**Start → Connect WebSocket → Launch Playwright → Load URL → Enter Streaming Loop → Send Frame → Send DOM → Sleep → Repeat → Stop → Close Browser**

---

## 🎭 Use Case Summary

**Actor:** Developer / Tester
**System:** Accessibility Simulator

| Use Case          | Description                                    |
| ----------------- | ---------------------------------------------- |
| Start Streaming   | Load website and begin video feed              |
| Interact Remotely | Click, scroll, type                            |
| Apply Filters     | Add color-blindness, low-vision, jitter cursor |
| Run WCAG Scan     | Generate accessibility report                  |
| Download Report   | Get PDF summary                                |

---

## 🐞 Troubleshooting

### ❌ WebSocket closes instantly

Fix:

* Backend not running
* Wrong WS URL
* Firewall blocking

### ❌ Playwright “Executable Doesn't Exist”

Run:

```bash
npx playwright install
```

### ❌ PDF generated but frontend shows error

Cause: Express double response.
Fix is already applied in code.

---

## 📝 License

Educational use only – Software Engineering Lab Project.
