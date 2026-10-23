const Documento = require('../models/Documento');
const Licitacao = require('../models/Licitacao');

/**
 * Controller de Documentos.
 * Verifica pertence à licitação do usuário antes de cada operação.
 */
const DocumentoController = {

    listarPorLicitacao: async (req, res) => {
        const { licitacaoId } = req.params;
        try {
            const licitacao = await Licitacao.verificarDono(licitacaoId, req.usuario.id);
            if (!licitacao) {
                return res.status(404).json({ mensagem: "Licitação não encontrada." });
            }
            const documentos = await Documento.buscarPorLicitacao(licitacaoId);
            res.status(200).json(documentos);
        } catch (erro) {
            console.error("Erro ao listar documentos:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar documentos da licitação." });
        }
    },

    listarTodos: async (req, res) => {
        try {
            const documentos = await Documento.buscarTodos(req.usuario.id);
            res.status(200).json(documentos);
        } catch (erro) {
            console.error("Erro ao listar todos os documentos:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar documentos." });
        }
    },

    buscar: async (req, res) => {
        const { id } = req.params;
        try {
            const documento = await Documento.buscarPorIdComDono(id, req.usuario.id);
            if (!documento) {
                return res.status(404).json({ mensagem: "Documento não encontrado." });
            }
            const documentoCompleto = await Documento.buscarPorId(id);
            res.status(200).json(documentoCompleto);
        } catch (erro) {
            console.error("Erro ao buscar documento:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar o documento." });
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

            dados.licitacao_id = licitacaoId;

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

    atualizar: async (req, res) => {
        const { id } = req.params;
        const dados = req.body;

        try {
            const documento = await Documento.buscarPorIdComDono(id, req.usuario.id);
            if (!documento) {
                return res.status(404).json({ mensagem: "Documento não encontrado." });
            }

            await Documento.atualizar(id, dados);
            res.status(200).json({ mensagem: "Documento atualizado com sucesso!" });
        } catch (erro) {
            console.error("Erro ao atualizar documento:", erro);
            res.status(500).json({ mensagem: "Erro ao atualizar documento." });
        }
    },

    excluir: async (req, res) => {
        const { id } = req.params;

        try {
            const documento = await Documento.buscarPorIdComDono(id, req.usuario.id);
            if (!documento) {
                return res.status(404).json({ mensagem: "Documento não encontrado." });
            }

            await Documento.excluir(id);
            res.status(200).json({ mensagem: "Documento excluído com sucesso!" });
        } catch (erro) {
            console.error("Erro ao excluir documento:", erro);
            res.status(500).json({ mensagem: "Erro ao excluir documento." });
        }
    },

    vencendoEm: async (req, res) => {
        const { dias } = req.params;
        try {
            const documentos = await Documento.buscarVencendoEm(parseInt(dias), req.usuario.id);
            res.status(200).json(documentos);
        } catch (erro) {
            console.error("Erro ao buscar documentos vencendo:", erro);
            res.status(500).json({ mensagem: "Erro ao buscar documentos com vencimento próximo." });
        }
    }
};

module.exports = DocumentoController;
