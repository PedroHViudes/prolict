const Licitacao = require('../models/Licitacao');
const Item = require('../models/Item');

/**
 * Controller de Licitações.
 * Gerencia as operações CRUD completas para licitações.
 * Uma licitação representa um edital público com seus lotes e itens.
 */
const LicitacaoController = {

    /**
     * Lista todas as licitações cadastradas no sistema.
     * Rota: GET /api/licitacoes
     */
    listar: async (req, res) => {
        try {
            const licitacoes = await Licitacao.buscarTodas();
            res.status(200).json(licitacoes);
        } catch (erro) {
            console.error("Erro ao listar licitações:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar licitações no banco de dados." });
        }
    },

    /**
     * Lista apenas licitações com status ativo (Ativa).
     * Utilizado no Dashboard para exibir o resumo geral.
     * Rota: GET /api/licitacoes/ativas
     */
    listarAtivas: async (req, res) => {
        try {
            const licitacoes = await Licitacao.buscarAtivas();
            res.status(200).json(licitacoes);
        } catch (erro) {
            console.error("Erro ao listar licitações ativas:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar licitações ativas." });
        }
    },

    /**
     * Busca uma licitação específica pelo seu ID.
     * Rota: GET /api/licitacoes/:id
     */
    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const licitacao = await Licitacao.buscarPorId(id);
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
     * Cadastra uma nova licitação no sistema.
     * O status padrão é 'Ativa' caso não seja informado.
     * Rota: POST /api/licitacoes
     */
    adicionar: async (req, res) => {
        try {
            const dados = req.body;
            console.log("Dados recebidos para criar licitação:", JSON.stringify(dados, null, 2));

            // Validação: campos obrigatórios
            if (!dados.numero_processo || !dados.orgao_publico) {
                return res.status(400).json({ mensagem: "O número do processo e órgão público são obrigatórios." });
            }

            // Converte valor_estimado para número se vier como string
            if (dados.valor_estimado) {
                dados.valor_estimado = parseFloat(dados.valor_estimado) || 0;
            }

            const resultado = await Licitacao.criar(dados);
            console.log("Licitação criada com ID:", resultado.insertId);
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
     * Atualiza os dados de uma licitação existente.
     * Rota: PUT /api/licitacoes/:id
     */
    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            // Verifica se a licitação existe antes de atualizar
            const licitacaoExistente = await Licitacao.buscarPorId(id);
            if (!licitacaoExistente) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }

            // Validação: campos obrigatórios
            if (!dados.numero_processo || !dados.orgao_publico) {
                return res.status(400).json({ mensagem: "O número do processo e órgão público são obrigatórios." });
            }

            // Converte valor_estimado para número se vier como string
            if (dados.valor_estimado) {
                dados.valor_estimado = parseFloat(dados.valor_estimado) || 0;
            }

            await Licitacao.atualizar(id, dados);
            res.status(200).json({ mensagem: "Licitação atualizada com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar licitação:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar licitação." });
        }
    },

    /**
     * Remove uma licitação e todos os dados vinculados (lotes, itens, etc).
     * Rota: DELETE /api/licitacoes/:id
     */
    excluir: async (req, res) => {
        const { id } = req.params;

        try {
            // Verifica se a licitação existe antes de excluir
            const licitacaoExistente = await Licitacao.buscarPorId(id);
            if (!licitacaoExistente) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }

            await Licitacao.excluir(id);
            res.status(200).json({ mensagem: "Licitação excluída com sucesso!" });
        } catch (erro) {
            console.error("Erro ao excluir licitação:", erro);
            res.status(500).json({ mensagem: "Erro ao excluir licitação." });
        }
    },

    /**
     * Retorna dados para o Dashboard: contagem por status e valor total.
     * Rota: GET /api/licitacoes/dashboard/resumo
     */
    resumoDashboard: async (req, res) => {
        try {
            const contagem = await Licitacao.contarPorStatus();
            const valorTotal = await Licitacao.somarValorAtivas();
            res.status(200).json({ contagem, valorTotal });
        } catch (erro) {
            console.error("Erro ao gerar resumo do dashboard:", erro);
            res.status(500).json({ mensagem: "Erro ao gerar resumo do dashboard." });
        }
    },

    /**
     * Busca licitação pelo ID com saldo calculado.
     * Saldo = valor_estimado - soma dos serviços.
     * Rota: GET /api/licitacoes/:id/resumo
     */
    buscarComSaldo: async (req, res) => {
        const { id } = req.params;
        try {
            const licitacao = await Licitacao.buscarComSaldo(id);
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
     * Busca todos os itens de uma licitação, agrupados por lote.
     * Utilizado no formulário de serviços para o usuário escolher o item.
     * Rota: GET /api/licitacoes/:id/lotes-itens
     */
    buscarLotesEItens: async (req, res) => {
        const { id } = req.params;
        try {
            const itens = await Item.buscarPorLicitacao(id);
            // Agrupa itens por lote para facilitar o consumo no frontend
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
     * Retorna resumo geral de todas as licitações com saldo.
     * Utilizado no Dashboard e Relatórios.
     * Rota: GET /api/licitacoes/relatorio/resumo
     */
    resumoGeral: async (req, res) => {
        try {
            const licitacoes = await Licitacao.buscarResumoGeral();
            res.status(200).json(licitacoes);
        } catch (erro) {
            console.error("Erro ao buscar resumo geral:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar resumo geral." });
        }
    }
};

module.exports = LicitacaoController;
