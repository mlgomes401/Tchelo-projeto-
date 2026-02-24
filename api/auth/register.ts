import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { storeName, storeWhatsapp, storeEmail, username, password, name } = req.body || {};
        if (!storeName || !username || !password || !name) {
            return res.status(400).json({ error: 'Campos obrigatórios: nome da loja, usuario, senha e nome' });
        }

        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

        // Verificar se username já existe
        const { data: existing } = await supabase.from('users').select('id').eq('username', username).single();
        if (existing) return res.status(409).json({ error: 'Usuário já existe' });

        // Criar store
        const storeId = `store_${Date.now()}`;
        const { error: storeErr } = await supabase.from('stores').insert({
            id: storeId,
            name: storeName,
            whatsapp: storeWhatsapp || '',
            email: storeEmail || ''
        });
        if (storeErr) return res.status(500).json({ error: 'Erro ao criar loja' });

        // Inserir configurações padrão da loja
        await supabase.from('settings').insert([
            { key: 'storeName', value: storeName, store_id: storeId },
            { key: 'primaryColor', value: '#E31837', store_id: storeId }
        ]);

        // Criar usuário admin da loja
        const userId = `user_${Date.now()}`;
        const passwordHash = bcrypt.hashSync(password, 10);
        const { error: userErr } = await supabase.from('users').insert({
            id: userId,
            username,
            password_hash: passwordHash,
            name,
            role: 'admin',
            store_id: storeId
        });
        if (userErr) return res.status(500).json({ error: 'Erro ao criar usuário' });

        const token = `autopage|${storeId}|admin|${userId}`;
        return res.json({
            token,
            storeId,
            user: { id: userId, username, name, role: 'admin' }
        });
    } catch (err: any) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Erro interno', detail: err?.message });
    }
}
