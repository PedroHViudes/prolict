const db = require('../db');

/**
 * Modelo de dados de Documentos.
 * Operações verificam pertence ao usuário através da licitação.
 */
const Documento = {

    buscarPorLicitacao: async (licitacaoId) => {
        const sql = "SELECT * FROM documento WHERE licitacao_id = ? ORDER BY criado_em DESC";
        const [linhas] = await db.query(sql, [licitacaoId]);
        return linhas;
    },

    buscarPorId: async (id) => {
        const sql = "SELECT * FROM documento WHERE id = ?";
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Busca documento pelo ID com verificação de dono via licitação.
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

    atualizar: async (id, dados) => {
        const { nome, tipo, arquivo_path, data_vencimento } = dados;
        const sql = "UPDATE documento SET nome = ?, tipo = ?, arquivo_path = ?, data_vencimento = ? WHERE id = ?";
        const valores = [nome, tipo, arquivo_path, data_vencimento, id];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    excluir: async (id) => {
        const sql = "DELETE FROM documento WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    },

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
