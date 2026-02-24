import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

export function getStoreId(req: any): string | null {
    const auth = req.headers?.authorization || req.headers?.['Authorization'];
    const token = auth?.replace('Bearer ', '').trim();
    if (!token) return null;

    const parts = token.split('|');
    if (parts.length < 4 || parts[0] !== 'autopage') return null;
    return parts[1]; // storeId
}
