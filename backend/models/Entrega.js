const db = require('../db');

/**
 * Modelo de dados de Entregas.
 * Registra quem recebeu o serviço e o responsável pela entrega.
 * Tabela separada para permitir múltiplos recebimentos por serviço.
 */
const Entrega = {

    /**
     * Busca todas as entregas vinculadas a um serviço específico.
     * @param {number} servicoId - ID do serviço
     * @returns {Array} Lista de entregas do serviço
     */
    buscarPorServico: async (servicoId) => {
        const sql = "SELECT * FROM entrega WHERE servico_id = ? ORDER BY data_recebimento DESC";
        const [linhas] = await db.query(sql, [servicoId]);
        return linhas;
    },

    /**
     * Busca uma entrega específica pelo seu ID.
     * @param {number} id - ID da entrega
     * @returns {Object|undefined} Dados da entrega ou undefined se não encontrada
     */
    buscarPorId: async (id) => {
        const sql = "SELECT * FROM entrega WHERE id = ?";
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Busca todas as entregas com dados do serviço, item e licitação.
     * Utilizado na listagem de serviços e relatórios.
     * @returns {Array} Lista completa de entregas com joins
     */
    buscarTodas: async () => {
        const sql = `
            SELECT e.*, s.nome_servico, s.valor_fixo,
                   i.descricao as item_descricao,
                   l.numero_processo, l.orgao_publico
            FROM entrega e
            LEFT JOIN servico s ON e.servico_id = s.id
            LEFT JOIN item i ON s.item_id = i.id
            LEFT JOIN lote lo ON i.lote_id = lo.id
            LEFT JOIN licitacao l ON lo.licitacao_id = l.id
            ORDER BY e.criado_em DESC
        `;
        const [linhas] = await db.query(sql);
        return linhas;
    },

    /**
     * Cria uma nova entrega vinculada a um serviço.
     * @param {Object} dados - Dados da entrega
     * @returns {Object} Resultado da inserção com o ID gerado
     */
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

    /**
     * Atualiza os dados de uma entrega existente.
     * @param {number} id - ID da entrega
     * @param {Object} dados - Novos dados da entrega
     * @returns {Object} Resultado da atualização
     */
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

    /**
     * Remove uma entrega do banco de dados.
     * @param {number} id - ID da entrega
     * @returns {Object} Resultado da exclusão
     */
    excluir: async (id) => {
        const sql = "DELETE FROM entrega WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    }
};

module.exports = Entrega;
