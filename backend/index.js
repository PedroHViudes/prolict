const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Garante o fuso do Brasil mesmo em servidores configurados em UTC (datas e prazos)
if (!process.env.TZ) process.env.TZ = 'America/Sao_Paulo';

const app = express();

// Middleware para permitir requisições de outras origens (CORS)
app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

const routes = require('./routes');

// ============================================================
// ROTAS DA APLICAÇÃO
// Todas as rotas agora estão centralizadas na pasta routes/
// ============================================================
app.use('/api', routes);

// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================
const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () => {
    console.log(`Backend PROLICIT rodando perfeitamente na porta ${PORTA}!`);
    console.log(`Banco de dados: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});
