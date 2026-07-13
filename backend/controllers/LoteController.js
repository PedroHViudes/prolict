const Lote = require('../models/Lote');

/**
 * Controller de Lotes.
 * Gerencia as operações CRUD para lotes dentro de uma licitação.
 * Um lote agrupa itens com valor total arrematado.
 */
const LoteController = {

    /**
     * Lista todos os lotes de uma licitação específica.
     * Rota: GET /api/licitacoes/:licitacaoId/lotes
     */
    listarPorLicitacao: async (req, res) => {
        const { licitacaoId } = req.params;
        try {
            const lotes = await Lote.buscarPorLicitacao(licitacaoId);
            res.status(200).json(lotes);
        } catch (erro) {
            console.error("Erro ao listar lotes:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar lotes da licitação." });
        }
    },

    /**
     * Busca um lote específico pelo seu ID.
     * Rota: GET /api/lotes/:id
     */
    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const lote = await Lote.buscarPorId(id);
            if (!lote) {
                return res.status(404).json({ mensagem: "Lote não encontrado." });
            }
            res.status(200).json(lote);
        } catch (erro) {
            console.error("Erro ao buscar lote:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar o lote." });
        }
    },

    /**
     * Cadastra um novo lote dentro de uma licitação.
     * Rota: POST /api/licitacoes/:licitacaoId/lotes
     */
    adicionar: async (req, res) => {
        const { licitacaoId } = req.params;
        const dados = req.body;

        try {
            dados.licitacao_id = licitacaoId;

            // Validação: número do lote é obrigatório
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

    /**
     * Atualiza os dados de um lote existente.
     * Rota: PUT /api/lotes/:id
     */
    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            // Verifica se o lote existe antes de atualizar
            const loteExistente = await Lote.buscarPorId(id);
            if (!loteExistente) {
                return res.status(404).json({ mensagem: "Lote não encontrado." });
            }

            await Lote.atualizar(id, dados);
            res.status(200).json({ mensagem: "Lote atualizado com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar lote:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar lote." });
        }
    },

    /**
     * Remove um lote e todos os itens vinculados (CASCADE).
     * Rota: DELETE /api/lotes/:id
     */
    excluir: async (req, res) => {
        const { id } = req.params;

        try {
            const loteExistente = await Lote.buscarPorId(id);
            if (!loteExistente) {
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
