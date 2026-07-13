const Entrega = require('../models/Entrega');

/**
 * Controller de Entregas.
 * Verifica pertence ao serviço do usuário antes de cada operação.
 */
const EntregaController = {

    listarPorServico: async (req, res) => {
        const { servicoId } = req.params;
        try {
            const servico = await Entrega.verificarServicoDono(servicoId, req.usuario.id);
            if (!servico) {
                return res.status(404).json({ mensagem: "Serviço não encontrado." });
            }
            const entregas = await Entrega.buscarPorServico(servicoId);
            res.status(200).json(entregas);
        } catch (erro) {
            console.error("Erro ao listar entregas:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar entregas." });
        }
    },

    listar: async (req, res) => {
        try {
            const entregas = await Entrega.buscarTodas(req.usuario.id);
            res.status(200).json(entregas);
        } catch (erro) {
            console.error("Erro ao listar entregas:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar entregas." });
        }
    },

    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const entrega = await Entrega.buscarPorIdComDono(id, req.usuario.id);
            if (!entrega) {
                return res.status(404).json({ mensagem: "Entrega não encontrada." });
            }
            const entregaCompleta = await Entrega.buscarPorId(id);
            res.status(200).json(entregaCompleta);
        } catch (erro) {
            console.error("Erro ao buscar entrega:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar a entrega." });
        }
    },

    adicionar: async (req, res) => {
        const { servicoId } = req.params;
        const dados = req.body;
        try {
            const servico = await Entrega.verificarServicoDono(servicoId, req.usuario.id);
            if (!servico) {
                return res.status(404).json({ mensagem: "Serviço não encontrado." });
            }
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

    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;
        try {
            const entrega = await Entrega.buscarPorIdComDono(id, req.usuario.id);
            if (!entrega) {
                return res.status(404).json({ mensagem: "Entrega não encontrada." });
            }
            await Entrega.atualizar(id, dados);
            res.status(200).json({ mensagem: "Entrega atualizada com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar entrega:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar entrega." });
        }
    },

    excluir: async (req, res) => {
        const { id } = req.params;
        try {
            const entrega = await Entrega.buscarPorIdComDono(id, req.usuario.id);
            if (!entrega) {
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
