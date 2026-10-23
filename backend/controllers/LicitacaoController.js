const Licitacao = require('../models/Licitacao');
const Item = require('../models/Item');
const Lote = require('../models/Lote');
const Servico = require('../models/Servico');

const STATUS_VALIDOS = ['Ativa', 'Finalizada'];
const TIPOS_VALIDOS = ['Serviços', 'Equipamentos', 'Ambos'];

/**
 * Validações comuns de criação e edição de licitação.
 * Retorna a mensagem de erro ou null quando está tudo certo.
 */
function validarLicitacao(dados) {
    if (!dados.numero_processo || !dados.orgao_publico) return "O número do processo e órgão público são obrigatórios.";
    if (dados.status && !STATUS_VALIDOS.includes(dados.status)) return "Status inválido. Use 'Ativa' ou 'Finalizada'.";
    if (dados.tipo && !TIPOS_VALIDOS.includes(dados.tipo)) return "Tipo inválido. Use 'Serviços', 'Equipamentos' ou 'Ambos'.";
    const vazio = dados.valor_estimado === undefined || dados.valor_estimado === null || dados.valor_estimado === '';
    const valor = vazio ? 0 : parseFloat(dados.valor_estimado);
    if (Number.isNaN(valor) || valor < 0) return "O valor estimado não pode ser negativo.";
    return null;
}

/**
 * Controller de Licitações.
 * Todas as operações utilizam o ID do usuário logado (req.usuario.id)
 * para garantir isolamento de dados entre usuários.
 */
const LicitacaoController = {

    /**
     * Retorna a lista de todas as licitações cadastradas pelo usuário logado.
     */
    listar: async (req, res) => {
        try {
            const licitacoes = await Licitacao.buscarTodas(req.usuario.id);
            res.status(200).json(licitacoes);
        } catch (erro) {
            console.error("Erro ao listar licitações:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar licitações no banco de dados." });
        }
    },

    /**
     * Retorna apenas as licitações ativas do usuário com o saldo disponível calculado.
     */
    listarAtivas: async (req, res) => {
        try {
            const licitacoes = await Licitacao.buscarAtivas(req.usuario.id);
            res.status(200).json(licitacoes);
        } catch (erro) {
            console.error("Erro ao listar licitações ativas:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar licitações ativas." });
        }
    },

    /**
     * Busca os detalhes de uma licitação específica pelo ID.
     */
    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const licitacao = await Licitacao.buscarPorId(id, req.usuario.id);
            if (!licitacao) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }
            res.status(200).json(licitacao);
        } catch (erro) {
            console.error("Erro ao buscar licitação:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar a licitação." });
        }
    },

    /**
     * Cadastra uma nova licitação no sistema para o usuário logado.
     */
    adicionar: async (req, res) => {
        try {
            const dados = req.body;

            const erroValidacao = validarLicitacao(dados);
            if (erroValidacao) {
                return res.status(400).json({ mensagem: erroValidacao });
            }

            if (dados.valor_estimado) {
                dados.valor_estimado = parseFloat(dados.valor_estimado) || 0;
            }

            const resultado = await Licitacao.criar(dados, req.usuario.id);
            res.status(201).json({
                mensagem: "Licitação cadastrada com sucesso!",
                id: resultado.insertId
            });
        } catch (erro) {
            console.error("Erro ao adicionar licitação:", erro);
            res.status(500).json({ mensagem: "Erro ao criar licitação no banco: " + erro.message });
        }
    },

    /**
     * Atualiza os dados de uma licitação existente no banco.
     */
    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            const licitacaoExistente = await Licitacao.buscarPorId(id, req.usuario.id);
            if (!licitacaoExistente) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }

            const erroValidacao = validarLicitacao(dados);
            if (erroValidacao) {
                return res.status(400).json({ mensagem: erroValidacao });
            }

            // Validação de Limites (RN01): o novo valor estimado não pode ser menor que a soma dos lotes.
            // Vale também quando o campo é apagado ou zerado (antes isso passava sem conferência).
            dados.valor_estimado = parseFloat(dados.valor_estimado) || 0;
            const somaAtualLotes = await Lote.somarLotesLicitacao(id);
            if (dados.valor_estimado < somaAtualLotes) {
                return res.status(400).json({ mensagem: `O novo valor estimado não pode ser menor que a soma dos lotes cadastrados (R$ ${somaAtualLotes.toFixed(2)}).` });
            }

            await Licitacao.atualizar(id, dados, req.usuario.id);
            // Se a vigência mudou, a marca de "fora da vigência" dos serviços é recalculada (RN08)
            await Servico.recalcularForaDaVigencia({ licitacaoId: id });
            res.status(200).json({ mensagem: "Licitação atualizada com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar licitação:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar licitação." });
        }
    },

    /**
     * Remove uma licitação e todos os seus lotes e itens associados.
     */
    excluir: async (req, res) => {
        const { id } = req.params;

        try {
            const licitacaoExistente = await Licitacao.buscarPorId(id, req.usuario.id);
            if (!licitacaoExistente) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }

            await Licitacao.excluir(id, req.usuario.id);
            res.status(200).json({ mensagem: "Licitação excluída com sucesso!" });
        } catch (erro) {
            console.error("Erro ao excluir licitação:", erro);
            res.status(500).json({ mensagem: "Erro ao excluir licitação." });
        }
    },

    /**
     * Retorna contagens de licitações e somatório de valores para o Dashboard.
     */
    resumoDashboard: async (req, res) => {
        try {
            const contagem = await Licitacao.contarPorStatus(req.usuario.id);
            const valorTotal = await Licitacao.somarValorAtivas(req.usuario.id);
            res.status(200).json({ contagem, valorTotal });
        } catch (erro) {
            console.error("Erro ao gerar resumo do dashboard:", erro);
            res.status(500).json({ mensagem: "Erro ao gerar resumo do dashboard." });
        }
    },

    /**
     * Retorna os dados de uma licitação específica juntamente com o cálculo de seu saldo.
     */
    buscarComSaldo: async (req, res) => {
        const { id } = req.params;
        try {
            const licitacao = await Licitacao.buscarComSaldo(id, req.usuario.id);
            if (!licitacao) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }
            res.status(200).json(licitacao);
        } catch (erro) {
            console.error("Erro ao buscar licitação com saldo:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar licitação." });
        }
    },

    /**
     * Retorna a árvore hierárquica completa de lotes e itens de uma licitação.
     */
    buscarLotesEItens: async (req, res) => {
        const { id } = req.params;
        try {
            const licitacao = await Licitacao.verificarDono(id, req.usuario.id);
            if (!licitacao) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }

            const itens = await Item.buscarPorLicitacao(id);
            const lotesMap = {};
            itens.forEach(item => {
                const loteId = item.lote_id;
                if (!lotesMap[loteId]) {
                    lotesMap[loteId] = {
                        id: loteId,
                        numero_lote: item.numero_lote,
                        descricao: item.lote_descricao,
                        valor_total_arrematado: item.valor_total_arrematado,
                        itens: []
                    };
                }
                lotesMap[loteId].itens.push(item);
            });
            res.status(200).json(Object.values(lotesMap));
        } catch (erro) {
            console.error("Erro ao buscar lotes e itens:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar lotes e itens." });
        }
    },

    /**
     * Retorna o resumo geral financeiro e operacional de todas as licitações para relatórios.
     */
    resumoGeral: async (req, res) => {
        try {
            const licitacoes = await Licitacao.buscarResumoGeral(req.usuario.id);
            res.status(200).json(licitacoes);
        } catch (erro) {
            console.error("Erro ao buscar resumo geral:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar resumo geral." });
        }
    }
};

module.exports = LicitacaoController;
