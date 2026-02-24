-- ============================================
-- TCHELO MOTORS CRM - Supabase Setup SQL
-- Execute no Supabase -> SQL Editor -> New Query
-- ============================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Veículos
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'Disponível',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id TEXT,
  vehicle_name TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  origin TEXT DEFAULT 'Site',
  status TEXT DEFAULT 'Novo',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  status TEXT DEFAULT 'Ativo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'Concluído',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Configuração padrão da loja
INSERT INTO settings (key, value) VALUES ('storeName', 'TCHELO MOTORS') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('primaryColor', '#E31837') ON CONFLICT (key) DO NOTHING;

-- Usuário admin padrão (senha: admin123)
-- Hash gerado com bcrypt rounds=10
INSERT INTO users (id, username, password_hash, name, role)
VALUES (
  'admin001',
  'admin',
  '$2b$10$rJMsrZCJkHBkUcqGNwBKxeY2WdGjYfDTM5LRDxB6hZAP7bEsOrJQG',
  'Administrador',
  'admin'
) ON CONFLICT (username) DO NOTHING;

-- Desabilitar RLS para uso via anon key (ou configurar policies conforme necessidade)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies: permitir tudo via anon key (simplificado para MVP)
CREATE POLICY "allow_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_vehicles" ON vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_settings" ON settings FOR ALL USING (true) WITH CHECK (true);
