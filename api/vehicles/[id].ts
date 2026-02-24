import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Not found' });
        return res.json({ ...data.data, status: data.status });
    }

    if (req.method === 'PUT') {
        const { vehicleData } = req.body;
        const { error } = await supabase.from('vehicles').update({ data: vehicleData }).eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    if (req.method === 'PATCH') {
        const { status } = req.body;
        const { error } = await supabase.from('vehicles').update({ status }).eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    if (req.method === 'DELETE') {
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
