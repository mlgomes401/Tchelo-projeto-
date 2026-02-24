import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
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
    client_email TEXT,
    client_phone TEXT,
    origin TEXT DEFAULT 'Site',
    status TEXT DEFAULT 'Novo',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
  );
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    status TEXT DEFAULT 'Ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'Concluído',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  INSERT OR IGNORE INTO settings (key, value) VALUES ('storeName', 'AutoPage Pro');
`);

// Safe migrations for existing DB
try { db.exec("ALTER TABLE leads ADD COLUMN client_email TEXT DEFAULT ''"); } catch { }
try {
  db.exec(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'Concluído',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
} catch { }
try {
  db.exec(`CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    status TEXT DEFAULT 'Ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
} catch { }

// Create default admin user if none exists
const checkUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
if (checkUsers.count === 0) {
  const adminId = nanoid(10);
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (id, username, password_hash, name, role) VALUES (?, ?, ?, ?, ?)").run(adminId, "admin", hash, "Administrador", "admin");
}

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

  app.put("/api/vehicles/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { vehicleData } = req.body;
      db.prepare("UPDATE vehicles SET data = ? WHERE id = ?").run(JSON.stringify(vehicleData), id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(500).json({ error: "Failed to update vehicle" });
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

  app.delete("/api/vehicles/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM vehicles WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // API Routes - Authentication
  app.post("/api/auth/login", (req, res) => {
    try {
      const { username, password } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;

      if (user && bcrypt.compareSync(password, user.password_hash)) {
        // Here we could implement JWT, but for simplicity retaining the same simple token system currently used
        res.json({ token: `autopage_${user.role}_${user.id}`, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error("Login error: ", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // API Routes - Users Management
  app.get("/api/users", (req, res) => {
    try {
      const stmt = db.prepare("SELECT id, username, name, role, created_at FROM users ORDER BY created_at DESC");
      const rows = stmt.all();
      res.json(rows);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", (req, res) => {
    try {
      const { name, username, password, role } = req.body;

      const existingUser = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
      if (existingUser) {
        return res.status(400).json({ error: "Nome de usuário já existe" });
      }

      const id = nanoid(10);
      const hash = bcrypt.hashSync(password, 10);

      const stmt = db.prepare("INSERT INTO users (id, username, password_hash, name, role) VALUES (?, ?, ?, ?, ?)");
      stmt.run(id, username, hash, name, role || 'user');

      res.json({ id, success: true });
    } catch (error) {
      console.error("Error saving user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    try {
      const { id } = req.params;

      // Prevent deleting the last admin
      const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as any;
      const targetUser = db.prepare("SELECT role FROM users WHERE id = ?").get(id) as any;

      if (targetUser && targetUser.role === 'admin' && adminCount.count <= 1) {
        return res.status(403).json({ error: "Não é possível excluir o único administrador do sistema." });
      }

      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // API Routes - CRM Leads
  app.post("/api/leads", (req, res) => {
    try {
      const { vehicleId, vehicleName, clientName, clientEmail, clientPhone, origin } = req.body;
      const stmt = db.prepare("INSERT INTO leads (vehicle_id, vehicle_name, client_name, client_email, client_phone, origin) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run(vehicleId, vehicleName, clientName || 'Interessado', clientEmail || '', clientPhone || '', origin || 'Site');
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

  // API Routes - Clients
  app.get("/api/clients", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM clients ORDER BY created_at DESC");
      const rows = stmt.all();
      res.json(rows);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", (req, res) => {
    try {
      const { name, email, phone, cpf, status } = req.body;
      const id = nanoid(10);
      const stmt = db.prepare("INSERT INTO clients (id, name, email, phone, cpf, status) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run(id, name, email || '', phone || '', cpf || '', status || 'Ativo');
      res.json({ id, success: true });
    } catch (error) {
      console.error("Error saving client:", error);
      res.status(500).json({ error: "Failed to save client" });
    }
  });

  app.delete("/api/clients/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM clients WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Dashboard Stats
  app.get("/api/transactions", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM transactions ORDER BY created_at DESC");
      const rows = stmt.all();
      res.json(rows);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", (req, res) => {
    try {
      const { description, category, amount, type, date, status } = req.body;
      const id = nanoid(10);
      const stmt = db.prepare(
        "INSERT INTO transactions (id, description, category, amount, type, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );
      stmt.run(id, description, category, amount, type, date, status || 'Concluído');
      res.json({ id, success: true });
    } catch (error) {
      console.error("Error saving transaction:", error);
      res.status(500).json({ error: "Failed to save transaction" });
    }
  });

  app.delete("/api/transactions/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // ✅ Dashboard Stats
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

  // API Routes - Settings
  app.get("/api/settings", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM settings");
      const rows = stmt.all();
      const settings = rows.reduce((acc: any, row: any) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", (req, res) => {
    try {
      const settings = req.body;
      const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");

      const transaction = db.transaction((items) => {
        for (const [key, value] of Object.entries(items)) {
          stmt.run(key, value);
        }
      });

      transaction(settings);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
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
