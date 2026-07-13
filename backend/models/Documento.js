const db = require('../db');

/**
 * Modelo de dados de Documentos.
 * Armazena metadados de orçamentos e certidões vinculados a uma licitação.
 * A data_vencimento permite alertas de prazo de validade dos documentos.
 */
const Documento = {

    /**
     * Busca todos os documentos de uma licitação específica.
     * @param {number} licitacaoId - ID da licitação
     * @returns {Array} Lista de documentos da licitação
     */
    buscarPorLicitacao: async (licitacaoId) => {
        const sql = "SELECT * FROM documento WHERE licitacao_id = ? ORDER BY criado_em DESC";
        const [linhas] = await db.query(sql, [licitacaoId]);
        return linhas;
    },

    /**
     * Busca um documento específico pelo seu ID.
     * @param {number} id - ID do documento
     * @returns {Object|undefined} Dados do documento ou undefined se não encontrado
     */
    buscarPorId: async (id) => {
        const sql = "SELECT * FROM documento WHERE id = ?";
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Lista todos os documentos cadastrados no sistema.
     * @returns {Array} Lista completa de documentos
     */
    buscarTodos: async () => {
        const sql = `
            SELECT d.*, l.numero_processo, l.orgao_publico
            FROM documento d
            LEFT JOIN licitacao l ON d.licitacao_id = l.id
            ORDER BY d.criado_em DESC
        `;
        const [linhas] = await db.query(sql);
        return linhas;
    },

    /**
     * Cria um novo documento vinculado a uma licitação.
     * @param {Object} dados - Dados do documento (licitacao_id, nome, tipo, arquivo_path, data_vencimento)
     * @returns {Object} Resultado da inserção com o ID gerado
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
     * Atualiza os dados de um documento existente.
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
     * Remove um documento do banco de dados.
     * @param {number} id - ID do documento
     * @returns {Object} Resultado da exclusão
     */
    excluir: async (id) => {
        const sql = "DELETE FROM documento WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    },

    /**
     * Busca documentos com data de vencimento próxima (próximos X dias).
     * Utilizado para alertas de validade de certidões e documentos.
     * @param {number} dias - Número de dias para buscar vencimentos próximos
     * @returns {Array} Lista de documentos que vencem nos próximos dias
     */
    buscarVencendoEm: async (dias) => {
        const sql = `
            SELECT d.*, l.numero_processo, l.orgao_publico
            FROM documento d
            LEFT JOIN licitacao l ON d.licitacao_id = l.id
            WHERE d.data_vencimento IS NOT NULL 
            AND d.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            ORDER BY d.data_vencimento ASC
        `;
        const [linhas] = await db.query(sql, [dias]);
        return linhas;
    }
};

module.exports = Documento;
