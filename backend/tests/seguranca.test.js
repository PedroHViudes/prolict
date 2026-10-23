// Testes das correções de segurança apontadas na auditoria (testes/RELATORIO_JULES.md)
const request = require('supertest');
const db = require('../db');
const app = require('../index');

const auth = (t) => ({ Authorization: `Bearer ${t}` });
const novoUsuario = (p) => ({ nome: 'Seg ' + p, email: `seg_${p}_${Date.now()}_${Math.floor(Math.random() * 1e6)}@teste.com`, senha: 'Senha@123' });

async function criarELogar(prefixo) {
    const u = novoUsuario(prefixo);
    await request(app).post('/api/cadastro').send(u);
    const r = await request(app).post('/api/login').send({ email: u.email, senha: u.senha });
    return { ...u, token: r.body.token };
}

describe('Correções de segurança (VULN-01 a VULN-08)', () => {
    let A;
    beforeAll(async () => { A = await criarELogar('a'); });
    afterAll(async () => {
        if (A && A.token) await request(app).delete('/api/perfil').set(auth(A.token));
        await db.end();
    });

    test('VULN-05: o valor do serviço é calculado no servidor (quantidade × valor unitário)', async () => {
        const lic = await request(app).post('/api/licitacoes').set(auth(A.token))
            .send({ numero_processo: 'SEG-05', orgao_publico: 'Órgão (exemplo)', valor_estimado: 1000 });
        const lote = await request(app).post(`/api/licitacoes/${lic.body.id}/lotes`).set(auth(A.token))
            .send({ numero_lote: 'L1', valor_total_arrematado: 1000 });
        const item = await request(app).post(`/api/lotes/${lote.body.id}/itens`).set(auth(A.token))
            .send({ descricao: 'Item', quantidade_ganha: 10, valor_unitario: 10 });
        const serv = await request(app).post('/api/servicos').set(auth(A.token))
            .send({ item_id: item.body.id, nome_servico: 'Manipulado', quantidade: 1, valor_fixo: 99999, data_execucao: '2026-05-10' });
        expect(serv.status).toBe(201);
        const lido = await request(app).get(`/api/servicos/${serv.body.id}`).set(auth(A.token));
        expect(Number(lido.body.valor_fixo)).toBe(10);
        // na edição, o valor enviado também é ignorado
        await request(app).put(`/api/servicos/${serv.body.id}`).set(auth(A.token))
            .send({ nome_servico: 'Editado', valor_fixo: 5000, data_execucao: '2026-05-11' });
        const editado = await request(app).get(`/api/servicos/${serv.body.id}`).set(auth(A.token));
        expect(Number(editado.body.valor_fixo)).toBe(10);
        await request(app).delete(`/api/licitacoes/${lic.body.id}`).set(auth(A.token));
    });

    test('VULN-02: "esqueci a senha" responde igual para e-mail cadastrado e não cadastrado', async () => {
        const naoCadastrado = await request(app).post('/api/esqueci-senha').send({ email: 'ninguem_' + Date.now() + '@teste.com' });
        expect(naoCadastrado.status).toBe(200);
        // e-mail cadastrado: se o SMTP de teste não estiver disponível a API responde 503 (envio falhou),
        // mas quando o envio funciona a mensagem precisa ser idêntica à do e-mail não cadastrado
        const cadastrado = await request(app).post('/api/esqueci-senha').send({ email: A.email });
        if (cadastrado.status === 200) expect(cadastrado.body.mensagem).toBe(naoCadastrado.body.mensagem);
        else expect(cadastrado.status).toBe(503);
    });

    test('VULN-04: upload recusa arquivo que não é PDF e PDF acima de 10 MB', async () => {
        const naoPdf = await request(app).post('/api/licitacoes/extrair-pdf').set(auth(A.token))
            .attach('pdf', Buffer.from('nao sou um pdf'), { filename: 'video.mp4', contentType: 'video/mp4' });
        expect(naoPdf.status).toBe(400);
        const grande = await request(app).post('/api/licitacoes/extrair-pdf').set(auth(A.token))
            .attach('pdf', Buffer.alloc(11 * 1024 * 1024, 1), { filename: 'grande.pdf', contentType: 'application/pdf' });
        expect(grande.status).toBe(413);
    });

    test('VULN-07: CORS não libera origem desconhecida e há cabeçalhos do helmet', async () => {
        const estranha = await request(app).get('/api/licitacoes').set('Origin', 'https://site-malicioso.example');
        expect(estranha.headers['access-control-allow-origin']).toBeUndefined();
        const front = await request(app).get('/api/licitacoes').set('Origin', 'http://localhost:5173');
        expect(front.headers['access-control-allow-origin']).toBe('http://localhost:5173');
        expect(front.headers['x-content-type-options']).toBe('nosniff');
    });

    test('VULN-08: o token de uma conta excluída deixa de valer imediatamente', async () => {
        const B = await criarELogar('b');
        expect((await request(app).get('/api/licitacoes').set(auth(B.token))).status).toBe(200);
        await request(app).delete('/api/perfil').set(auth(B.token));
        expect((await request(app).get('/api/licitacoes').set(auth(B.token))).status).toBe(401);
    });

    test('VULN-03: login bloqueia após 10 tentativas erradas na mesma conta (HTTP 429)', async () => {
        const original = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development'; // liga o limitador só neste teste
        try {
            const email = 'forca_bruta_' + Date.now() + '@teste.com';
            const codigos = [];
            for (let i = 0; i < 11; i++) {
                const r = await request(app).post('/api/login').send({ email, senha: 'errada' + i });
                codigos.push(r.status);
            }
            expect(codigos.slice(0, 10).every(c => c === 401)).toBe(true);
            expect(codigos[10]).toBe(429);
        } finally {
            process.env.NODE_ENV = original;
        }
    });
});
