import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        const [vehiclesRes, leadsRes, closedLeadsRes, soldRes] = await Promise.all([
            supabase.from('vehicles').select('id', { count: 'exact', head: true }),
            supabase.from('leads').select('id', { count: 'exact', head: true }),
            supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'Fechado'),
            supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'Vendido'),
        ]);

        const totalLeads = leadsRes.count || 0;
        const closedLeads = closedLeadsRes.count || 0;

        return res.json({
            totalVehicles: vehiclesRes.count || 0,
            soldVehicles: soldRes.count || 0,
            totalLeads,
            conversionRate: totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0,
            monthlyData: []
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
