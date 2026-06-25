import { Hono } from 'hono';
import { cors } from 'hono/cors';
import AuthController from './controllers/AuthController.js';

const app = new Hono();

// Habilita o CORS para todas as rotas
app.use('*', cors());

// Rota inicial para verificar o status do backend
app.get('/', (c) => c.text('Backend do ProLicit rodando com sucesso!'));

// Rotas de Autenticação utilizando o padrão MVC
app.post('/cadastro', AuthController.cadastro);
app.post('/login', AuthController.login);

// Exporta o app para o Cloudflare Worker
export default app;