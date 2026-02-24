import Database from "better-sqlite3";
const db = new Database("database.sqlite");

const vehicleData = {
    model: "Porsche 911",
    version: "GT3 RS",
    year: "2024",
    km: "0",
    price: "1850000",
    city: "São Paulo - SP",
    differentials: "Pacote Weissach\nFreios de Cerâmica\nSistema de Som Bose\nEixo Traseiro Direcional",
    whatsapp: "11999999999",
    instagram: "@autopage_elite",
    images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000"]
};

const id = "porsche-911-gt3";
const stmt = db.prepare("INSERT OR REPLACE INTO vehicles (id, data, status) VALUES (?, ?, ?)");
stmt.run(id, JSON.stringify(vehicleData), "Disponível");

console.log("Sample vehicle added!");
db.close();
