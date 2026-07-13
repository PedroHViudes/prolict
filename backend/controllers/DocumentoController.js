const Documento = require('../models/Documento');

/**
 * Controller de Documentos.
 * Gerencia as operações CRUD para documentos (orçamentos, certidões).
 * Cada documento está vinculado a uma licitação e possui data de vencimento.
 */
const DocumentoController = {

    /**
     * Lista todos os documentos de uma licitação específica.
     * Rota: GET /api/licitacoes/:licitacaoId/documentos
     */
    listarPorLicitacao: async (req, res) => {
        const { licitacaoId } = req.params;
        try {
            const documentos = await Documento.buscarPorLicitacao(licitacaoId);
            res.status(200).json(documentos);
        } catch (erro) {
            console.error("Erro ao listar documentos:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar documentos da licitação." });
        }
    },

    /**
     * Lista todos os documentos do sistema.
     * Rota: GET /api/documentos
     */
    listarTodos: async (req, res) => {
        try {
            const documentos = await Documento.buscarTodos();
            res.status(200).json(documentos);
        } catch (erro) {
            console.error("Erro ao listar todos os documentos:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar documentos." });
        }
    },

    /**
     * Busca um documento específico pelo seu ID.
     * Rota: GET /api/documentos/:id
     */
    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const documento = await Documento.buscarPorId(id);
            if (!documento) {
                return res.status(404).json({ mensagem: "Documento não encontrado." });
            }
            res.status(200).json(documento);
        } catch (erro) {
            console.error("Erro ao buscar documento:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar o documento." });
        }
    },

    /**
     * Cadastra um novo documento vinculado a uma licitação.
     * Rota: POST /api/licitacoes/:licitacaoId/documentos
     */
    adicionar: async (req, res) => {
        const { licitacaoId } = req.params;
        const dados = req.body;

        try {
            dados.licitacao_id = licitacaoId;

            // Validação: nome é obrigatório
            if (!dados.nome) {
                return res.status(400).json({ mensagem: "O nome do documento é obrigatório." });
            }

            const resultado = await Documento.criar(dados);
            res.status(201).json({
                mensagem: "Documento cadastrado com sucesso!",
                id: resultado.insertId
            });
        } catch (erro) {
            console.error("Erro ao adicionar documento:", erro);
            res.status(500).json({ mensagem: "Erro ao criar documento no banco." });
        }
    },

    /**
     * Atualiza os dados de um documento existente.
     * Rota: PUT /api/documentos/:id
     */
    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            // Verifica se o documento existe antes de atualizar
            const documentoExistente = await Documento.buscarPorId(id);
            if (!documentoExistente) {
                return res.status(404).json({ mensagem: "Documento não encontrado." });
            }

            await Documento.atualizar(id, dados);
            res.status(200).json({ mensagem: "Documento atualizado com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar documento:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar documento." });
        }
    },

    /**
     * Remove um documento do banco de dados.
     * Rota: DELETE /api/documentos/:id
     */
    excluir: async (req, res) => {
        const { id } = req.params;

        try {
            const documentoExistente = await Documento.buscarPorId(id);
            if (!documentoExistente) {
                return res.status(404).json({ mensagem: "Documento não encontrado." });
            }

            await Documento.excluir(id);
            res.status(200).json({ mensagem: "Documento excluído com sucesso!" });
        } catch (erro) {
            console.error("Erro ao excluir documento:", erro);
            res.status(500).json({ mensagem: "Erro ao excluir documento." });
        }
    },

    /**
     * Busca documentos que vencem nos próximos X dias.
     * Utilizado para alertas de prazo de validade.
     * Rota: GET /api/documentos/vencendo/:dias
     */
    vencendoEm: async (req, res) => {
        const { dias } = req.params;
        try {
            const documentos = await Documento.buscarVencendoEm(parseInt(dias));
            res.status(200).json(documentos);
        } catch (erro) {
            console.error("Erro ao buscar documentos vencendo:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar documentos com vencimento próximo." });
        }
    }
};

module.exports = DocumentoController;
