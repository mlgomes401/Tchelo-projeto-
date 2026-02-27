import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getStoreId } from './_supabase_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const { vehicleId, vehicleName, clientName, clientEmail, clientPhone, origin, notes, storeId: bodyStoreId } = req.body;

        const tokenStoreId = getStoreId(req);

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
            notes: notes || '',
            status: 'Novo',
            store_id: targetStoreId
        });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    const storeId = getStoreId(req);

    if (!storeId && req.method !== 'POST') return res.status(401).json({ error: 'Unauthorized' });

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    if (req.method === 'GET') {
        const queryStoreId = req.query.storeId as string;
        const finalStoreId = queryStoreId || storeId || 'store_demo';

        const { data, error } = await supabase.from('leads').select('*').eq('store_id', finalStoreId).order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    if (req.method === 'DELETE') {
        const urlArgs = req.query;
        let idFromQuery: string | undefined;
        // In case the id comes as part of the path or query parameter
        if (req.query.id) {
            idFromQuery = req.query.id as string;
        } else {
            const pathParts = req.url?.split('?')[0].split('/');
            const potentialId = pathParts?.[pathParts.length - 1];
            if (potentialId && potentialId !== 'leads') {
                idFromQuery = potentialId;
            }
        }

        if (!idFromQuery) return res.status(400).json({ error: 'ID required for deletion' });

        const { error } = await supabase.from('leads').delete().eq('id', idFromQuery).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    if (req.method === 'PATCH') {
        // Similar to delete, we need the ID
        const urlArgs = req.query;
        let idFromQuery: string | undefined;
        if (req.query.id) {
            idFromQuery = req.query.id as string;
        } else {
            const pathParts = req.url?.split('?')[0].split('/');
            const potentialId = pathParts?.[pathParts.length - 1];
            if (potentialId && potentialId !== 'leads') {
                idFromQuery = potentialId;
            }
        }
        if (!idFromQuery) return res.status(400).json({ error: 'ID required for update' });

        const updates = req.body;
        const { error } = await supabase.from('leads').update(updates).eq('id', idFromQuery).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
