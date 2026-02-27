import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getStoreId } from './supabase_db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const storeId = getStoreId(req);
    if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, name, role, created_at')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    }

    if (req.method === 'POST') {
        const { username, password, name, role } = req.body;

        if (!username || !password || !name) {
            return res.status(400).json({ error: 'Faltam campos obrigatórios' });
        }

        // Verifica se usuário já existe globalmente, já que username idealmente deve ser único para login seguro
        const { data: existing } = await supabase.from('users').select('id').eq('username', username).single();
        if (existing) {
            return res.status(400).json({ error: 'Este nome de usuário já está em uso' });
        }

        try {
            const salt = bcrypt.genSaltSync(10);
            const password_hash = bcrypt.hashSync(password, salt);

            const { data, error } = await supabase
                .from('users')
                .insert({
                    username,
                    password_hash,
                    name,
                    role: role || 'user',
                    store_id: storeId
                })
                .select('id, username, name, role, created_at');

            if (error) throw error;
            return res.status(201).json({ success: true, user: data[0] });
        } catch (error: any) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Falha ao criar o usuário' });
        }
    }

    if (req.method === 'DELETE') {
        const id = req.query.id as string;
        if (!id) return res.status(400).json({ error: 'ID is required' });

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)
            .eq('store_id', storeId); // Prevent deleting users from other stores

        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
