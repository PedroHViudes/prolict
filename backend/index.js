const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Garante o fuso do Brasil mesmo em servidores configurados em UTC (datas e prazos)
if (!process.env.TZ) process.env.TZ = 'America/Sao_Paulo';

const app = express();

// Cabeçalhos HTTP de segurança (helmet). A política de recursos fica "cross-origin"
// porque o front-end (Vite) roda em outra porta.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS: só aceita as origens do front-end configuradas em CORS_ORIGIN (separadas por vírgula).
// O token vai no cabeçalho Authorization, então não é preciso enviar cookies (credentials).
const origensPermitidas = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
    origin: (origem, callback) => {
        // requisições sem Origin (Postman, testes, o próprio servidor) são aceitas
        if (!origem || origensPermitidas.includes(origem)) return callback(null, true);
        return callback(null, false);
    },
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
if (require.main === module) {
    app.listen(PORTA, () => {
        console.log(`Backend PROLICIT rodando perfeitamente na porta ${PORTA}!`);
        console.log(`Banco de dados: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    });
}

module.exports = app;
