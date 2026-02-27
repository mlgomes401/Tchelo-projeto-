import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.json({
        GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
        GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
        NODE_ENV: process.env.NODE_ENV,
        runtime: 'Vercel Serverless',
        timestamp: new Date().toISOString()
    });
}
