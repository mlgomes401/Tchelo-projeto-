import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'Disponível',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT NOT NULL,
    vehicle_name TEXT NOT NULL,
    client_name TEXT,
    client_phone TEXT,
    origin TEXT DEFAULT 'Site',
    status TEXT DEFAULT 'Novo',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes - Vehicles
  app.post("/api/vehicles", (req, res) => {
    try {
      const { vehicleData } = req.body;
      const id = nanoid(10);
      
      const stmt = db.prepare("INSERT INTO vehicles (id, data) VALUES (?, ?)");
      stmt.run(id, JSON.stringify(vehicleData));
      
      res.json({ id });
    } catch (error) {
      console.error("Error saving vehicle:", error);
      res.status(500).json({ error: "Failed to save vehicle" });
    }
  });

  app.get("/api/vehicles", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM vehicles ORDER BY created_at DESC");
      const rows = stmt.all();
      res.json(rows.map((r: any) => ({ ...r, data: JSON.parse(r.data) })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare("SELECT data, status FROM vehicles WHERE id = ?");
      const row = stmt.get(id) as { data: string, status: string } | undefined;
      
      if (!row) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      const vehicleData = JSON.parse(row.data);
      res.json({ ...vehicleData, status: row.status });
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      db.prepare("UPDATE vehicles SET status = ? WHERE id = ?").run(status, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle status" });
    }
  });

  // API Routes - CRM Leads
  app.post("/api/leads", (req, res) => {
    try {
      const { vehicleId, vehicleName, clientName, clientPhone, origin } = req.body;
      const stmt = db.prepare("INSERT INTO leads (vehicle_id, vehicle_name, client_name, client_phone, origin) VALUES (?, ?, ?, ?, ?)");
      stmt.run(vehicleId, vehicleName, clientName || 'Interessado', clientPhone || '', origin || 'Site');
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving lead:", error);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.get("/api/leads", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM leads ORDER BY created_at DESC");
      const rows = stmt.all();
      res.json(rows);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.patch("/api/leads/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      if (status !== undefined) {
        db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
      }
      if (notes !== undefined) {
        db.prepare("UPDATE leads SET notes = ? WHERE id = ?").run(notes, id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare("DELETE FROM leads WHERE id = ?");
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    try {
      const totalVehicles = db.prepare("SELECT COUNT(*) as count FROM vehicles").get() as any;
      const soldVehicles = db.prepare("SELECT COUNT(*) as count FROM vehicles WHERE status = 'Vendido'").get() as any;
      const totalLeads = db.prepare("SELECT COUNT(*) as count FROM leads").get() as any;
      const closedLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Fechado'").get() as any;
      
      // Monthly sales (mocking some data for the chart if empty, or grouping by created_at)
      const monthlyData = db.prepare(`
        SELECT strftime('%m', created_at) as month, COUNT(*) as count 
        FROM leads 
        WHERE status = 'Fechado' 
        GROUP BY month
      `).all();

      res.json({
        totalVehicles: totalVehicles.count,
        soldVehicles: soldVehicles.count,
        totalLeads: totalLeads.count,
        conversionRate: totalLeads.count > 0 ? ((closedLeads.count / totalLeads.count) * 100).toFixed(1) : 0,
        monthlyData
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
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
    // Serve static files in production
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
