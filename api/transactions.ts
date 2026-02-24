import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, getStoreId } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const storeId = getStoreId(req);
    if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('transactions').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    if (req.method === 'POST') {
        const { description, category, amount, type, date, status } = req.body;
        const id = crypto.randomUUID().slice(0, 10);
        const { error } = await supabase.from('transactions').insert({ id, description, category, amount, type, date, status: status || 'Concluído', store_id: storeId });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ id, success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
