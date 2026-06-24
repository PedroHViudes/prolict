import { Hono } from 'hono';
import { cors } from 'hono/cors';
import bcrypt from 'bcryptjs';
import Usuario from './models/Usuario.js';

const app = new Hono();

// Habilita o CORS para todas as rotas
app.use('*', cors());

// Rota inicial para verificar o status do backend
app.get('/', (c) => c.text('Backend do ProLicit rodando com sucesso!'));

// Rota de Cadastro de Usuário
app.post('/cadastro', async (c) => {
    console.log("Recebida requisição de cadastro");
    
    try {
        const body = await c.req.json();
        console.log("Dados recebidos:", body);
        const { nome, empresa, email, senha } = body;

        if (!nome || !email || !senha) {
            return c.json({ mensagem: "Dados obrigatórios faltando." }, 400);
        }

        // Buscamos o usuário no banco de dados D1 (passando c.env.DB)
        const usuarioexistente = await Usuario.buscarPorEmail(c.env.DB, email);

        if (usuarioexistente) {
            return c.json({ mensagem: "Esse email já está sendo usado." }, 400);
        }

        const saltos = 10;
        const senhaCriptografada = await bcrypt.hash(senha, saltos);

        // Criamos o usuário no banco de dados D1
        await Usuario.criar(c.env.DB, {
            nome,
            email,
            senha: senhaCriptografada,
            cargo: empresa, // Mapeando empresa da tela para cargo do banco
        });

        return c.json({ mensagem: "Usuário cadastrado com sucesso!" }, 201);
    }
    catch (erro) {
        console.error("Erro no cadastro:", erro);
        return c.json({ mensagem: "Erro ao processar cadastro." }, 500);
    }
});

// Exporta o app para o Cloudflare Worker
export default app;