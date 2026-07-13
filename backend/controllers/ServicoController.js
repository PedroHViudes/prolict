const Servico = require('../models/Servico');
const Item = require('../models/Item');

/**
 * Controller de Serviços.
 * Filtra por administrador_id para isolar dados por usuário.
 */
const ServicoController = {

    listar: async (req, res) => {
        try {
            const servicos = await Servico.buscarTodos(req.usuario.id);
            res.status(200).json(servicos);
        } catch (erro) {
            console.error("Erro ao listar serviços:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar serviços no banco de dados." });
        }
    },

    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const servico = await Servico.buscarPorId(id, req.usuario.id);
            if (!servico) {
                return res.status(404).json({ mensagem: "Serviço não encontrado." });
            }
            res.status(200).json(servico);
        } catch (erro) {
            console.error("Erro ao buscar serviço:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar o serviço." });
        }
    },

    adicionar: async (req, res) => {
        try {
            const dados = req.body;
            dados.administrador_id = req.usuario.id;

            if (!dados.item_id || !dados.nome_servico) {
                return res.status(400).json({ mensagem: "Os campos 'item_id' e 'nome do serviço' são obrigatórios." });
            }

            const item = await Item.buscarPorIdComDono(dados.item_id, req.usuario.id);
            if (!item) {
                return res.status(404).json({ mensagem: "Item não encontrado." });
            }

            const resultado = await Servico.criar(dados);
            res.status(201).json({
                mensagem: "Serviço registrado com sucesso!",
                id: resultado.insertId
            });
        } catch (erro) {
            console.error("Erro ao registrar serviço:", erro);
            res.status(500).json({ mensagem: "Erro ao registrar serviço no banco de dados." });
        }
    },

    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            const servicoExistente = await Servico.buscarPorId(id, req.usuario.id);
            if (!servicoExistente) {
                return res.status(404).json({ mensagem: "Serviço não encontrado." });
            }

            if (!dados.nome_servico) {
                return res.status(400).json({ mensagem: "O campo 'nome do serviço' é obrigatório." });
            }

            await Servico.atualizar(id, dados);
            res.status(200).json({ mensagem: "Serviço atualizado com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar serviço:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar serviço." });
        }
    },

    excluir: async (req, res) => {
        const { id } = req.params;

        try {
            const servicoExistente = await Servico.buscarPorId(id, req.usuario.id);
            if (!servicoExistente) {
                return res.status(404).json({ mensagem: "Serviço não encontrado." });
            }

            await Servico.excluir(id);
            res.status(200).json({ mensagem: "Serviço excluído com sucesso!" });
        } catch (erro) {
            console.error("Erro ao excluir serviço:", erro);
            res.status(500).json({ mensagem: "Erro ao excluir serviço." });
        }
    },

    valorTotal: async (req, res) => {
        try {
            const total = await Servico.somarValorTotal(req.usuario.id);
            res.status(200).json({ valorTotal: total });
        } catch (erro) {
            console.error("Erro ao calcular valor total:", erro);
            res.status(500).json({ mensagem: "Erro ao calcular valor total dos serviços." });
        }
    }
};

module.exports = ServicoController;
