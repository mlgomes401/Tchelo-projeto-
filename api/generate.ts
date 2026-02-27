import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        const apiKey = process.env.GEMINI_API_KEY ||
            process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
            process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error("ERRO: GEMINI_API_KEY não configurada!");
            return res.status(500).json({ error: 'Chave API do Gemini não está configurada na Vercel.' });
        }

        const client = new GoogleGenAI({ apiKey });

        const result = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        if (!result || !result.text) {
            throw new Error('A IA não retornou um texto válido.');
        }

        res.status(200).json({ text: result.text });
    } catch (error: any) {
        console.error('ERRO GENERATE:', error);
        res.status(500).json({
            error: error.message || 'Erro na geração de IA',
            details: error.toString()
        });
    }
}
