const db = require('../db');

/**
 * Modelo de dados de Entregas.
 * Filtra por administrador_id através de servico→item→lote→licitação.
 */
const Entrega = {

    /**
     * Busca entregas vinculadas a um serviço específico.
     * @param {number} servicoId - ID do serviço
     * @returns {Array} Lista de entregas cadastradas
     */
    buscarPorServico: async (servicoId) => {
        const sql = "SELECT * FROM entrega WHERE servico_id = ? ORDER BY data_recebimento DESC";
        const [linhas] = await db.query(sql, [servicoId]);
        return linhas;
    },

    /**
     * Busca uma entrega pelo seu ID.
     * @param {number} id - ID da entrega
     * @returns {Object|undefined} Dados da entrega
     */
    buscarPorId: async (id) => {
        const sql = "SELECT * FROM entrega WHERE id = ?";
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Busca entrega pelo ID verificando proprietário via serviço.
     * @param {number} id - ID da entrega
     * @param {number} administradorId - ID do usuário logado
     * @returns {Object|undefined} Dados da entrega se pertencer ao usuário
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
     * Verifica se um serviço pertence ao usuário logado.
     * @param {number} servicoId - ID do serviço
     * @param {number} administradorId - ID do usuário logado
     * @returns {Object|undefined} Dados do serviço se for proprietário
     */
    verificarServicoDono: async (servicoId, administradorId) => {
        const sql = "SELECT id FROM servico WHERE id = ? AND administrador_id = ?";
        const [linhas] = await db.query(sql, [servicoId, administradorId]);
        return linhas[0];
    },

    /**
     * Busca todas as entregas registradas pelo usuário logado.
     * @param {number} administradorId - ID do usuário logado
     * @returns {Array} Lista completa de entregas com dados do serviço e da licitação
     */
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

    /**
     * Cadastra um novo comprovante de entrega / recebimento.
     * @param {Object} dados - Dados da entrega (quem_recebeu, telefone, responsavel_entrega, data_recebimento, observacoes)
     * @returns {Object} Resultado da inserção no banco de dados
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
     * Atualiza os dados de uma entrega cadastrada.
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
     * Exclui um registro de entrega do banco de dados.
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
