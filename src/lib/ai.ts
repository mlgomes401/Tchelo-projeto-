export async function generateVehicleCopy(carInfo: string) {
    const prompt = `Atue como um Especialista em Vendas Automotivas (AI Manager).
  Com base nos seguintes dados do veículo: "${carInfo}", gere:
  1. Um diferencial atrativo e chamativo focado em conversão e escassez.
  2. Um parágrafo de descrição combinando aspectos técnicos e apelo emocional.
  
  Retorne um JSON estrito no seguinte formato, sem formatação markdown:
  {
    "differentials": "...",
    "description": "..."
  }`;

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        const text = await response.text();
        console.log("Raw AI Response:", text);

        if (!response.ok) {
            try {
                const errorData = JSON.parse(text);
                throw new Error(errorData.error || `Erro ${response.status}`);
            } catch (e) {
                throw new Error(`Erro ${response.status} na API. Verifique os logs e a chave API.`);
            }
        }

        try {
            const data = JSON.parse(text);
            let cleanedText = data.text || "{}";
            // Limpa blocos de código markdown se existirem
            cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedText);
        } catch (parseErr) {
            console.error("Erro ao parsear resposta da IA:", text);
            throw new Error("A IA respondeu mas o formato é inválido.");
        }
    } catch (err: any) {
        console.error("Erro na geração de IA:", err);
        throw new Error(err.message || "Falha ao gerar conteúdo inteligente.");
    }
}
