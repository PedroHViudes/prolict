const db = require('../db');

/**
 * Modelo de dados de Itens.
 * Controla a quantidade ganha vs executada (saldo disponível).
 * Operações verificam pertence ao usuário através do lote→licitação.
 */
const Item = {

    /**
     * Busca todos os itens pertencentes a um lote específico.
     * @param {number} loteId - ID do lote pai
     * @returns {Array} Lista de itens cadastrados
     */
    buscarPorLote: async (loteId) => {
        const sql = "SELECT * FROM item WHERE lote_id = ? ORDER BY id";
        const [linhas] = await db.query(sql, [loteId]);
        return linhas;
    },

    /**
     * Soma o valor total financeiro (quantidade * valor_unitario) de todos os itens de um lote,
     * exceto o ignorado (usado em edições).
     * @param {number} loteId - ID do lote
     * @param {number|null} ignorarItemId - ID do item a ser desconsiderado (edição)
     * @returns {number} Soma financeira dos itens do lote
     */
    somarItensLote: async (loteId, ignorarItemId = null) => {
        let sql = "SELECT COALESCE(SUM(quantidade_ganha * valor_unitario), 0) as total FROM item WHERE lote_id = ?";
        const valores = [loteId];
        if (ignorarItemId) {
            sql += " AND id != ?";
            valores.push(ignorarItemId);
        }
        const [linhas] = await db.query(sql, valores);
        return parseFloat(linhas[0].total);
    },

    /**
     * Busca um item pelo seu ID com detalhes do lote e da licitação.
     * @param {number} id - ID do item
     * @returns {Object|undefined} Dados do item
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
     * Busca um item pelo ID verificando o proprietário através do lote e da licitação.
     * @param {number} id - ID do item
     * @param {number} administradorId - ID do usuário logado
     * @returns {Object|undefined} Item se pertencer ao usuário
     */
    buscarPorIdComDono: async (id, administradorId) => {
        const sql = `
            SELECT i.*, lic.status AS licitacao_status FROM item i
            LEFT JOIN lote lo ON i.lote_id = lo.id
            LEFT JOIN licitacao lic ON lo.licitacao_id = lic.id
            WHERE i.id = ? AND lic.administrador_id = ?
        `;
        const [linhas] = await db.query(sql, [id, administradorId]);
        return linhas[0];
    },

    /**
     * Busca todos os itens de uma licitação com cálculo do saldo disponível de cada um.
     * @param {number} licitacaoId - ID da licitação
     * @returns {Array} Lista de itens com saldo calculado
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
     * Busca todos os itens pertencentes ao usuário logado.
     * @param {number} administradorId - ID do usuário logado
     * @returns {Array} Lista completa de itens do usuário
     */
    buscarTodos: async (administradorId) => {
        const sql = `
            SELECT i.*, l.numero_lote, l.valor_total_arrematado,
                   lic.numero_processo, lic.orgao_publico
            FROM item i
            LEFT JOIN lote l ON i.lote_id = l.id
            LEFT JOIN licitacao lic ON l.licitacao_id = lic.id
            WHERE lic.administrador_id = ?
            ORDER BY i.id DESC
        `;
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas;
    },

    /**
     * Cadastra um novo item no lote.
     * @param {Object} dados - Objeto contendo lote_id, descricao, quantidade_ganha e valor_unitario
     * @returns {Object} Resultado da inserção no banco de dados
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
     * @param {number} id - ID do item a ser atualizado
     * @param {Object} dados - Objeto contendo descricao, quantidade_ganha e valor_unitario
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
     * Exclui um item do banco de dados.
     * @param {number} id - ID do item a ser excluído
     * @returns {Object} Resultado da exclusão
     */
    excluir: async (id) => {
        const sql = "DELETE FROM item WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
};

module.exports = Item;
