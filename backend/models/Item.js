const db = require('../db');

/**
 * Modelo de dados de Itens.
 * Cada item representa um produto/serviço dentro de um lote.
 * Controla a quantidade ganha vs executada (saldo disponível).
 * saldo = quantidade_ganha - quantidade_executada
 */
const Item = {

    /**
     * Busca todos os itens de um lote específico.
     * @param {number} loteId - ID do lote
     * @returns {Array} Lista de itens do lote
     */
    buscarPorLote: async (loteId) => {
        const sql = "SELECT * FROM item WHERE lote_id = ? ORDER BY id";
        const [linhas] = await db.query(sql, [loteId]);
        return linhas;
    },

    /**
     * Busca um item específico pelo seu ID, incluindo dados do lote e licitação.
     * @param {number} id - ID do item
     * @returns {Object|undefined} Dados do item ou undefined se não encontrado
     */
    buscarPorId: async (id) => {
        const sql = `
            SELECT i.*, l.numero_lote, l.valor_total_arrematado,
                   lic.numero_processo, lic.orgao_publico
            FROM item i
            LEFT JOIN lote l ON i.lote_id = l.id
            LEFT JOIN licitacao lic ON l.licitacao_id = lic.id
            WHERE i.id = ?
        `;
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Busca todos os itens de uma licitação específica, agrupados por lote.
     * Inclui saldo_disponivel = quantidade_ganha - quantidade_executada.
     * Utilizado no formulário de serviços para o usuário escolher o item.
     * @param {number} licitacaoId - ID da licitação
     * @returns {Array} Lista de itens com dados do lote e licitação
     */
    buscarPorLicitacao: async (licitacaoId) => {
        const sql = `
            SELECT i.*, lo.numero_lote, lo.descricao as lote_descricao, lo.valor_total_arrematado,
                   lic.numero_processo, lic.orgao_publico, lic.valor_estimado,
                   (i.quantidade_ganha - i.quantidade_executada) as saldo_disponivel
            FROM item i
            LEFT JOIN lote lo ON i.lote_id = lo.id
            LEFT JOIN licitacao lic ON lo.licitacao_id = lic.id
            WHERE lo.licitacao_id = ?
            ORDER BY lo.numero_lote, i.id
        `;
        const [linhas] = await db.query(sql, [licitacaoId]);
        return linhas;
    },

    /**
     * Lista todos os itens cadastrados com informações de lote e licitação.
     * @returns {Array} Lista completa de itens
     */
    buscarTodos: async () => {
        const sql = `
            SELECT i.*, l.numero_lote, l.valor_total_arrematado,
                   lic.numero_processo, lic.orgao_publico
            FROM item i
            LEFT JOIN lote l ON i.lote_id = l.id
            LEFT JOIN licitacao lic ON l.licitacao_id = lic.id
            ORDER BY i.id DESC
        `;
        const [linhas] = await db.query(sql);
        return linhas;
    },

    /**
     * Cria um novo item dentro de um lote.
     * A quantidade_executada inicia em 0.
     * @param {Object} dados - Dados do item (lote_id, descricao, quantidade_ganha, valor_unitario)
     * @returns {Object} Resultado da inserção com o ID gerado
     */
    criar: async (dados) => {
        const { lote_id, descricao, quantidade_ganha, valor_unitario } = dados;
        const sql = `
            INSERT INTO item (lote_id, descricao, quantidade_ganha, valor_unitario)
            VALUES (?, ?, ?, ?)
        `;
        const valores = [lote_id, descricao, quantidade_ganha || 0, valor_unitario || 0];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Atualiza os dados de um item existente.
     * @param {number} id - ID do item
     * @param {Object} dados - Novos dados do item
     * @returns {Object} Resultado da atualização
     */
    atualizar: async (id, dados) => {
        const { descricao, quantidade_ganha, valor_unitario } = dados;
        const sql = "UPDATE item SET descricao = ?, quantidade_ganha = ?, valor_unitario = ? WHERE id = ?";
        const valores = [descricao, quantidade_ganha, valor_unitario, id];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Remove um item do banco de dados.
     * @param {number} id - ID do item
     * @returns {Object} Resultado da exclusão
     */
    excluir: async (id) => {
        const sql = "DELETE FROM item WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
};

module.exports = Item;
