const db = require('../db');

/**
 * Modelo de dados de Licitações.
 * Gerencia as operações CRUD completas para a tabela licitacao.
 * Todas as operações filtram por administrador_id para isolar dados por usuário.
 */
const Licitacao = {

    /**
     * Busca todas as licitações do usuário logado.
     */
    buscarTodas: async (administradorId) => {
        const sql = "SELECT * FROM licitacao WHERE administrador_id = ? ORDER BY data_abertura DESC";
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas;
    },

    /**
     * Busca licitações ativas do usuário com saldo calculado.
     */
    buscarAtivas: async (administradorId) => {
        const sql = `
            SELECT l.*,
                   COALESCE(s.total_servicos, 0) as valor_executado,
                   (l.valor_estimado - COALESCE(s.total_servicos, 0)) as saldo
            FROM licitacao l
            LEFT JOIN (
                SELECT lo.licitacao_id, SUM(sv.valor_fixo) as total_servicos
                FROM servico sv
                LEFT JOIN item i ON sv.item_id = i.id
                LEFT JOIN lote lo ON i.lote_id = lo.id
                GROUP BY lo.licitacao_id
            ) s ON l.id = s.licitacao_id
            WHERE l.administrador_id = ? AND l.status = 'Ativa'
            ORDER BY l.data_abertura DESC
        `;
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas;
    },

    /**
     * Busca uma licitação pelo ID, verificando pertence ao usuário.
     */
    buscarPorId: async (id, administradorId) => {
        const sql = "SELECT * FROM licitacao WHERE id = ? AND administrador_id = ?";
        const [linhas] = await db.query(sql, [id, administradorId]);
        return linhas[0];
    },

    /**
     * Busca licitação pelo ID com saldo, verificando pertence ao usuário.
     */
    buscarComSaldo: async (id, administradorId) => {
        const sql = `
            SELECT l.*,
                   COALESCE(s.total_servicos, 0) as valor_executado,
                   (l.valor_estimado - COALESCE(s.total_servicos, 0)) as saldo
            FROM licitacao l
            LEFT JOIN (
                SELECT lo.licitacao_id, SUM(sv.valor_fixo) as total_servicos
                FROM servico sv
                LEFT JOIN item i ON sv.item_id = i.id
                LEFT JOIN lote lo ON i.lote_id = lo.id
                GROUP BY lo.licitacao_id
            ) s ON l.id = s.licitacao_id
            WHERE l.id = ? AND l.administrador_id = ?
        `;
        const [linhas] = await db.query(sql, [id, administradorId]);
        return linhas[0];
    },

    /**
     * Cria uma nova licitação vinculada ao usuário logado.
     */
    criar: async (dados, administradorId) => {
        const { numero_processo, orgao_publico, data_abertura, data_vigencia, valor_estimado, status, observacoes } = dados;
        const sql = `
            INSERT INTO licitacao (administrador_id, numero_processo, orgao_publico, data_abertura, data_vigencia, valor_estimado, status, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const valorAbertura = data_abertura && data_abertura.trim() !== '' ? data_abertura : null;
        const valorVigencia = data_vigencia && data_vigencia.trim() !== '' ? data_vigencia : null;
        const valorEstimado = valor_estimado ? parseFloat(valor_estimado) || 0 : 0;
        const valores = [administradorId, numero_processo, orgao_publico, valorAbertura, valorVigencia, valorEstimado, status || 'Ativa', observacoes || null];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Atualiza uma licitação, verificando pertence ao usuário.
     */
    atualizar: async (id, dados, administradorId) => {
        const { numero_processo, orgao_publico, data_abertura, data_vigencia, valor_estimado, status, observacoes } = dados;
        const sql = `
            UPDATE licitacao 
            SET numero_processo = ?, orgao_publico = ?, data_abertura = ?, data_vigencia = ?, 
                valor_estimado = ?, status = ?, observacoes = ?
            WHERE id = ? AND administrador_id = ?
        `;
        const valorAbertura = data_abertura && data_abertura.trim() !== '' ? data_abertura : null;
        const valorVigencia = data_vigencia && data_vigencia.trim() !== '' ? data_vigencia : null;
        const valorEstimado = valor_estimado ? parseFloat(valor_estimado) || 0 : 0;
        const valores = [numero_processo, orgao_publico, valorAbertura, valorVigencia, valorEstimado, status || 'Ativa', observacoes || null, id, administradorId];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Exclui uma licitação, verificando pertence ao usuário.
     */
    excluir: async (id, administradorId) => {
        const sql = "DELETE FROM licitacao WHERE id = ? AND administrador_id = ?";
        const [resultado] = await db.query(sql, [id, administradorId]);
        return resultado;
    },

    /**
     * Conta licitações por status do usuário.
     */
    contarPorStatus: async (administradorId) => {
        const sql = "SELECT status, COUNT(*) as total FROM licitacao WHERE administrador_id = ? GROUP BY status";
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas;
    },

    /**
     * Soma valor estimado das licitações ativas do usuário.
     */
    somarValorAtivas: async (administradorId) => {
        const sql = "SELECT COALESCE(SUM(valor_estimado), 0) as total FROM licitacao WHERE status = 'Ativa' AND administrador_id = ?";
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas[0].total;
    },

    /**
     * Retorna todas as licitações do usuário com saldo calculado.
     */
    buscarResumoGeral: async (administradorId) => {
        const sql = `
            SELECT l.*,
                   COALESCE(s.total_servicos, 0) as valor_executado,
                   (l.valor_estimado - COALESCE(s.total_servicos, 0)) as saldo
            FROM licitacao l
            LEFT JOIN (
                SELECT lo.licitacao_id, SUM(sv.valor_fixo) as total_servicos
                FROM servico sv
                LEFT JOIN item i ON sv.item_id = i.id
                LEFT JOIN lote lo ON i.lote_id = lo.id
                GROUP BY lo.licitacao_id
            ) s ON l.id = s.licitacao_id
            WHERE l.administrador_id = ?
            ORDER BY l.data_abertura DESC
        `;
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas;
    },

    /**
     * Retorna resumo consolidado do Dashboard do usuário.
     */
    resumoDashboard: async (administradorId) => {
        const sql = `
            SELECT 
                COUNT(*) as total_licitacoes,
                COALESCE(SUM(valor_estimado), 0) as valor_estimado_total,
                COALESCE(s.total_executado, 0) as valor_executado_total,
                (COALESCE(SUM(valor_estimado), 0) - COALESCE(s.total_executado, 0)) as saldo_total
            FROM licitacao l
            LEFT JOIN (
                SELECT lo.licitacao_id, SUM(sv.valor_fixo) as total_executado
                FROM servico sv
                LEFT JOIN item i ON sv.item_id = i.id
                LEFT JOIN lote lo ON i.lote_id = lo.id
                GROUP BY lo.licitacao_id
            ) s ON l.id = s.licitacao_id
            WHERE l.administrador_id = ?
        `;
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas[0];
    },

    /**
     * Verifica se uma licitação pertence ao usuário.
     * Retorna a licitação ou undefined se não pertencer.
     */
    verificarDono: async (licitacaoId, administradorId) => {
        const sql = "SELECT id FROM licitacao WHERE id = ? AND administrador_id = ?";
        const [linhas] = await db.query(sql, [licitacaoId, administradorId]);
        return linhas[0];
    }
};

module.exports = Licitacao;
