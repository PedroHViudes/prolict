const mysql = require('mysql2');
require('dotenv').config();

/**
 * Módulo de Conexão com o Banco de Dados MySQL.
 * Cria um pool de conexões (gerenciamento eficiente de múltiplas conexões simultâneas)
 * e exporta com suporte a Promises para utilização de async/await nas consultas.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();