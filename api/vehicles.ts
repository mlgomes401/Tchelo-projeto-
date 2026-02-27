import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getStoreId } from './supabase_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
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
        if (req.query.id) {
            const id = req.query.id as string;
            const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
            if (error) return res.status(404).json({ error: 'Not found' });
            return res.json({ ...data.data, status: data.status, store_id: data.store_id });
        }
        const { data, error } = await supabase.from('vehicles').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    if (req.method === 'POST') {
        const { vehicleData, status } = req.body;
        const id = `veh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const { error } = await supabase.from('vehicles').insert({ id, data: vehicleData, status: status || 'Disponível', store_id: storeId });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ id });
    }

    if (req.method === 'PUT') {
        const id = req.query.id as string || req.body.id;
        if (!id) return res.status(400).json({ error: 'ID is required' });
        const { vehicleData, status } = req.body;
        let updatePayload: any = { data: vehicleData };
        if (status) updatePayload.status = status;
        const { error } = await supabase.from('vehicles').update(updatePayload).eq('id', id).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    if (req.method === 'DELETE') {
        const id = req.query.id as string;
        if (!id) return res.status(400).json({ error: 'ID is required' });
        const { error } = await supabase.from('vehicles').delete().eq('id', id).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    if (req.method === 'PATCH') {
        let id = req.query.id as string || req.body.id;
        if (!id) {
            const pathParts = req.url?.split('?')[0].split('/');
            id = pathParts?.[pathParts.length - 1];
        }
        if (!id || id === 'vehicles') return res.status(400).json({ error: 'ID is required' });

        const updates = req.body;
        // Don't modify data structure inside updates without destructuring logic (already handled by frontend)
        const { error } = await supabase.from('vehicles').update(updates).eq('id', id).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
