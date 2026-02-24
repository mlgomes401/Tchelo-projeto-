import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data.map(r => ({ ...r, data: r.data })));
    }

    if (req.method === 'POST') {
        const { vehicleData } = req.body;
        const id = crypto.randomUUID().slice(0, 10);
        const { error } = await supabase.from('vehicles').insert({ id, data: vehicleData, status: 'Disponível' });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
