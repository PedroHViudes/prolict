const Licitacao = require('../models/Licitacao');
const Item = require('../models/Item');

/**
 * Controller de Licitações.
 * Todas as operações utilizam o ID do usuário logado (req.usuario.id)
 * para garantir isolamento de dados entre usuários.
 */
const LicitacaoController = {

    listar: async (req, res) => {
        try {
            const licitacoes = await Licitacao.buscarTodas(req.usuario.id);
            res.status(200).json(licitacoes);
        } catch (erro) {
            console.error("Erro ao listar licitações:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar licitações no banco de dados." });
        }
    },

    listarAtivas: async (req, res) => {
        try {
            const licitacoes = await Licitacao.buscarAtivas(req.usuario.id);
            res.status(200).json(licitacoes);
        } catch (erro) {
            console.error("Erro ao listar licitações ativas:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar licitações ativas." });
        }
    },

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

    adicionar: async (req, res) => {
        try {
            const dados = req.body;

            if (!dados.numero_processo || !dados.orgao_publico) {
                return res.status(400).json({ mensagem: "O número do processo e órgão público são obrigatórios." });
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

    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            const licitacaoExistente = await Licitacao.buscarPorId(id, req.usuario.id);
            if (!licitacaoExistente) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }

            if (!dados.numero_processo || !dados.orgao_publico) {
                return res.status(400).json({ mensagem: "O número do processo e órgão público são obrigatórios." });
            }

            if (dados.valor_estimado) {
                dados.valor_estimado = parseFloat(dados.valor_estimado) || 0;
            }

            await Licitacao.atualizar(id, dados, req.usuario.id);
            res.status(200).json({ mensagem: "Licitação atualizada com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar licitação:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar licitação." });
        }
    },

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
