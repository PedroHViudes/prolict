const mysql = require('mysql2');
require('dotenv').config();

//minha conexão piscina
const con = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


module.exports = con.promise();