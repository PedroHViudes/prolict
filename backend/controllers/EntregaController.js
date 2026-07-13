const Entrega = require('../models/Entrega');

/**
 * Controller de Entregas.
 * Gerencia as operações CRUD para entregas de serviços.
 * Uma entrega registra quem recebeu e quem foi responsável pela entrega.
 */
const EntregaController = {

    /**
     * Lista todas as entregas de um serviço específico.
     * Rota: GET /api/servicos/:servicoId/entregas
     */
    listarPorServico: async (req, res) => {
        const { servicoId } = req.params;
        try {
            const entregas = await Entrega.buscarPorServico(servicoId);
            res.status(200).json(entregas);
        } catch (erro) {
            console.error("Erro ao listar entregas:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar entregas." });
        }
    },

    /**
     * Lista todas as entregas com dados de serviço e licitação.
     * Rota: GET /api/entregas
     */
    listar: async (req, res) => {
        try {
            const entregas = await Entrega.buscarTodas();
            res.status(200).json(entregas);
        } catch (erro) {
            console.error("Erro ao listar entregas:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar entregas." });
        }
    },

    /**
     * Busca uma entrega específica pelo seu ID.
     * Rota: GET /api/entregas/:id
     */
    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const entrega = await Entrega.buscarPorId(id);
            if (!entrega) {
                return res.status(404).json({ mensagem: "Entrega não encontrada." });
            }
            res.status(200).json(entrega);
        } catch (erro) {
            console.error("Erro ao buscar entrega:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar a entrega." });
        }
    },

    /**
     * Cadastra uma nova entrega vinculada a um serviço.
     * Rota: POST /api/servicos/:servicoId/entregas
     */
    adicionar: async (req, res) => {
        const { servicoId } = req.params;
        const dados = req.body;
        try {
            dados.servico_id = servicoId;
            const resultado = await Entrega.criar(dados);
            res.status(201).json({
                mensagem: "Entrega registrada com sucesso!",
                id: resultado.insertId
            });
        } catch (erro) {
            console.error("Erro ao adicionar entrega:", erro);
            res.status(500).json({ mensagem: "Erro ao criar entrega." });
        }
    },

    /**
     * Atualiza os dados de uma entrega existente.
     * Rota: PUT /api/entregas/:id
     */
    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;
        try {
            const entregaExistente = await Entrega.buscarPorId(id);
            if (!entregaExistente) {
                return res.status(404).json({ mensagem: "Entrega não encontrada." });
            }
            await Entrega.atualizar(id, dados);
            res.status(200).json({ mensagem: "Entrega atualizada com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar entrega:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar entrega." });
        }
    },

    /**
     * Remove uma entrega do banco de dados.
     * Rota: DELETE /api/entregas/:id
     */
    excluir: async (req, res) => {
        const { id } = req.params;
        try {
            const entregaExistente = await Entrega.buscarPorId(id);
            if (!entregaExistente) {
                return res.status(404).json({ mensagem: "Entrega não encontrada." });
            }
            await Entrega.excluir(id);
            res.status(200).json({ mensagem: "Entrega excluída com sucesso!" });
        } catch (erro) {
            console.error("Erro ao excluir entrega:", erro);
            res.status(500).json({ mensagem: "Erro ao excluir entrega." });
        }
    }
};

module.exports = EntregaController;
