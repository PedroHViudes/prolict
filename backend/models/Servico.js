const db = require('../db');

/**
 * Modelo de dados de Serviços (Baixa Operacional).
 * Registra cada execução técnica vinculada a um item específico.
 * Quando um serviço é criado, a quantidade_executada do item é incrementada.
 */
const Servico = {

    /**
     * Busca todos os serviços cadastrados com informações detalhadas.
     * Realiza JOIN com item, lote e licitação para exibir dados completos.
     * @returns {Array} Lista de serviços com dados dos relacionamentos
     */
    buscarTodos: async () => {
        const sql = `
            SELECT s.*, i.descricao as item_descricao, i.quantidade_ganha, i.quantidade_executada,
                   l.orgao_publico, l.numero_processo 
            FROM servico s
            LEFT JOIN item i ON s.item_id = i.id
            LEFT JOIN lote lo ON i.lote_id = lo.id
            LEFT JOIN licitacao l ON lo.licitacao_id = l.id
            ORDER BY s.data_execucao DESC
        `;
        const [linhas] = await db.query(sql);
        return linhas;
    },

    /**
     * Busca um serviço específico pelo seu ID.
     * @param {number} id - ID do serviço
     * @returns {Object|undefined} Dados do serviço ou undefined se não encontrado
     */
    buscarPorId: async (id) => {
        const sql = `
            SELECT s.*, i.descricao as item_descricao, i.quantidade_ganha, i.quantidade_executada,
                   l.orgao_publico, l.numero_processo 
            FROM servico s
            LEFT JOIN item i ON s.item_id = i.id
            LEFT JOIN lote lo ON i.lote_id = lo.id
            LEFT JOIN licitacao l ON lo.licitacao_id = l.id
            WHERE s.id = ?
        `;
        const [linhas] = await db.query(sql, [id]);
        return linhas[0];
    },

    /**
     * Cria um novo serviço e incrementa a quantidade_executada do item vinculado.
     * Esta é a "baixa operacional" que vincula a execução ao saldo do item.
     * @param {Object} dados - Dados do serviço (item_id, administrador_id, nome_servico, etc.)
     * @returns {Object} Resultado da inserção com o ID gerado
     */
    criar: async (dados) => {
        const { item_id, administrador_id, nome_servico, valor_fixo, data_execucao, descricao_detalhada, quantidade } = dados;
        
        // Validação: verificar se a quantidade solicitada é válida
        if (quantidade && quantidade > 0) {
            const sqlItem = "SELECT quantidade_ganha, quantidade_executada FROM item WHERE id = ?";
            const [itens] = await db.query(sqlItem, [item_id]);
            if (itens.length > 0) {
                const item = itens[0];
                const saldo = item.quantidade_ganha - item.quantidade_executada;
                if (quantidade > saldo) {
                    throw new Error(`Quantidade solicitada (${quantidade}) excede o saldo disponível (${saldo}).`);
                }
            }
        }

        // Inserir o serviço
        const sqlServico = `
            INSERT INTO servico (item_id, administrador_id, nome_servico, valor_fixo, quantidade, data_execucao, descricao_detalhada)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const valores = [item_id, administrador_id, nome_servico, valor_fixo || 0, quantidade || 0, data_execucao || new Date(), descricao_detalhada || null];
        const [resultado] = await db.query(sqlServico, valores);

        // Incrementar a quantidade executada no item (baixa operacional)
        if (quantidade && quantidade > 0) {
            const sqlUpdate = "UPDATE item SET quantidade_executada = quantidade_executada + ? WHERE id = ?";
            await db.query(sqlUpdate, [quantidade, item_id]);
        }

        return resultado;
    },

    /**
     * Atualiza os dados de um serviço existente.
     * @param {number} id - ID do serviço
     * @param {Object} dados - Novos dados do serviço
     * @returns {Object} Resultado da atualização
     */
    atualizar: async (id, dados) => {
        const { nome_servico, valor_fixo, data_execucao, descricao_detalhada } = dados;
        const sql = `
            UPDATE servico 
            SET nome_servico = ?, valor_fixo = ?, data_execucao = ?, descricao_detalhada = ?
            WHERE id = ?
        `;
        const valores = [nome_servico, valor_fixo, data_execucao, descricao_detalhada, id];
        const [resultado] = await db.query(sql, valores);
        return resultado;
    },

    /**
     * Remove um serviço e reverte a quantidade_executada do item vinculado.
     * @param {number} id - ID do serviço
     * @returns {Object} Resultado da exclusão
     */
    excluir: async (id) => {
        // Primeiro busca o serviço para saber qual item e quantidade reverter
        const sqlBusca = "SELECT item_id, quantidade FROM servico WHERE id = ?";
        const [servicos] = await db.query(sqlBusca, [id]);
        if (servicos.length > 0) {
            const servico = servicos[0];
            if (servico.quantidade > 0) {
                // Reverte a quantidade executada no item (desfaz a baixa operacional)
                const sqlReverter = "UPDATE item SET quantidade_executada = GREATEST(quantidade_executada - ?, 0) WHERE id = ?";
                await db.query(sqlReverter, [servico.quantidade, servico.item_id]);
            }
        }
        const sql = "DELETE FROM servico WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    },

    /**
     * Soma o valor total de todos os serviços cadastrados.
     * Utilizado no Dashboard para exibir o valor total dos serviços.
     * @returns {number} Soma dos valores fixos
     */
    somarValorTotal: async () => {
        const sql = "SELECT COALESCE(SUM(valor_fixo), 0) as total FROM servico";
        const [linhas] = await db.query(sql);
        return linhas[0].total;
    }
};

module.exports = Servico;
