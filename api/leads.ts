import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, getStoreId } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        // Lead creation is public (from vehicle showcase page)
        const { vehicleId, vehicleName, clientName, clientEmail, clientPhone, origin, storeId: bodyStoreId } = req.body;
        const targetStoreId = bodyStoreId || getStoreId(req);
        if (!targetStoreId) return res.status(400).json({ error: 'store_id required' });

        const { error } = await supabase.from('leads').insert({
            vehicle_id: vehicleId,
            vehicle_name: vehicleName,
            client_name: clientName || 'Interessado',
            client_email: clientEmail || '',
            client_phone: clientPhone || '',
            origin: origin || 'Site',
            status: 'Novo',
            store_id: targetStoreId
        });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    // GET requires auth
    const storeId = getStoreId(req);
    if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('leads').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
