-- ============================================
-- MULTI-TENANT MIGRATION
-- Cole no SQL Editor do Supabase e clique Run
-- ============================================

-- Tabela de Lojas (cada loja é um tenant)
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  plan TEXT DEFAULT 'basic',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar store_id às tabelas existentes
ALTER TABLE users ADD COLUMN IF NOT EXISTS store_id TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS store_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS store_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS store_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS store_id TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS store_id TEXT;

-- RLS para stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_stores" ON stores FOR ALL USING (true) WITH CHECK (true);

-- Atualizar usuário admin existente com uma loja padrão
INSERT INTO stores (id, name) VALUES ('store_demo', 'TCHELO MOTORS') ON CONFLICT (id) DO NOTHING;
UPDATE users SET store_id = 'store_demo' WHERE username = 'admin';
UPDATE settings SET store_id = 'store_demo' WHERE store_id IS NULL;
