const con = require('./db');

async function removerCargo() {
    try {
        console.log("Conectando ao banco para remover a coluna 'cargo'...");
        await con.query("ALTER TABLE administrador DROP COLUMN cargo;");
        console.log("Coluna 'cargo' removida com sucesso da tabela 'administrador'.");
    } catch (erro) {
        if (erro.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log("A coluna 'cargo' já foi removida anteriormente.");
        } else {
            console.error("Erro ao alterar o banco de dados:", erro);
        }
    } finally {
        process.exit();
    }
}

removerCargo();
