import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const auth = req.headers?.authorization || req.headers?.['Authorization'];
    const token = typeof auth === 'string' ? auth.replace('Bearer ', '').trim() : '';
    const parts = token.split('|');
    const storeId = (parts.length >= 4 && parts[0] === 'autopage') ? parts[1] : null;

    if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    if (req.method === 'DELETE') {
        const { error } = await supabase.from('clients').delete().eq('id', id).eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
