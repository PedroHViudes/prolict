const Lote = require('../models/Lote');
const Licitacao = require('../models/Licitacao');
const Item = require('../models/Item');

/**
 * Controller de Lotes.
 * Verifica pertence à licitação do usuário antes de cada operação.
 */
const LoteController = {

    listarPorLicitacao: async (req, res) => {
        const { licitacaoId } = req.params;
        try {
            const licitacao = await Licitacao.verificarDono(licitacaoId, req.usuario.id);
            if (!licitacao) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }
            const lotes = await Lote.buscarPorLicitacao(licitacaoId);
            res.status(200).json(lotes);
        } catch (erro) {
            console.error("Erro ao listar lotes:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar lotes da licitação." });
        }
    },

    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const lote = await Lote.buscarPorIdComDono(id, req.usuario.id);
            if (!lote) {
                return res.status(404).json({ mensagem: "Lote não encontrado." });
            }
            res.status(200).json(lote);
        } catch (erro) {
            console.error("Erro ao buscar lote:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar o lote." });
        }
    },

    adicionar: async (req, res) => {
        const { licitacaoId } = req.params;
        const dados = req.body;

        try {
            const licitacao = await Licitacao.verificarDono(licitacaoId, req.usuario.id);
            if (!licitacao) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }

            const licitacaoCompleta = await Licitacao.buscarPorId(licitacaoId, req.usuario.id);
            const somaAtualLotes = await Lote.somarLotesLicitacao(licitacaoId);
            const valorNovoLote = parseFloat(dados.valor_total_arrematado) || 0;

            if (somaAtualLotes + valorNovoLote > licitacaoCompleta.valor_estimado) {
                return res.status(400).json({ mensagem: `O valor deste lote excede o limite estimado da licitação (Restante: R$ ${(licitacaoCompleta.valor_estimado - somaAtualLotes).toFixed(2)}).` });
            }

            dados.licitacao_id = licitacaoId;

            if (!dados.numero_lote) {
                return res.status(400).json({ mensagem: "O número do lote é obrigatório." });
            }

            const resultado = await Lote.criar(dados);
            res.status(201).json({
                mensagem: "Lote cadastrado com sucesso!",
                id: resultado.insertId
            });
        } catch (erro) {
            console.error("Erro ao adicionar lote:", erro);
            res.status(500).json({ mensagem: "Erro ao criar lote no banco." });
        }
    },

    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            const lote = await Lote.buscarPorIdComDono(id, req.usuario.id);
            if (!lote) {
                return res.status(404).json({ mensagem: "Lote não encontrado." });
            }

            // Validação 1: Soma de Lotes <= Licitacao
            const licitacaoCompleta = await Licitacao.buscarPorId(lote.licitacao_id, req.usuario.id);
            const somaAtualLotes = await Lote.somarLotesLicitacao(lote.licitacao_id, id);
            const valorNovoLote = parseFloat(dados.valor_total_arrematado) || 0;

            if (somaAtualLotes + valorNovoLote > licitacaoCompleta.valor_estimado) {
                return res.status(400).json({ mensagem: `O valor deste lote excede o limite estimado da licitação.` });
            }

            // Validação 2: Novo Valor do Lote >= Soma dos Itens já existentes
            const somaItens = await Item.somarItensLote(id);
            if (valorNovoLote < somaItens) {
                return res.status(400).json({ mensagem: `O valor do lote não pode ser menor que a soma de seus itens (R$ ${somaItens.toFixed(2)}).` });
            }

            await Lote.atualizar(id, dados);
            res.status(200).json({ mensagem: "Lote atualizado com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar lote:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar lote." });
        }
    },

    excluir: async (req, res) => {
        const { id } = req.params;

        try {
            const lote = await Lote.buscarPorIdComDono(id, req.usuario.id);
            if (!lote) {
                return res.status(404).json({ mensagem: "Lote não encontrado." });
            }

            await Lote.excluir(id);
            res.status(200).json({ mensagem: "Lote excluído com sucesso!" });
        } catch (erro) {
            console.error("Erro ao excluir lote:", erro);
            res.status(500).json({ mensagem: "Erro ao excluir lote." });
        }
    }
};

module.exports = LoteController;
