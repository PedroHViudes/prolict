const db = require('../db');

/**
 * Modelo de dados de Itens.
 * Controla a quantidade ganha vs executada (saldo disponível).
 * Operações verificam pertence ao usuário através do lote→licitação.
 */
const Item = {

    buscarPorLote: async (loteId) => {
        const sql = "SELECT * FROM item WHERE lote_id = ? ORDER BY id";
        const [linhas] = await db.query(sql, [loteId]);
        return linhas;
    },

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
     * Busca item pelo ID com verificação de dono via lote→licitação.
     */
    buscarPorIdComDono: async (id, administradorId) => {
        const sql = `
            SELECT i.* FROM item i
            LEFT JOIN lote lo ON i.lote_id = lo.id
            LEFT JOIN licitacao lic ON lo.licitacao_id = lic.id
            WHERE i.id = ? AND lic.administrador_id = ?
        `;
        const [linhas] = await db.query(sql, [id, administradorId]);
        return linhas[0];
    },

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

    atualizar: async (id, dados) => {
        const { descricao, quantidade_ganha, valor_unitario } = dados;
        const sql = "UPDATE item SET descricao = ?, quantidade_ganha = ?, valor_unitario = ? WHERE id = ?";
        const valores = [descricao, quantidade_ganha, valor_unitario, id];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    excluir: async (id) => {
        const sql = "DELETE FROM item WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
};

module.exports = Item;
