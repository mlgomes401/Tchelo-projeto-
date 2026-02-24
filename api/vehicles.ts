import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getStoreId } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    let storeId = getStoreId(req);

    // Acesso público para listagem de veículos na vitrine
    if (!storeId && req.method === 'GET' && req.query.storeId) {
        storeId = req.query.storeId as string;
    }

    if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('vehicles').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    if (req.method === 'POST') {
        const { vehicleData } = req.body;
        const id = `veh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const { error } = await supabase.from('vehicles').insert({ id, data: vehicleData, status: 'Disponível', store_id: storeId });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
