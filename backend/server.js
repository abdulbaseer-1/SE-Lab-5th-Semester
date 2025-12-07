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

// ---------- Paths ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../config/.env") });

const PORT = process.env.PORT || 5000;

const app = express();

// ---------- Middleware ----------
app.use(logger);
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Routes ----------
app.use("/api/playwright", playwright_routes);

app.get("/", (req, res) => {
  res.send("✅ Playwright Stream Server Running");
});

// 404 handler
app.use(/.*/, (req, res) => {
  res.status(404).json({ error: "Page not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// ---------- HTTPS Server ----------
const server = http.createServer(app);

// ---------- WebSocket Server (WSS) ----------
const ws = new WebSocketServer({ server });
wsHandler(ws); // Pass your handler function

// ---------- MongoDB + Start Server ----------
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(`HTTP + WS server running on port ${PORT}`);
      console.log(`Frontend should connect via: ws://localhost:${PORT}`);
    });
  // })
  // .catch((error) => console.error("Connection failed:", error));
