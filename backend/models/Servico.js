const db = require('../db');

/**
 * Modelo de dados de Serviços (Baixa Operacional).
 * Filtra por administrador_id para isolar dados por usuário.
 */
const Servico = {

    /**
     * Busca todos os serviços realizados pelo usuário logado.
     * @param {number} administradorId - ID do usuário logado
     * @returns {Array} Lista de serviços cadastrados
     */
    buscarTodos: async (administradorId) => {
        const sql = `
            SELECT s.*, i.descricao as item_descricao, i.quantidade_ganha, i.quantidade_executada, i.valor_unitario,
                   l.orgao_publico, l.numero_processo, l.data_vigencia
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

    /**
     * Busca um serviço pelo seu ID verificando pertencimento ao usuário.
     * @param {number} id - ID do serviço
     * @param {number} administradorId - ID do usuário logado
     * @returns {Object|undefined} Dados do serviço
     */
    buscarPorId: async (id, administradorId) => {
        const sql = `
            SELECT s.*, i.descricao as item_descricao, i.quantidade_ganha, i.quantidade_executada, i.valor_unitario,
                   l.orgao_publico, l.numero_processo, l.data_vigencia
            FROM servico s
            LEFT JOIN item i ON s.item_id = i.id
            LEFT JOIN lote lo ON i.lote_id = lo.id
            LEFT JOIN licitacao l ON lo.licitacao_id = l.id
            WHERE s.id = ? AND s.administrador_id = ?
        `;
        const [linhas] = await db.query(sql, [id, administradorId]);
        return linhas[0];
    },

    /**
     * Registra um novo serviço realizado (baixa operacional no item da licitação).
     * @param {Object} dados - Objeto contendo item_id, administrador_id, nome_servico, valor_fixo, data_execucao, descricao_detalhada e quantidade
     * @returns {Object} Resultado da inserção
     */
    criar: async (dados) => {
        const { item_id, administrador_id, nome_servico, valor_fixo, data_execucao, descricao_detalhada, quantidade } = dados;
        
        // RN03 de forma atômica: a baixa no saldo só acontece se ainda houver saldo suficiente.
        // Antes, "conferir e depois atualizar" eram dois passos separados e duas gravações ao mesmo
        // tempo (duplo clique, duas abas) passavam juntas e deixavam o saldo negativo.
        if (quantidade && quantidade > 0) {
            const sqlBaixa = `
                UPDATE item SET quantidade_executada = quantidade_executada + ?
                WHERE id = ? AND (quantidade_ganha - quantidade_executada) >= ?
            `;
            const [baixa] = await db.query(sqlBaixa, [quantidade, item_id, quantidade]);
            if (baixa.affectedRows === 0) {
                const [itens] = await db.query("SELECT quantidade_ganha, quantidade_executada FROM item WHERE id = ?", [item_id]);
                const saldo = itens.length ? itens[0].quantidade_ganha - itens[0].quantidade_executada : 0;
                const erroSaldo = new Error(`Quantidade solicitada (${quantidade}) excede o saldo disponível (${saldo}).`);
                erroSaldo.codigo = 'SALDO_INSUFICIENTE';
                throw erroSaldo;
            }
        }

        // RN08: o serviço executado depois do fim da vigência NÃO é recusado, mas fica marcado
        // (fora_da_vigencia = 1) para aparecer destacado nas listagens e relatórios.
        const foraDaVigencia = await Servico.calcularForaDaVigencia(item_id, data_execucao || null);

        const sqlServico = `
            INSERT INTO servico (item_id, administrador_id, nome_servico, valor_fixo, quantidade, data_execucao, descricao_detalhada, fora_da_vigencia)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const valores = [item_id, administrador_id, nome_servico, valor_fixo || 0, quantidade || 0, data_execucao || new Date(), descricao_detalhada || null, foraDaVigencia ? 1 : 0];
        let resultado;
        try {
            [resultado] = await db.query(sqlServico, valores);
        } catch (erro) {
            // Se o serviço não foi gravado, devolve a quantidade ao saldo do item
            if (quantidade && quantidade > 0) {
                await db.query("UPDATE item SET quantidade_executada = GREATEST(quantidade_executada - ?, 0) WHERE id = ?", [quantidade, item_id]);
            }
            throw erro;
        }

        resultado.foraDaVigencia = foraDaVigencia;
        return resultado;
    },

    /**
     * Verifica, pelo relógio do banco, se a data de execução é posterior ao fim da vigência da licitação do item.
     * @param {number} itemId - ID do item
     * @param {string|null} dataExecucao - Data no formato AAAA-MM-DD (null = hoje)
     * @returns {boolean} true quando o serviço está fora da vigência
     */
    calcularForaDaVigencia: async (itemId, dataExecucao) => {
        const sql = `
            SELECT (lic.data_vigencia IS NOT NULL AND DATE(COALESCE(?, CURDATE())) > lic.data_vigencia) AS fora
            FROM item i
            JOIN lote lo ON i.lote_id = lo.id
            JOIN licitacao lic ON lo.licitacao_id = lic.id
            WHERE i.id = ?
        `;
        const [linhas] = await db.query(sql, [dataExecucao, itemId]);
        return linhas.length > 0 && Number(linhas[0].fora) === 1;
    },

    /**
     * Recalcula a marca de "fora da vigência" de um serviço ou de todos os serviços de uma licitação
     * (usado quando a data do serviço ou a vigência da licitação é alterada).
     */
    recalcularForaDaVigencia: async ({ servicoId = null, licitacaoId = null }) => {
        const sql = `
            UPDATE servico s
            JOIN item i ON s.item_id = i.id
            JOIN lote lo ON i.lote_id = lo.id
            JOIN licitacao lic ON lo.licitacao_id = lic.id
            SET s.fora_da_vigencia = (lic.data_vigencia IS NOT NULL AND s.data_execucao IS NOT NULL AND s.data_execucao > lic.data_vigencia)
            WHERE ${servicoId ? 's.id = ?' : 'lic.id = ?'}
        `;
        const [resultado] = await db.query(sql, [servicoId || licitacaoId]);
        return resultado;
    },

    /**
     * Atualiza os dados de um serviço realizado.
     * @param {number} id - ID do serviço
     * @param {Object} dados - Novas informações do serviço
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
        await Servico.recalcularForaDaVigencia({ servicoId: id });
        return resultado;
    },

    /**
     * Exclui um serviço realizado e estorna a quantidade executada no item.
     * @param {number} id - ID do serviço a ser removido
     * @returns {Object} Resultado da exclusão
     */
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

    /**
     * Soma o valor financeiro total de serviços prestados pelo usuário.
     * @param {number} administradorId - ID do usuário logado
     * @returns {number} Valor total executado em serviços
     */
    somarValorTotal: async (administradorId) => {
        const sql = "SELECT COALESCE(SUM(valor_fixo), 0) as total FROM servico WHERE administrador_id = ?";
        const [linhas] = await db.query(sql, [administradorId]);
        return linhas[0].total;
    }
};

module.exports = Servico;
