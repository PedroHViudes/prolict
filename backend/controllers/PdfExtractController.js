const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

// Inicializa a IA com a chave da variável de ambiente
// O usuário precisa adicionar GEMINI_API_KEY no arquivo .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

class PdfExtractController {
    async extrair(req, res) {
        try {
            // Verifica se o arquivo foi enviado
            if (!req.file) {
                return res.status(400).json({ mensagem: "Nenhum arquivo PDF enviado." });
            }

            // Garante que a API Key foi configurada
            if (!process.env.GEMINI_API_KEY) {
                return res.status(500).json({ 
                    mensagem: "Chave de API do Gemini não configurada. Configure a GEMINI_API_KEY no arquivo .env." 
                });
            }

            // 1. Converte o buffer do PDF para texto bruto
            const data = await pdfParse(req.file.buffer);
            const textoBruto = data.text;

            if (!textoBruto || textoBruto.trim() === '') {
                return res.status(400).json({ mensagem: "Não foi possível extrair texto deste PDF. Ele pode ser uma imagem escaneada." });
            }

            // 2. Chama o Gemini para extrair os dados estruturados
            const prompt = `
Você é um especialista em analisar editais de licitação brasileiros.
Eu vou te passar o texto extraído de um edital em PDF e você deve extrair os dados relevantes e me retornar ESTRITAMENTE um JSON no seguinte formato, sem formatação markdown (sem as crases de código), para que eu possa usar um JSON.parse() nele.

Formato esperado:
{
    "numero_processo": "string (ex: 001/2025)",
    "orgao_publico": "string (ex: Prefeitura Municipal de Jacarezinho)",
    "data_abertura": "string formato YYYY-MM-DD",
    "data_vigencia": "string formato YYYY-MM-DD",
    "valor_estimado": "numero decimal (use ponto para separar centavos, ex: 150000.50. Coloque 0 se não encontrar)",
    "observacoes": "string (um resumo muito breve do objeto da licitação)",
    "lotes": [
        {
            "numero_lote": "string (ex: Lote 1)",
            "descricao": "string",
            "valor_total_arrematado": "numero decimal (ex: 5000.00)",
            "itens": [
                {
                    "descricao": "string",
                    "quantidade_ganha": "numero decimal",
                    "valor_unitario": "numero decimal"
                }
            ]
        }
    ]
}

Se não conseguir encontrar a data de vigência, coloque em branco. A data de abertura costuma ser a data do certame.
Crie um lote único se o edital não tiver lotes separados (ou se tiver apenas itens), colocando todos os itens nele.
Tente encontrar e extrair os itens da licitação. Se não conseguir achar os itens ou as quantidades com certeza, deixe o array de itens vazio, mas tente ao máximo!

TEXTO DO EDITAL:
${textoBruto.substring(0, 30000)} // Limitando o texto para evitar estourar o limite de tokens, focando na primeira parte que geralmente tem os dados
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.1 // Temperatura baixa para respostas mais determinísticas e precisas
                }
            });

            // 3. Limpa a resposta para garantir que seja um JSON válido
            let jsonText = response.text;
            
            // Remove as marcações de markdown do começo e do fim (ex: ```json e ```)
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.substring(7);
            }
            if (jsonText.endsWith('```')) {
                jsonText = jsonText.substring(0, jsonText.length - 3);
            }
            if (jsonText.startsWith('```')) {
                jsonText = jsonText.substring(3);
            }
            
            const extraido = JSON.parse(jsonText.trim());

            return res.status(200).json(extraido);

        } catch (erro) {
            console.error("Erro na extração do PDF:", erro);
            return res.status(500).json({ 
                mensagem: "Erro ao processar e extrair dados do PDF.",
                detalhes: erro.message 
            });
        }
    }
}

module.exports = new PdfExtractController();
