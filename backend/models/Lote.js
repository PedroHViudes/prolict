const db = require('../db');

/**
 * Modelo de dados de Lotes.
 * Um lote agrupa itens dentro de uma licitação.
 * Cada lote guarda o valor total arrematado e seus itens vinculados.
 */
const Lote = {

    /**
     * Busca todos os lotes de uma licitação específica.
     * @param {number} licitacaoId - ID da licitação
     * @returns {Array} Lista de lotes da licitação
     */
    buscarPorLicitacao: async (licitacaoId) => {
        const sql = "SELECT * FROM lote WHERE licitacao_id = ? ORDER BY numero_lote";
        const [linhas] = await db.query(sql, [licitacaoId]);
        return linhas;
    },

    /**
     * Busca um lote específico pelo seu ID.
     * @param {number} id - ID do lote
     * @returns {Object|undefined} Dados do lote ou undefined se não encontrado
     */
    buscarPorId: async (id) => {
        const sql = "SELECT * FROM lote WHERE id = ?";
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Cria um novo lote vinculado a uma licitação.
     * @param {Object} dados - Dados do lote (licitacao_id, numero_lote, valor, descricao)
     * @returns {Object} Resultado da inserção com o ID gerado
     */
    criar: async (dados) => {
        const { licitacao_id, numero_lote, valor_total_arrematado, descricao } = dados;
        const sql = `
            INSERT INTO lote (licitacao_id, numero_lote, valor_total_arrematado, descricao)
            VALUES (?, ?, ?, ?)
        `;
        const valores = [licitacao_id, numero_lote, valor_total_arrematado || 0, descricao || null];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Atualiza os dados de um lote existente.
     * @param {number} id - ID do lote
     * @param {Object} dados - Novos dados do lote
     * @returns {Object} Resultado da atualização
     */
    atualizar: async (id, dados) => {
        const { numero_lote, valor_total_arrematado, descricao } = dados;
        const sql = "UPDATE lote SET numero_lote = ?, valor_total_arrematado = ?, descricao = ? WHERE id = ?";
        const valores = [numero_lote, valor_total_arrematado, descricao, id];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Remove um lote e todos os itens vinculados (CASCADE).
     * @param {number} id - ID do lote
     * @returns {Object} Resultado da exclusão
     */
    excluir: async (id) => {
        const sql = "DELETE FROM lote WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
};

module.exports = Lote;
