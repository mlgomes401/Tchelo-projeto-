import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        // Lead creation is partly public (from vehicle showcase page)
        const { vehicleId, vehicleName, clientName, clientEmail, clientPhone, origin, storeId: bodyStoreId } = req.body;

        // Extract storeId from token (if exists) or from body (for public leads)
        const auth = req.headers?.authorization || req.headers?.['Authorization'];
        const token = typeof auth === 'string' ? auth.replace('Bearer ', '').trim() : '';
        const parts = token.split('_');
        const tokenStoreId = (parts.length >= 4 && parts[0] === 'autopage') ? parts[1] : null;

        const targetStoreId = tokenStoreId || bodyStoreId;
        if (!targetStoreId) return res.status(400).json({ error: 'store_id required' });

        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
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
    const auth = req.headers?.authorization || req.headers?.['Authorization'];
    const token = typeof auth === 'string' ? auth.replace('Bearer ', '').trim() : '';
    const parts = token.split('_');
    const storeId = (parts.length >= 4 && parts[0] === 'autopage') ? parts[1] : null;

    if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('leads').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
