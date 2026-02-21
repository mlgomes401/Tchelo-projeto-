import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("autopage.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/vehicles", (req, res) => {
    try {
      const id = Math.random().toString(36).substring(2, 11);
      const { vehicleData } = req.body;
      
      const stmt = db.prepare("INSERT INTO vehicles (id, data) VALUES (?, ?)");
      stmt.run(id, JSON.stringify(vehicleData));
      
      res.json({ id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save vehicle" });
    }
  });

  app.get("/api/vehicles/:id", (req, res) => {
    try {
      const stmt = db.prepare("SELECT data FROM vehicles WHERE id = ?");
      const row = stmt.get(req.params.id) as { data: string } | undefined;
      
      if (!row) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      res.json(JSON.parse(row.data));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
