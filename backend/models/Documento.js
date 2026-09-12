const db = require('../db');

/**
 * Modelo de dados de Documentos.
 * Operações verificam pertence ao usuário através da licitação.
 */
const Documento = {

    /**
     * Busca todos os documentos vinculados a uma licitação.
     * @param {number} licitacaoId - ID da licitação
     * @returns {Array} Lista de documentos anexados
     */
    buscarPorLicitacao: async (licitacaoId) => {
        const sql = "SELECT * FROM documento WHERE licitacao_id = ? ORDER BY criado_em DESC";
        const [linhas] = await db.query(sql, [licitacaoId]);
        return linhas;
    },

    /**
     * Busca um documento pelo seu ID.
     * @param {number} id - ID do documento
     * @returns {Object|undefined} Dados do documento
     */
    buscarPorId: async (id) => {
        const sql = "SELECT * FROM documento WHERE id = ?";
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Busca documento pelo ID verificando proprietário via licitação.
     * @param {number} id - ID do documento
     * @param {number} administradorId - ID do usuário logado
     * @returns {Object|undefined} Dados do documento se pertencer ao usuário
     */
    buscarPorIdComDono: async (id, administradorId) => {
        const sql = `
            SELECT d.* FROM documento d
            LEFT JOIN licitacao l ON d.licitacao_id = l.id
            WHERE d.id = ? AND l.administrador_id = ?
        `;
        const [linhas] = await db.query(sql, [id, administradorId]);
        return linhas[0];
    },

    /**
     * Busca todos os documentos anexados pelo usuário logado.
     * @param {number} administradorId - ID do usuário logado
     * @returns {Array} Lista completa de documentos do usuário
     */
    buscarTodos: async (administradorId) => {
        const sql = `
            SELECT d.*, l.numero_processo, l.orgao_publico
            FROM documento d
            LEFT JOIN licitacao l ON d.licitacao_id = l.id
            WHERE l.administrador_id = ?
            ORDER BY d.criado_em DESC
        `;
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas;
    },

    /**
     * Cadastra um novo documento de edital/anexo para uma licitação.
     * @param {Object} dados - Objeto contendo licitacao_id, nome, tipo, arquivo_path e data_vencimento
     * @returns {Object} Resultado da inserção no banco
     */
    criar: async (dados) => {
        const { licitacao_id, nome, tipo, arquivo_path, data_vencimento } = dados;
        const sql = `
            INSERT INTO documento (licitacao_id, nome, tipo, arquivo_path, data_vencimento)
            VALUES (?, ?, ?, ?, ?)
        `;
        const valores = [licitacao_id, nome, tipo || null, arquivo_path || null, data_vencimento || null];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Atualiza os dados de um documento.
     * @param {number} id - ID do documento
     * @param {Object} dados - Novos dados do documento
     * @returns {Object} Resultado da atualização
     */
    atualizar: async (id, dados) => {
        const { nome, tipo, arquivo_path, data_vencimento } = dados;
        const sql = "UPDATE documento SET nome = ?, tipo = ?, arquivo_path = ?, data_vencimento = ? WHERE id = ?";
        const valores = [nome, tipo, arquivo_path, data_vencimento, id];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Exclui um documento do banco de dados.
     * @param {number} id - ID do documento
     * @returns {Object} Resultado da exclusão
     */
    excluir: async (id) => {
        const sql = "DELETE FROM documento WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    },

    /**
     * Busca documentos com data de vencimento próxima para alerta do usuário.
     * @param {number} dias - Intervalo de dias para verificar o vencimento
     * @param {number} administradorId - ID do usuário logado
     * @returns {Array} Lista de documentos prestes a vencer
     */
    buscarVencendoEm: async (dias, administradorId) => {
        const sql = `
            SELECT d.*, l.numero_processo, l.orgao_publico
            FROM documento d
            LEFT JOIN licitacao l ON d.licitacao_id = l.id
            WHERE l.administrador_id = ?
            AND d.data_vencimento IS NOT NULL 
            AND d.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            ORDER BY d.data_vencimento ASC
        `;
        const [linhas] = await db.query(sql, [administradorId, dias]);
        return linhas;
    }
};

module.exports = Documento;
