const db = require('../db');

/**
 * Modelo de dados de Entregas.
 * Filtra por administrador_id através de servico→item→lote→licitação.
 */
const Entrega = {

    buscarPorServico: async (servicoId) => {
        const sql = "SELECT * FROM entrega WHERE servico_id = ? ORDER BY data_recebimento DESC";
        const [linhas] = await db.query(sql, [servicoId]);
        return linhas;
    },

    buscarPorId: async (id) => {
        const sql = "SELECT * FROM entrega WHERE id = ?";
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Busca entrega pelo ID com verificação de dono via servico→item→lote→licitação.
     */
    buscarPorIdComDono: async (id, administradorId) => {
        const sql = `
            SELECT e.* FROM entrega e
            LEFT JOIN servico s ON e.servico_id = s.id
            WHERE e.id = ? AND s.administrador_id = ?
        `;
        const [linhas] = await db.query(sql, [id, administradorId]);
        return linhas[0];
    },

    /**
     * Verifica se um serviço pertence ao usuário.
     */
    verificarServicoDono: async (servicoId, administradorId) => {
        const sql = "SELECT id FROM servico WHERE id = ? AND administrador_id = ?";
        const [linhas] = await db.query(sql, [servicoId, administradorId]);
        return linhas[0];
    },

    buscarTodas: async (administradorId) => {
        const sql = `
            SELECT e.*, s.nome_servico, s.valor_fixo,
                   i.descricao as item_descricao,
                   l.numero_processo, l.orgao_publico
            FROM entrega e
            LEFT JOIN servico s ON e.servico_id = s.id
            LEFT JOIN item i ON s.item_id = i.id
            LEFT JOIN lote lo ON i.lote_id = lo.id
            LEFT JOIN licitacao l ON lo.licitacao_id = l.id
            WHERE s.administrador_id = ?
            ORDER BY e.criado_em DESC
        `;
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas;
    },

    criar: async (dados) => {
        const { servico_id, quem_recebeu, telefone, responsavel_entrega, data_recebimento, observacoes } = dados;
        const sql = `
            INSERT INTO entrega (servico_id, quem_recebeu, telefone, responsavel_entrega, data_recebimento, observacoes)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const valores = [
            servico_id,
            quem_recebeu || null,
            telefone || null,
            responsavel_entrega || null,
            data_recebimento || null,
            observacoes || null
        ];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    atualizar: async (id, dados) => {
        const { quem_recebeu, telefone, responsavel_entrega, data_recebimento, observacoes } = dados;
        const sql = `
            UPDATE entrega 
            SET quem_recebeu = ?, telefone = ?, responsavel_entrega = ?, 
                data_recebimento = ?, observacoes = ?
            WHERE id = ?
        `;
        const valores = [
            quem_recebeu || null,
            telefone || null,
            responsavel_entrega || null,
            data_recebimento || null,
            observacoes || null,
            id
        ];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    excluir: async (id) => {
        const sql = "DELETE FROM entrega WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
};

module.exports = Entrega;
