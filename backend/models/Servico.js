const db = require('../db');

/**
 * Modelo de dados de Serviços (Baixa Operacional).
 * Filtra por administrador_id para isolar dados por usuário.
 */
const Servico = {

    buscarTodos: async (administradorId) => {
        const sql = `
            SELECT s.*, i.descricao as item_descricao, i.quantidade_ganha, i.quantidade_executada,
                   l.orgao_publico, l.numero_processo 
            FROM servico s
            LEFT JOIN item i ON s.item_id = i.id
            LEFT JOIN lote lo ON i.lote_id = lo.id
            LEFT JOIN licitacao l ON lo.licitacao_id = l.id
            WHERE s.administrador_id = ?
            ORDER BY s.data_execucao DESC
        `;
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas;
    },

    buscarPorId: async (id, administradorId) => {
        const sql = `
            SELECT s.*, i.descricao as item_descricao, i.quantidade_ganha, i.quantidade_executada,
                   l.orgao_publico, l.numero_processo 
            FROM servico s
            LEFT JOIN item i ON s.item_id = i.id
            LEFT JOIN lote lo ON i.lote_id = lo.id
            LEFT JOIN licitacao l ON lo.licitacao_id = l.id
            WHERE s.id = ? AND s.administrador_id = ?
        `;
        const [linhas] = await db.query(sql, [id, administradorId]);
        return linhas[0];
    },

    criar: async (dados) => {
        const { item_id, administrador_id, nome_servico, valor_fixo, data_execucao, descricao_detalhada, quantidade } = dados;
        
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

        const sqlServico = `
            INSERT INTO servico (item_id, administrador_id, nome_servico, valor_fixo, quantidade, data_execucao, descricao_detalhada)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const valores = [item_id, administrador_id, nome_servico, valor_fixo || 0, quantidade || 0, data_execucao || new Date(), descricao_detalhada || null];
        const [resultado] = await db.query(sqlServico, valores);

        if (quantidade && quantidade > 0) {
            const sqlUpdate = "UPDATE item SET quantidade_executada = quantidade_executada + ? WHERE id = ?";
            await db.query(sqlUpdate, [quantidade, item_id]);
        }

        return resultado;
    },

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

    excluir: async (id) => {
        const sqlBusca = "SELECT item_id, quantidade FROM servico WHERE id = ?";
        const [servicos] = await db.query(sqlBusca, [id]);
        if (servicos.length > 0) {
            const servico = servicos[0];
            if (servico.quantidade > 0) {
                const sqlReverter = "UPDATE item SET quantidade_executada = GREATEST(quantidade_executada - ?, 0) WHERE id = ?";
                await db.query(sqlReverter, [servico.quantidade, servico.item_id]);
            }
        }
        const sql = "DELETE FROM servico WHERE id = ?";
        const [resultado] = await db.query(sql, [id]);
        return resultado;
    },

    somarValorTotal: async (administradorId) => {
        const sql = "SELECT COALESCE(SUM(valor_fixo), 0) as total FROM servico WHERE administrador_id = ?";
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas[0].total;
    }
};

module.exports = Servico;
