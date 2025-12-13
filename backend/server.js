// server.js
import express from "express";
import http from "http";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

import cors from "./middleware/CORS.js";
import logger from "./utils/logger.js";
import { wsHandler } from "./services/wsHandler.js";
import playwright_routes from "./routes/playwright_routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../config/.env") });

const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(logger);
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/playwright", playwright_routes);

app.get("/", (req, res) => {
  res.send("✅ Playwright Stream Server Running");
});

// 404
app.use(/.*/, (req, res) => {
  res.status(404).json({ error: "Page not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// HTTP server
const server = http.createServer(app);

// Single WebSocketServer for both control and audio
const wss = new WebSocketServer({ server });

// Attach control connection handlers
wsHandler(wss);

// Also route incoming connections that are audio to audioHandler
wss.on("connection", (ws, req) => {
  const url = req.url || "";
  if (url.startsWith("/audio")) {
    handleAudioSocket(ws, req);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`HTTP + WS server running on port ${PORT}`);
  console.log(`Frontend should connect via: ws://localhost:${PORT}`);
});
