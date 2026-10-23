const db = require('../db');

/**
 * Modelo de dados de Lotes.
 * Operações verificam pertence ao usuário através da licitação.
 */
const Lote = {

    /**
     * Busca todos os lotes pertencentes a uma licitação específica.
     * @param {number} licitacaoId - ID da licitação pai
     * @returns {Array} Lista de lotes cadastrados
     */
    buscarPorLicitacao: async (licitacaoId) => {
        const sql = "SELECT * FROM lote WHERE licitacao_id = ? ORDER BY numero_lote";
        const [linhas] = await db.query(sql, [licitacaoId]);
        return linhas;
    },

    /**
     * Soma o valor de todos os lotes de uma licitação, exceto o lote ignorado (opcional).
     * Usado para validação de limites no backend.
     * @param {number} licitacaoId - ID da licitação
     * @param {number|null} ignorarLoteId - ID do lote a ser desconsiderado no cálculo (edição)
     * @returns {number} Soma dos valores totais dos lotes
     */
    somarLotesLicitacao: async (licitacaoId, ignorarLoteId = null) => {
        let sql = "SELECT COALESCE(SUM(valor_total_arrematado), 0) as total FROM lote WHERE licitacao_id = ?";
        const valores = [licitacaoId];
        if (ignorarLoteId) {
            sql += " AND id != ?";
            valores.push(ignorarLoteId);
        }
        const [linhas] = await db.query(sql, valores);
        return parseFloat(linhas[0].total);
    },

    /**
     * Busca um lote pelo seu ID.
     * @param {number} id - ID do lote
     * @returns {Object|undefined} Dados do lote
     */
    buscarPorId: async (id) => {
        const sql = "SELECT * FROM lote WHERE id = ?";
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Busca um lote pelo ID verificando se a licitação associada pertence ao usuário logado.
     * @param {number} id - ID do lote
     * @param {number} administradorId - ID do usuário logado
     * @returns {Object|undefined} Dados do lote se pertencer ao usuário
     */
    buscarPorIdComDono: async (id, administradorId) => {
        const sql = `
            SELECT l.* FROM lote l
            LEFT JOIN licitacao lic ON l.licitacao_id = lic.id
            WHERE l.id = ? AND lic.administrador_id = ?
        `;
        const [linhas] = await db.query(sql, [id, administradorId]);
        return linhas[0];
    },

    /**
     * Cadastra um novo lote vinculado a uma licitação.
     * @param {Object} dados - Objeto contendo licitacao_id, numero_lote, valor_total_arrematado e descricao
     * @returns {Object} Resultado da inserção no banco de dados
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
     * @param {number} id - ID do lote a ser atualizado
     * @param {Object} dados - Objeto contendo numero_lote, valor_total_arrematado e descricao
     * @returns {Object} Resultado da atualização no banco de dados
     */
    atualizar: async (id, dados) => {
        const { numero_lote, valor_total_arrematado, descricao } = dados;
        const sql = "UPDATE lote SET numero_lote = ?, valor_total_arrematado = ?, descricao = ? WHERE id = ?";
        const valores = [numero_lote, valor_total_arrematado, descricao, id];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Exclui um lote do banco de dados.
     * @param {number} id - ID do lote a ser removido
     * @returns {Object} Resultado da exclusão no banco de dados
     */
    excluir: async (id) => {
        const sql = "DELETE FROM lote WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
};

module.exports = Lote;
