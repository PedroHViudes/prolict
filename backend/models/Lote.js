const db = require('../db');

/**
 * Modelo de dados de Lotes.
 * Operações verificam pertence ao usuário através da licitação.
 */
const Lote = {

    buscarPorLicitacao: async (licitacaoId) => {
        const sql = "SELECT * FROM lote WHERE licitacao_id = ? ORDER BY numero_lote";
        const [linhas] = await db.query(sql, [licitacaoId]);
        return linhas;
    },

    buscarPorId: async (id) => {
        const sql = "SELECT * FROM lote WHERE id = ?";
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Busca lote pelo ID com verificação de dono via licitação.
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

    atualizar: async (id, dados) => {
        const { numero_lote, valor_total_arrematado, descricao } = dados;
        const sql = "UPDATE lote SET numero_lote = ?, valor_total_arrematado = ?, descricao = ? WHERE id = ?";
        const valores = [numero_lote, valor_total_arrematado, descricao, id];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    excluir: async (id) => {
        const sql = "DELETE FROM lote WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
};

module.exports = Lote;
