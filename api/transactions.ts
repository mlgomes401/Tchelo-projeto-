import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const auth = req.headers?.authorization || req.headers?.['Authorization'];
    const token = typeof auth === 'string' ? auth.replace('Bearer ', '').trim() : '';
    const parts = token.split('|');
    const storeId = (parts.length >= 4 && parts[0] === 'autopage') ? parts[1] : null;

    if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('transactions').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    if (req.method === 'POST') {
        const { description, category, amount, type, date, status } = req.body;
        const id = `trans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const { error } = await supabase.from('transactions').insert({
            id, description, category, amount, type, date,
            status: status || 'Concluído', store_id: storeId
        });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ id, success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
