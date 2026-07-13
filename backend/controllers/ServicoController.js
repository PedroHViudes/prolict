const Servico = require('../models/Servico');

/**
 * Controller de Serviços.
 * Gerencia as operações CRUD completas para serviços (baixa operacional).
 * Cada serviço representa uma execução técnica vinculada a um item.
 */
const ServicoController = {

    /**
     * Lista todos os serviços cadastrados com dados detalhados.
     * Rota: GET /api/servicos
     */
    listar: async (req, res) => {
        try {
            const servicos = await Servico.buscarTodos();
            res.status(200).json(servicos);
        } catch (erro) {
            console.error("Erro ao listar serviços:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar serviços no banco de dados." });
        }
    },

    /**
     * Busca um serviço específico pelo seu ID.
     * Rota: GET /api/servicos/:id
     */
    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const servico = await Servico.buscarPorId(id);
            if (!servico) {
                return res.status(404).json({ mensagem: "Serviço não encontrado." });
            }
            res.status(200).json(servico);
        } catch (erro) {
            console.error("Erro ao buscar serviço:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar o serviço." });
        }
    },

    /**
     * Cadastra um novo serviço e executa a baixa operacional no item.
     * A quantidade executada do item é incrementada automaticamente.
     * Rota: POST /api/servicos
     */
    adicionar: async (req, res) => {
        try {
            const dados = req.body;

            // O administrador_id vem do token JWT (middleware de autenticação)
            dados.administrador_id = req.usuario.id;

            // Validação: campos obrigatórios
            if (!dados.item_id || !dados.nome_servico) {
                return res.status(400).json({ mensagem: "Os campos 'item_id' e 'nome do serviço' são obrigatórios." });
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

    /**
     * Atualiza os dados de um serviço existente.
     * Rota: PUT /api/servicos/:id
     */
    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            // Verifica se o serviço existe antes de atualizar
            const servicoExistente = await Servico.buscarPorId(id);
            if (!servicoExistente) {
                return res.status(404).json({ mensagem: "Serviço não encontrado." });
            }

            // Validação: campos obrigatórios
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

    /**
     * Remove um serviço do banco de dados.
     * Rota: DELETE /api/servicos/:id
     */
    excluir: async (req, res) => {
        const { id } = req.params;

        try {
            // Verifica se o serviço existe antes de excluir
            const servicoExistente = await Servico.buscarPorId(id);
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

    /**
     * Retorna o valor total dos serviços para o Dashboard.
     * Rota: GET /api/servicos/dashboard/valor-total
     */
    valorTotal: async (req, res) => {
        try {
            const total = await Servico.somarValorTotal();
            res.status(200).json({ valorTotal: total });
        } catch (erro) {
            console.error("Erro ao calcular valor total:", erro);
            res.status(500).json({ mensagem: "Erro ao calcular valor total dos serviços." });
        }
    }
};

module.exports = ServicoController;
