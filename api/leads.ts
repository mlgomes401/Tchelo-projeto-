import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    if (req.method === 'POST') {
        const { vehicleId, vehicleName, clientName, clientEmail, clientPhone, origin } = req.body;
        const { error } = await supabase.from('leads').insert({
            vehicle_id: vehicleId,
            vehicle_name: vehicleName,
            client_name: clientName || 'Interessado',
            client_email: clientEmail || '',
            client_phone: clientPhone || '',
            origin: origin || 'Site',
            status: 'Novo'
        });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
