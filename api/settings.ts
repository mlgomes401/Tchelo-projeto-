import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('settings').select('*');
        if (error) return res.status(500).json({ error: error.message });
        const settings = (data || []).reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        return res.json(settings);
    }

    if (req.method === 'PATCH') {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            const { error } = await supabase.from('settings').upsert({ key, value });
            if (error) return res.status(500).json({ error: error.message });
        }
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
