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
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
        const { data: user, error } = await supabase.from('users').select('*').eq('username', username).single();

        if (error || !user) return res.status(401).json({ error: 'Credenciais inválidas' });

        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

        const storeId = user.store_id || 'store_demo';
        const token = `autopage_${storeId}_${user.role}_${user.id}`;

        return res.json({
            token,
            storeId,
            user: { id: user.id, username: user.username, name: user.name, role: user.role }
        });
    } catch (err: any) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Erro interno', detail: err?.message });
    }
}
