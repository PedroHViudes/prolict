const db = require('../db');

/**
 * Modelo de dados de Licitações.
 * Gerencia as operações CRUD completas para a tabela licitacao.
 * Uma licitação representa um edital público com seus lotes e itens.
 */
const Licitacao = {

    /**
     * Busca todas as licitações cadastradas, ordenadas pela data de abertura.
     * @returns {Array} Lista de todas as licitações
     */
    buscarTodas: async () => {
        const sql = "SELECT * FROM licitacao ORDER BY data_abertura DESC";
        const [linhas] = await db.query(sql);
        return linhas;
    },

    /**
     * Busca apenas licitações ativas com saldo calculado.
     * Utilizado no Dashboard para exibir a tabela com progresso.
     * @returns {Array} Lista de licitações ativas com valor_executado e saldo
     */
    buscarAtivas: async () => {
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
            WHERE l.status = 'Ativa'
            ORDER BY l.data_abertura DESC
        `;
        const [linhas] = await db.query(sql);
        return linhas;
    },

    /**
     * Busca uma licitação específica pelo seu ID.
     * @param {number} id - ID da licitação
     * @returns {Object|undefined} Dados da licitação ou undefined se não encontrada
     */
    buscarPorId: async (id) => {
        const sql = "SELECT * FROM licitacao WHERE id = ?";
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Busca uma licitação pelo ID com saldo calculado.
     * Saldo = valor_estimado - soma dos valor_fixo dos serviços vinculados.
     * @param {number} id - ID da licitação
     * @returns {Object|undefined} Dados da licitação com saldo
     */
    buscarComSaldo: async (id) => {
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
            WHERE l.id = ?
        `;
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Cria uma nova licitação no banco de dados.
     * O status padrão é 'Aberto' caso não seja informado.
     * @param {Object} dados - Dados da licitação (numero_processo, orgao_publico, datas, valor, status)
     * @returns {Object} Resultado da inserção com o ID gerado
     */
    criar: async (dados) => {
        const { numero_processo, orgao_publico, data_abertura, data_vigencia, valor_estimado, status, observacoes } = dados;
        const sql = `
            INSERT INTO licitacao (numero_processo, orgao_publico, data_abertura, data_vigencia, valor_estimado, status, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        // Converte strings vazias para null (dates e valores opcionais)
        const valorAbertura = data_abertura && data_abertura.trim() !== '' ? data_abertura : null;
        const valorVigencia = data_vigencia && data_vigencia.trim() !== '' ? data_vigencia : null;
        const valorEstimado = valor_estimado ? parseFloat(valor_estimado) || 0 : 0;
        const valores = [numero_processo, orgao_publico, valorAbertura, valorVigencia, valorEstimado, status || 'Ativa', observacoes || null];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Atualiza os dados de uma licitação existente.
     * @param {number} id - ID da licitação
     * @param {Object} dados - Novos dados da licitação
     * @returns {Object} Resultado da atualização
     */
    atualizar: async (id, dados) => {
        const { numero_processo, orgao_publico, data_abertura, data_vigencia, valor_estimado, status, observacoes } = dados;
        const sql = `
            UPDATE licitacao 
            SET numero_processo = ?, orgao_publico = ?, data_abertura = ?, data_vigencia = ?, 
                valor_estimado = ?, status = ?, observacoes = ?
            WHERE id = ?
        `;
        // Converte strings vazias para null (dates e valores opcionais)
        const valorAbertura = data_abertura && data_abertura.trim() !== '' ? data_abertura : null;
        const valorVigencia = data_vigencia && data_vigencia.trim() !== '' ? data_vigencia : null;
        const valorEstimado = valor_estimado ? parseFloat(valor_estimado) || 0 : 0;
        const valores = [numero_processo, orgao_publico, valorAbertura, valorVigencia, valorEstimado, status || 'Ativa', observacoes || null, id];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Remove uma licitação e todos os dados vinculados (lotes, itens, serviços, documentos)
     * devido ao CASCADE configurado nas chaves estrangeiras.
     * @param {number} id - ID da licitação
     * @returns {Object} Resultado da exclusão
     */
    excluir: async (id) => {
        const sql = "DELETE FROM licitacao WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    },

    /**
     * Conta o total de licitações por status.
     * Utilizado no Dashboard para exibir os cards de resumo.
     * @returns {Object} Objeto com a contagem por status
     */
    contarPorStatus: async () => {
        const sql = "SELECT status, COUNT(*) as total FROM licitacao GROUP BY status";
        const [linhas] = await db.query(sql);
        return linhas;
    },

    /**
     * Soma o valor estimado de todas as licitações ativas.
     * @returns {number} Soma dos valores estimados
     */
    somarValorAtivas: async () => {
        const sql = "SELECT COALESCE(SUM(valor_estimado), 0) as total FROM licitacao WHERE status = 'Ativa'";
        const [linhas] = await db.query(sql);
        return linhas[0].total;
    },

    /**
     * Retorna todas as licitações com saldo calculado.
     * Utilizado no Dashboard e Relatórios para exibir resumo geral.
     * @returns {Array} Lista de licitações com valor_executado e saldo
     */
    buscarResumoGeral: async () => {
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
            ORDER BY l.data_abertura DESC
        `;
        const [linhas] = await db.query(sql);
        return linhas;
    },

    /**
     * Retorna o resumo consolidado para o Dashboard.
     * Conta licitações, soma valores estimados, executados e saldo total.
     * @returns {Object} Resumo geral com totais
     */
    resumoDashboard: async () => {
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
        `;
        const [linhas] = await db.query(sql);
        return linhas[0];
    }
};

module.exports = Licitacao;
