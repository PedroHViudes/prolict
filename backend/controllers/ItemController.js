const Item = require('../models/Item');

/**
 * Controller de Itens.
 * Gerencia as operações CRUD para itens dentro de um lote.
 * Cada item controla a quantidade ganha vs executada (saldo disponível).
 */
const ItemController = {

    /**
     * Lista todos os itens de um lote específico.
     * Rota: GET /api/lotes/:loteId/itens
     */
    listarPorLote: async (req, res) => {
        const { loteId } = req.params;
        try {
            const itens = await Item.buscarPorLote(loteId);
            res.status(200).json(itens);
        } catch (erro) {
            console.error("Erro ao listar itens:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar itens do lote." });
        }
    },

    /**
     * Lista todos os itens do sistema com dados de lote e licitação.
     * Rota: GET /api/itens
     */
    listarTodos: async (req, res) => {
        try {
            const itens = await Item.buscarTodos();
            res.status(200).json(itens);
        } catch (erro) {
            console.error("Erro ao listar todos os itens:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar itens." });
        }
    },

    /**
     * Busca um item específico pelo seu ID.
     * Rota: GET /api/itens/:id
     */
    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const item = await Item.buscarPorId(id);
            if (!item) {
                return res.status(404).json({ mensagem: "Item não encontrado." });
            }
            res.status(200).json(item);
        } catch (erro) {
            console.error("Erro ao buscar item:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar o item." });
        }
    },

    /**
     * Cadastra um novo item dentro de um lote.
     * Rota: POST /api/lotes/:loteId/itens
     */
    adicionar: async (req, res) => {
        const { loteId } = req.params;
        const dados = req.body;

        try {
            dados.lote_id = loteId;

            // Validação: descrição é obrigatória
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

    /**
     * Atualiza os dados de um item existente.
     * Rota: PUT /api/itens/:id
     */
    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            // Verifica se o item existe antes de atualizar
            const itemExistente = await Item.buscarPorId(id);
            if (!itemExistente) {
                return res.status(404).json({ mensagem: "Item não encontrado." });
            }

            await Item.atualizar(id, dados);
            res.status(200).json({ mensagem: "Item atualizado com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar item:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar item." });
        }
    },

    /**
     * Remove um item do banco de dados.
     * Rota: DELETE /api/itens/:id
     */
    excluir: async (req, res) => {
        const { id } = req.params;

        try {
            const itemExistente = await Item.buscarPorId(id);
            if (!itemExistente) {
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
