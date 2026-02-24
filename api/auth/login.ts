import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_supabase';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const { username, password } = req.body;
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        return res.json({
            token: `autopage_${user.role}_${user.id}`,
            user: { id: user.id, username: user.username, name: user.name, role: user.role }
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
