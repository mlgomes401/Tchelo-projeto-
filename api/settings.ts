import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getStoreId } from './supabase_db.js';

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
        if (error) {
            console.error("Settings GET error:", error);
            return res.status(500).json({ error: error.message, details: error });
        }
        const settings = (data || []).reduce((acc: any, row: any) => {
            // Remove storeId prefix if it exists to keep frontend agnostic
            const cleanKey = row.key.startsWith(`${storeId}_`) ? row.key.replace(`${storeId}_`, '') : row.key;
            acc[cleanKey] = row.value;
            return acc;
        }, {});
        return res.json(settings);
    }

    if (req.method === 'PATCH') {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            const dbKey = `${storeId}_${key}`; // Prefix key with storeId to avoid PK constraint violations
            const { data, error: fetchError } = await supabase.from('settings').select('key').eq('key', dbKey).eq('store_id', storeId).maybeSingle();

            if (fetchError) {
                console.error(`Error fetching setting ${dbKey}:`, fetchError);
                return res.status(500).json({ error: `Erro ao verificar ${dbKey}`, details: fetchError });
            }

            if (data) {
                const { error: updateError } = await supabase.from('settings').update({ value }).eq('key', dbKey).eq('store_id', storeId);
                if (updateError) {
                    console.error(`Error updating ${dbKey}:`, updateError);
                    return res.status(500).json({ error: `Falha ao atualizar ${key}`, details: updateError });
                }
            } else {
                const { error: insertError } = await supabase.from('settings').insert({ key: dbKey, value, store_id: storeId });
                if (insertError) {
                    console.error(`Error inserting ${dbKey}:`, insertError);
                    return res.status(500).json({ error: `Falha ao inserir ${key}`, details: insertError });
                }
            }
        }
        return res.json({ success: true });
    }

    if (req.method === 'POST' && req.query.action === 'view') {
        const dbKey = `${storeId}_views`;
        const { data, error: fetchError } = await supabase.from('settings').select('value').eq('key', dbKey).eq('store_id', storeId).maybeSingle();

        const currentViews = data ? parseInt(data.value || '0', 10) : 0;
        const newViews = currentViews + 1;

        if (data) {
            await supabase.from('settings').update({ value: newViews.toString() }).eq('key', dbKey).eq('store_id', storeId);
        } else {
            await supabase.from('settings').insert({ key: dbKey, value: newViews.toString(), store_id: storeId });
        }
        return res.json({ success: true, views: newViews });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
