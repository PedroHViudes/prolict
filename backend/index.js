const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware para permitir requisições de outras origens (CORS)
app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

const rotas = require('./routes');

// ============================================================
// ROTAS DA APLICAÇÃO
// Todas as rotas agora estão centralizadas no arquivo routes.js
// ============================================================
app.use('/api', rotas);

// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================
const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () => {
    console.log(`Backend PROLICIT rodando perfeitamente na porta ${PORTA}!`);
    console.log(`Banco de dados: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});
