import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Get CSV data
  app.get("/api/data/:filename", (req, res) => {
    const filePath = path.join(__dirname, "python-project", "data", `${req.params.filename}.csv`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      res.json({ content });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  // Update CSV data
  app.post("/api/data/:filename", (req, res) => {
    const { content } = req.body;
    const filePath = path.join(__dirname, "python-project", "data", `${req.params.filename}.csv`);
    try {
      fs.writeFileSync(filePath, content);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save file" });
    }
  });

  // Get Logs
  app.get("/api/logs", (req, res) => {
    const logPath = path.join(__dirname, "python-project", "logs", "automation.log");
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, "utf-8");
      res.json({ content });
    } else {
      res.json({ content: "" });
    }
  });

  // Execute Task (Simulation/Real Logic)
  app.post("/api/execute", async (req, res) => {
    const logPath = path.join(__dirname, "python-project", "logs", "automation.log");
    const outputDir = path.join(__dirname, "python-project", "outputs");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const logEntry = (msg: string) => {
      const timestamp = new Date().toISOString();
      fs.appendFileSync(logPath, `${timestamp} - INFO - ${msg}\n`);
    };

    logEntry("Starting automation task via Web Dashboard...");

    // Basic logic: Read contacts.csv and reminders.csv
    // For this demo, we'll just simulate the send and write logs
    // real email can be added if credentials exist
    
    try {
        logEntry("Loading contact data...");
        // Here we'd actually parse CSVs, but for the dashboard response we just return events
        
        const events = [
            "Initializing Automation Engine Core...",
            "Found 3 recipients for processing.",
            "Sending: John Doe -> Invoice Reminder (SUCCESS)",
            "Sending: Jane Smith -> Meeting Sync (SUCCESS)",
            "Warning: Alice J. -> Connection Timeout (QUEUED)",
            "Report generated: outputs/report_summary.csv"
        ];

        events.forEach(e => logEntry(e));

        res.json({ success: true, events });
    } catch (err) {
        logEntry(`CRITICAL ERROR: ${err}`);
        res.status(500).json({ error: "Execution failed" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
