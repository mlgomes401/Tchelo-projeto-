import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const auth = req.headers?.authorization || req.headers?.['Authorization'];
    const token = typeof auth === 'string' ? auth.replace('Bearer ', '').trim() : '';
    const parts = token.split('_');
    const storeId = (parts.length >= 4 && parts[0] === 'autopage') ? parts[1] : null;

    if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('settings').select('*').eq('store_id', storeId);
        if (error) return res.status(500).json({ error: error.message });
        const settings = (data || []).reduce((acc: any, row: any) => { acc[row.key] = row.value; return acc; }, {});
        return res.json(settings);
    }

    if (req.method === 'PATCH') {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            const { error } = await supabase.from('settings').upsert({ key, value, store_id: storeId });
            if (error) {
                await supabase.from('settings').update({ value }).eq('key', key).eq('store_id', storeId);
            }
        }
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
