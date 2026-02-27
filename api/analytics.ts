import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStoreId, supabase } from './supabase_db.js';
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
        const storeId = getStoreId(req);
        if (!storeId) return res.status(401).json({ error: 'Unauthorized' });

        // 1. Gather Data
        const [{ data: leads }, { data: vehicles }] = await Promise.all([
            supabase.from('leads').select('*').eq('store_id', storeId),
            supabase.from('vehicles').select('id, data, status').eq('store_id', storeId)
        ]);

        const leadsCount = leads?.length || 0;
        const newLeads = leads?.filter(l => l.status === 'Novo').length || 0;
        const inProgressLeads = leads?.filter(l => l.status === 'Em Atendimento').length || 0;
        const wonLeads = leads?.filter(l => l.status === 'Vendido' || l.status === 'Ganho').length || 0;
        const lostLeads = leads?.filter(l => l.status === 'Perdido').length || 0;

        const vehiclesCount = vehicles?.length || 0;
        const activeVehicles = vehicles?.filter(v => v.status === 'Disponível').length || 0;
        const soldVehicles = vehicles?.filter(v => v.status === 'Vendido').length || 0;

        const origins = leads?.reduce((acc: any, lead) => {
            const org = lead.origin || 'Desconhecida';
            acc[org] = (acc[org] || 0) + 1;
            return acc;
        }, {});

        // Calculate rough conversion rate
        const conversionRate = leadsCount > 0 ? ((wonLeads / leadsCount) * 100).toFixed(1) : '0.0';

        const storeDataContext = `
DADOS REAIS DA LOJA DO CLIENTE (Referência para análise rigorosa):
- Total de Leads Recebidos: ${leadsCount}
- Taxa de Conversão Atual: ${conversionRate}% (${wonLeads} vendas a partir de leads)
- Status do Funil Comercial:
  * Novos (Aguardando contato): ${newLeads}
  * Em Atendimento (Negociando): ${inProgressLeads}
  * Fechados/Ganhos: ${wonLeads}
  * Perdidos: ${lostLeads}
- Estoque de Veículos:
  * Total Cadastrado: ${vehiclesCount}
  * Disponíveis para Venda: ${activeVehicles}
  * Vendidos (Total Histórico no app): ${soldVehicles}
- Origem dos Leads:
  ${Object.entries(origins || {}).map(([o, c]) => `* ${o}: ${c}`).join('\n  ')}
`;

        // 2. Setup AI Persona
        const apiKey = process.env.GEMINI_API_KEY ||
            process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
            process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Chave API do Gemini não configurada.' });
        }

        const client = new GoogleGenAI({ apiKey });

        const SYSTEM_PROMPT = `Você é um DIRETOR COMERCIAL de elite e GESTOR FINANCEIRO especializado no mercado automotivo.
Sua função é agir como um consultor experiente focado EXTREMAMENTE em:
- Aumentar conversão de vendas.
- Melhorar a performance e velocidade de atendimento.
- Identificar gargalos no funil (leads parados).
- Estruturar metas claras e acionáveis.
- Otimizar o fluxo do CRM Automotivo.

Você NUNCA responde de forma genérica. Avalie os dados com frieza, como quem ganha comissão por performance. Fale de negócios, dinheiro na mesa e eficiência.

Sempre entregue sua análise OBRIGATORIAMENTE estruturada neste formato exato usando Markdown (não use cabeçalhos h1/h2, apenas os emojis com texto em negrito e listas):

**📊 Diagnóstico Atual**
[Sua análise direta e ácida do cenário atual da loja, elogiando o que é bom e apontando a realidade do que está fraco.]

**📉 Gargalos Identificados**
[Lista com os principais problemas baseados estritamente nos dados de leads não atendidos, perdidos ou taxa de conversão estagnada.]

**🚀 Oportunidades de Crescimento**
[O que a loja deve fazer cruzando o estoque atual com a origem que traz mais leads.]

**🎯 Plano de Ação em Etapas**
[1, 2, 3 passos práticos para amanhã de manhã a equipe de vendas executar e bater meta.]

**📈 Meta Recomendada**
[Uma meta matemática desafiadora mas tangível baseada no volume atual.]

Analise os dados abaixo e forneça a consultoria de forma premium, profissional e impiedosa com ineficiências:
`;

        const fullPrompt = SYSTEM_PROMPT + "\n\n" + storeDataContext;

        const result = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        if (!result || !result.text) {
            throw new Error('A IA não retornou um diagnóstico válido.');
        }

        res.status(200).json({ analysis: result.text, rawData: { leadsCount, vehiclesCount } });
    } catch (error: any) {
        console.error('ERRO ANALYTICS:', error);
        res.status(500).json({
            error: error.message || 'Erro ao gerar análise comercial',
            details: error.toString()
        });
    }
}
