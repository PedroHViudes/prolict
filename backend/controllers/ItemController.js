const Item = require('../models/Item');
const Lote = require('../models/Lote');

/**
 * Controller de Itens.
 * Verifica pertence ao lote→licitação do usuário antes de cada operação.
 */
const ItemController = {

    listarPorLote: async (req, res) => {
        const { loteId } = req.params;
        try {
            const lote = await Lote.buscarPorIdComDono(loteId, req.usuario.id);
            if (!lote) {
                return res.status(404).json({ mensagem: "Lote não encontrado." });
            }
            const itens = await Item.buscarPorLote(loteId);
            res.status(200).json(itens);
        } catch (erro) {
            console.error("Erro ao listar itens:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar itens do lote." });
        }
    },

    listarTodos: async (req, res) => {
        try {
            const itens = await Item.buscarTodos(req.usuario.id);
            res.status(200).json(itens);
        } catch (erro) {
            console.error("Erro ao listar todos os itens:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar itens." });
        }
    },

    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const item = await Item.buscarPorIdComDono(id, req.usuario.id);
            if (!item) {
                return res.status(404).json({ mensagem: "Item não encontrado." });
            }
            const itemCompleto = await Item.buscarPorId(id);
            res.status(200).json(itemCompleto);
        } catch (erro) {
            console.error("Erro ao buscar item:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar o item." });
        }
    },

    adicionar: async (req, res) => {
        const { loteId } = req.params;
        const dados = req.body;

        try {
            const lote = await Lote.buscarPorIdComDono(loteId, req.usuario.id);
            if (!lote) {
                return res.status(404).json({ mensagem: "Lote não encontrado." });
            }

            const somaAtualItens = await Item.somarItensLote(loteId);
            const valorNovoItem = (parseFloat(dados.quantidade_ganha) || 0) * (parseFloat(dados.valor_unitario) || 0);

            if (somaAtualItens + valorNovoItem > lote.valor_total_arrematado) {
                return res.status(400).json({ mensagem: `A soma dos itens excede o valor arrematado do lote (Restante: R$ ${(lote.valor_total_arrematado - somaAtualItens).toFixed(2)}).` });
            }

            dados.lote_id = loteId;

            if (!dados.descricao) {
                return res.status(400).json({ mensagem: "A descrição do item é obrigatória." });
            }

            const resultado = await Item.criar(dados);
            res.status(201).json({
                mensagem: "Item cadastrado com sucesso!",
                id: resultado.insertId
            });
        } catch (erro) {
            console.error("Erro ao adicionar item:", erro);
            res.status(500).json({ mensagem: "Erro ao criar item no banco." });
        }
    },

    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            const item = await Item.buscarPorIdComDono(id, req.usuario.id);
            if (!item) {
                return res.status(404).json({ mensagem: "Item não encontrado." });
            }

            const lote = await Lote.buscarPorId(item.lote_id);
            const somaAtualItens = await Item.somarItensLote(item.lote_id, id);
            const valorNovoItem = (parseFloat(dados.quantidade_ganha) || 0) * (parseFloat(dados.valor_unitario) || 0);

            if (somaAtualItens + valorNovoItem > lote.valor_total_arrematado) {
                return res.status(400).json({ mensagem: `A soma dos itens excede o valor arrematado do lote.` });
            }

            await Item.atualizar(id, dados);
            res.status(200).json({ mensagem: "Item atualizado com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar item:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar item." });
        }
    },

    excluir: async (req, res) => {
        const { id } = req.params;

        try {
            const item = await Item.buscarPorIdComDono(id, req.usuario.id);
            if (!item) {
                return res.status(404).json({ mensagem: "Item não encontrado." });
            }

            await Item.excluir(id);
            res.status(200).json({ mensagem: "Item excluído com sucesso!" });
        } catch (erro) {
            console.error("Erro ao excluir item:", erro);
            res.status(500).json({ mensagem: "Erro ao excluir item." });
        }
    }
};

module.exports = ItemController;
