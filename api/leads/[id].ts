import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, getStoreId } from '../_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const storeId = getStoreId(req);
    if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    if (req.method === 'PATCH') {
        const { status, notes } = req.body;
        const updates: any = {};
        if (status !== undefined) updates.status = status;
        if (notes !== undefined) updates.notes = notes;

        const { error } = await supabase.from('leads').update(updates).eq('id', id).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    if (req.method === 'DELETE') {
        const { error } = await supabase.from('leads').delete().eq('id', id).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
