import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getStoreId } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    let storeId = getStoreId(req);

    // Se for GET e tiver storeId na query, permite acesso público
    if (!storeId && req.method === 'GET' && req.query.storeId) {
        storeId = req.query.storeId as string;
    }

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
            // Check if exists
            const { data } = await supabase.from('settings').select('key').eq('key', key).eq('store_id', storeId).maybeSingle();

            if (data) {
                // Update
                const { error: updateError } = await supabase.from('settings').update({ value }).eq('key', key).eq('store_id', storeId);
                if (updateError) console.error(`Error updating ${key}:`, updateError);
            } else {
                // Insert
                const { error: insertError } = await supabase.from('settings').insert({ key, value, store_id: storeId });
                if (insertError) console.error(`Error inserting ${key}:`, insertError);
            }
        }
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
