import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    // GET vehicle by id is public
    if (req.method === 'GET') {
        const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Not found' });
        return res.json({ ...data.data, status: data.status, store_id: data.store_id });
    }

    const auth = req.headers?.authorization || req.headers?.['Authorization'];
    const token = typeof auth === 'string' ? auth.replace('Bearer ', '').trim() : '';
    const parts = token.split('_');
    const storeId = (parts.length >= 4 && parts[0] === 'autopage') ? parts[1] : null;

    if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'PUT') {
        const { vehicleData } = req.body;
        const { error } = await supabase.from('vehicles').update({ data: vehicleData }).eq('id', id).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    if (req.method === 'PATCH') {
        const { status } = req.body;
        const { error } = await supabase.from('vehicles').update({ status }).eq('id', id).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    if (req.method === 'DELETE') {
        const { error } = await supabase.from('vehicles').delete().eq('id', id).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
