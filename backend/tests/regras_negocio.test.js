const request = require('supertest');
const db = require('../db');

// Importa app express do backend ou conecta via HTTP na porta
let app;
try {
    app = require('../index');
} catch (e) {
    console.error("Erro ao importar index:", e);
}

describe('Suíte de Testes das Regras de Negócio (RN01 - RN10)', () => {
    let tokenA, tokenB;
    let userA = { nome: 'Usuário RN A', email: `rn_a_${Date.now()}@teste.com`, senha: 'Senha@123' };
    let userB = { nome: 'Usuário RN B', email: `rn_b_${Date.now()}@teste.com`, senha: 'Senha@123' };

    beforeAll(async () => {
        // Cadastra e loga usuário A
        await request(app).post('/api/cadastro').send(userA);
        const resLoginA = await request(app).post('/api/login').send({ email: userA.email, senha: userA.senha });
        tokenA = resLoginA.body.token;

        // Cadastra e loga usuário B
        await request(app).post('/api/cadastro').send(userB);
        const resLoginB = await request(app).post('/api/login').send({ email: userB.email, senha: userB.senha });
        tokenB = resLoginB.body.token;
    });

    afterAll(async () => {
        // Limpa usuários de teste
        if (tokenA) await request(app).delete('/api/perfil').set('Authorization', `Bearer ${tokenA}`);
        if (tokenB) await request(app).delete('/api/perfil').set('Authorization', `Bearer ${tokenB}`);
        await db.end();
    });

    describe('RN01: Soma dos lotes e limite do valor estimado da licitação', () => {
        let licitacaoId;

        test('Deve criar licitação e validar que soma dos lotes não pode exceder o valor estimado', async () => {
            const resLic = await request(app)
                .post('/api/licitacoes')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    numero_processo: 'RN01-01',
                    orgao_publico: 'Prefeitura RN01',
                    valor_estimado: 10000,
                    status: 'Ativa'
                });
            expect(resLic.status).toBe(201);
            licitacaoId = resLic.body.id;

            const resLote1 = await request(app)
                .post(`/api/licitacoes/${licitacaoId}/lotes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_lote: 'L1', valor_total_arrematado: 6000 });
            expect(resLote1.status).toBe(201);

            const resLote2Excesso = await request(app)
                .post(`/api/licitacoes/${licitacaoId}/lotes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_lote: 'L2', valor_total_arrematado: 5000 });
            expect(resLote2Excesso.status).toBe(400);

            const resLote2OK = await request(app)
                .post(`/api/licitacoes/${licitacaoId}/lotes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_lote: 'L2', valor_total_arrematado: 4000 });
            expect(resLote2OK.status).toBe(201);
        });

        test('Não deve permitir reduzir o valor estimado abaixo da soma dos lotes nem zerá-lo com lotes cadastrados', async () => {
            const resReduzir = await request(app)
                .put(`/api/licitacoes/${licitacaoId}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    numero_processo: 'RN01-01',
                    orgao_publico: 'Prefeitura RN01',
                    valor_estimado: 9000,
                    status: 'Ativa'
                });
            expect(resReduzir.status).toBe(400);

            const resZerar = await request(app)
                .put(`/api/licitacoes/${licitacaoId}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    numero_processo: 'RN01-01',
                    orgao_publico: 'Prefeitura RN01',
                    valor_estimado: 0,
                    status: 'Ativa'
                });
            expect(resZerar.status).toBe(400);
        });
    });

    describe('RN02: Soma dos itens e limite do valor arrematado do lote', () => {
        let licitacaoId, loteId;

        beforeAll(async () => {
            const resLic = await request(app)
                .post('/api/licitacoes')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    numero_processo: 'RN02-01',
                    orgao_publico: 'Prefeitura RN02',
                    valor_estimado: 20000,
                    status: 'Ativa'
                });
            licitacaoId = resLic.body.id;

            const resLote = await request(app)
                .post(`/api/licitacoes/${licitacaoId}/lotes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_lote: 'L1', valor_total_arrematado: 5000 });
            loteId = resLote.body.id;
        });

        test('Soma (quantidade x valor_unitario) dos itens não pode ultrapassar o valor arrematado do lote', async () => {
            const resItem1 = await request(app)
                .post(`/api/lotes/${loteId}/itens`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ descricao: 'Item 1', quantidade_ganha: 10, valor_unitario: 300 });
            expect(resItem1.status).toBe(201);

            const resItemExcesso = await request(app)
                .post(`/api/lotes/${loteId}/itens`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ descricao: 'Item Excesso', quantidade_ganha: 10, valor_unitario: 300 });
            expect(resItemExcesso.status).toBe(400);

            const resItem2 = await request(app)
                .post(`/api/lotes/${loteId}/itens`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ descricao: 'Item 2', quantidade_ganha: 10, valor_unitario: 200 });
            expect(resItem2.status).toBe(201);
        });
    });

    describe('RN03: Limite de saldo de serviço e requisições simultâneas', () => {
        let itemId;

        beforeAll(async () => {
            const resLic = await request(app)
                .post('/api/licitacoes')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    numero_processo: 'RN03-01',
                    orgao_publico: 'Prefeitura RN03',
                    valor_estimado: 50000,
                    status: 'Ativa'
                });
            const resLote = await request(app)
                .post(`/api/licitacoes/${resLic.body.id}/lotes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_lote: 'L1', valor_total_arrematado: 50000 });
            const resItem = await request(app)
                .post(`/api/lotes/${resLote.body.id}/itens`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ descricao: 'Serviço Limite', quantidade_ganha: 50, valor_unitario: 100 });
            itemId = resItem.body.id;
        });

        test('Deve aceitar serviço se executado + novo <= ganho e recusar com HTTP 400 e mensagem do saldo se exceder', async () => {
            const resServ1 = await request(app)
                .post('/api/servicos')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ item_id: itemId, nome_servico: 'Manutenção 1', quantidade: 30, valor_fixo: 3000 });
            expect(resServ1.status).toBe(201);

            const resServExcesso = await request(app)
                .post('/api/servicos')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ item_id: itemId, nome_servico: 'Manutenção Excesso', quantidade: 25, valor_fixo: 2500 });
            expect(resServExcesso.status).toBe(400);
            expect(resServExcesso.body.mensagem).toMatch(/saldo/i);
        });

        test('Deve garantir integridade em requisições simultâneas (concorrência)', async () => {
            const reqs = [
                request(app).post('/api/servicos').set('Authorization', `Bearer ${tokenA}`).send({ item_id: itemId, nome_servico: 'Concorrente 1', quantidade: 15, valor_fixo: 1500 }),
                request(app).post('/api/servicos').set('Authorization', `Bearer ${tokenA}`).send({ item_id: itemId, nome_servico: 'Concorrente 2', quantidade: 15, valor_fixo: 1500 })
            ];
            const resultados = await Promise.all(reqs);
            const aceitos = resultados.filter(r => r.status === 201).length;
            const recusados = resultados.filter(r => r.status === 400).length;

            expect(aceitos).toBe(1);
            expect(recusados).toBe(1);
        });
    });

    describe('RN04 e RN05: Edição e Exclusão de Serviços', () => {
        let itemId, servicoId;

        beforeAll(async () => {
            const resLic = await request(app)
                .post('/api/licitacoes')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    numero_processo: 'RN04-05',
                    orgao_publico: 'Prefeitura RN04',
                    valor_estimado: 10000,
                    status: 'Ativa'
                });
            const resLote = await request(app)
                .post(`/api/licitacoes/${resLic.body.id}/lotes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_lote: 'L1', valor_total_arrematado: 10000 });
            const resItem = await request(app)
                .post(`/api/lotes/${resLote.body.id}/itens`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ descricao: 'Item para edição/exclusão', quantidade_ganha: 20, valor_unitario: 100 });
            itemId = resItem.body.id;

            const resServ = await request(app)
                .post('/api/servicos')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ item_id: itemId, nome_servico: 'Serviço Inicial', quantidade: 10, valor_fixo: 1000 });
            servicoId = resServ.body.id;
        });

        test('RN04: Editar um serviço não altera a quantidade executada do item', async () => {
            const resEdit = await request(app)
                .put(`/api/servicos/${servicoId}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ nome_servico: 'Serviço Editado', valor_fixo: 1200, quantidade: 5 });
            expect(resEdit.status).toBe(200);

            const resItem = await request(app)
                .get(`/api/itens/${itemId}`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(resItem.body.quantidade_executada).toBe(10);
        });

        test('RN05: Excluir um serviço devolve a quantidade executada ao saldo do item', async () => {
            const resDel = await request(app)
                .delete(`/api/servicos/${servicoId}`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(resDel.status).toBe(200);

            const resItem = await request(app)
                .get(`/api/itens/${itemId}`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(resItem.body.quantidade_executada).toBe(0);
        });
    });

    describe('RN06: Isolamento total entre contas (IDOR)', () => {
        let licitacaoAId, loteAId, itemAId, servicoAId;

        beforeAll(async () => {
            const resLic = await request(app)
                .post('/api/licitacoes')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_processo: 'RN06-A', orgao_publico: 'Órgão A', valor_estimado: 5000 });
            licitacaoAId = resLic.body.id;

            const resLote = await request(app)
                .post(`/api/licitacoes/${licitacaoAId}/lotes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_lote: 'L1', valor_total_arrematado: 5000 });
            loteAId = resLote.body.id;

            const resItem = await request(app)
                .post(`/api/lotes/${loteAId}/itens`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ descricao: 'Item A', quantidade_ganha: 10, valor_unitario: 500 });
            itemAId = resItem.body.id;

            const resServ = await request(app)
                .post('/api/servicos')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ item_id: itemAId, nome_servico: 'Serviço A', quantidade: 2, valor_fixo: 1000 });
            servicoAId = resServ.body.id;
        });

        test('Usuário B não consegue acessar, modificar nem excluir recursos do Usuário A (retorna 404)', async () => {
            // Licitação
            const resGetLic = await request(app).get(`/api/licitacoes/${licitacaoAId}`).set('Authorization', `Bearer ${tokenB}`);
            expect(resGetLic.status).toBe(404);

            const resPutLic = await request(app).put(`/api/licitacoes/${licitacaoAId}`).set('Authorization', `Bearer ${tokenB}`).send({ numero_processo: 'HACK', orgao_publico: 'HACK' });
            expect(resPutLic.status).toBe(404);

            const resDelLic = await request(app).delete(`/api/licitacoes/${licitacaoAId}`).set('Authorization', `Bearer ${tokenB}`);
            expect(resDelLic.status).toBe(404);

            // Lote
            const resGetLote = await request(app).get(`/api/lotes/${loteAId}`).set('Authorization', `Bearer ${tokenB}`);
            expect(resGetLote.status).toBe(404);

            // Item
            const resGetItem = await request(app).get(`/api/itens/${itemAId}`).set('Authorization', `Bearer ${tokenB}`);
            expect(resGetItem.status).toBe(404);

            // Serviço
            const resGetServ = await request(app).get(`/api/servicos/${servicoAId}`).set('Authorization', `Bearer ${tokenB}`);
            expect(resGetServ.status).toBe(404);
        });
    });

    describe('RN07: Dados vindos da IA passam pelas mesmas rotas e validações', () => {
        test('Validação de licitação rejeita dados sem número de processo ou órgão público', async () => {
            // Simula dados extraídos da IA onde o número de processo veio vazio
            const dadosIaIncompletos = {
                numero_processo: '',
                orgao_publico: 'Órgão IA',
                valor_estimado: 5000
            };
            const res = await request(app)
                .post('/api/licitacoes')
                .set('Authorization', `Bearer ${tokenA}`)
                .send(dadosIaIncompletos);
            expect(res.status).toBe(400);
        });
    });

    describe('RN08: Serviço executado fora da vigência da licitação', () => {
        let licitacaoId, itemId, servicoId;

        beforeAll(async () => {
            const resLic = await request(app)
                .post('/api/licitacoes')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    numero_processo: 'RN08-01',
                    orgao_publico: 'Órgão Vigência',
                    valor_estimado: 10000,
                    data_vigencia: '2026-06-30'
                });
            licitacaoId = resLic.body.id;

            const resLote = await request(app)
                .post(`/api/licitacoes/${licitacaoId}/lotes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_lote: 'L1', valor_total_arrematado: 10000 });

            const resItem = await request(app)
                .post(`/api/lotes/${resLote.body.id}/itens`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ descricao: 'Item Vigência', quantidade_ganha: 10, valor_unitario: 1000 });
            itemId = resItem.body.id;
        });

        test('Serviço com data posterior à vigência é aceito e gravado com fora_da_vigencia = 1', async () => {
            const resServ = await request(app)
                .post('/api/servicos')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    item_id: itemId,
                    nome_servico: 'Serviço Fora Vigência',
                    quantidade: 1,
                    valor_fixo: 1000,
                    data_execucao: '2026-07-15'
                });
            expect(resServ.status).toBe(201);
            expect(resServ.body.fora_da_vigencia).toBe(true);
            servicoId = resServ.body.id;

            const resGetServ = await request(app)
                .get(`/api/servicos/${servicoId}`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(Number(resGetServ.body.fora_da_vigencia)).toBe(1);
        });

        test('Marca é recalculada ao alterar a vigência da licitação', async () => {
            // Estende vigência para 2026-12-31 (agora 2026-07-15 fica DENTRO da vigência)
            await request(app)
                .put(`/api/licitacoes/${licitacaoId}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    numero_processo: 'RN08-01',
                    orgao_publico: 'Órgão Vigência',
                    valor_estimado: 10000,
                    data_vigencia: '2026-12-31'
                });

            const resGetServ = await request(app)
                .get(`/api/servicos/${servicoId}`)
                .set('Authorization', `Bearer ${tokenA}`);
            expect(Number(resGetServ.body.fora_da_vigencia)).toBe(0);
        });
    });

    describe('RN09: Licitação Finalizada bloqueia novos serviços', () => {
        let licitacaoId, itemId;

        beforeAll(async () => {
            const resLic = await request(app)
                .post('/api/licitacoes')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    numero_processo: 'RN09-01',
                    orgao_publico: 'Órgão Finalizado',
                    valor_estimado: 5000,
                    status: 'Finalizada'
                });
            licitacaoId = resLic.body.id;

            const resLote = await request(app)
                .post(`/api/licitacoes/${licitacaoId}/lotes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_lote: 'L1', valor_total_arrematado: 5000 });

            const resItem = await request(app)
                .post(`/api/lotes/${resLote.body.id}/itens`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ descricao: 'Item Licitação Finalizada', quantidade_ganha: 10, valor_unitario: 500 });
            itemId = resItem.body.id;
        });

        test('Não deve permitir registrar serviço em licitação Finalizada (retorna 400)', async () => {
            const res = await request(app)
                .post('/api/servicos')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    item_id: itemId,
                    nome_servico: 'Serviço em Licitação Finalizada',
                    quantidade: 1,
                    valor_fixo: 500
                });
            expect(res.status).toBe(400);
            expect(res.body.mensagem).toMatch(/finalizada/i);
        });
    });

    describe('RN10: Quantidade ganha do item não pode ficar menor que a executada', () => {
        let itemId;

        beforeAll(async () => {
            const resLic = await request(app)
                .post('/api/licitacoes')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    numero_processo: 'RN10-01',
                    orgao_publico: 'Órgão RN10',
                    valor_estimado: 10000
                });
            const resLote = await request(app)
                .post(`/api/licitacoes/${resLic.body.id}/lotes`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ numero_lote: 'L1', valor_total_arrematado: 10000 });

            const resItem = await request(app)
                .post(`/api/lotes/${resLote.body.id}/itens`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ descricao: 'Item RN10', quantidade_ganha: 10, valor_unitario: 1000 });
            itemId = resItem.body.id;

            // Executa 5 unidades
            await request(app)
                .post('/api/servicos')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({ item_id: itemId, nome_servico: 'Executando 5', quantidade: 5, valor_fixo: 5000 });
        });

        test('Não deve permitir atualizar a quantidade ganha para um valor menor que a quantidade já executada (5)', async () => {
            const resUpdate = await request(app)
                .put(`/api/itens/${itemId}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    descricao: 'Item RN10',
                    quantidade_ganha: 4, // 4 < 5 executados -> deve falhar!
                    valor_unitario: 1000
                });
            expect(resUpdate.status).toBe(400);
            expect(resUpdate.body.mensagem).toMatch(/executada/i);
        });
    });
});
