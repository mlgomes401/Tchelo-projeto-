import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

// Token format: autopage_{storeId}_{role}_{userId}
export function parseToken(authHeader?: string): { storeId: string; userId: string; role: string } | null {
    const token = authHeader?.replace('Bearer ', '').trim();
    if (!token) return null;
    const parts = token.split('_');
    // autopage_{storeId}_{role}_{userId}
    if (parts.length < 4 || parts[0] !== 'autopage') return null;
    return { storeId: parts[1], role: parts[2], userId: parts[3] };
}

export function getStoreId(req: any): string | null {
    const auth = req.headers?.authorization || req.headers?.['Authorization'];
    const parsed = parseToken(auth);
    return parsed?.storeId ?? null;
}
