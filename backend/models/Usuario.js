const db = require('../db');

/**
 * Modelo de dados do Administrador (usuário único por empresa).
 * Gerencia as operações de busca, criação, atualização e exclusão
 * de contas de administrador no banco de dados.
 */
const Usuario = {

    /**
     * Busca um administrador pelo seu endereço de e-mail.
     * Utilizado no login para verificar se a conta existe.
     * @param {string} email - E-mail do administrador
     * @returns {Object|undefined} Dados do administrador ou undefined se não encontrado
     */
    buscarPorEmail: async (email) => {
        const [linhas] = await db.query('SELECT * FROM administrador WHERE email = ?', [email]);
        return linhas[0];
    },

    /**
     * Busca um administrador pelo seu ID.
     * Utilizado para carregar dados do perfil e no middleware de autenticação.
     * @param {number} id - ID do administrador
     * @returns {Object|undefined} Dados do administrador ou undefined se não encontrado
     */
    buscarPorId: async (id) => {
        const [linhas] = await db.query('SELECT id, nome, email, criado_em FROM administrador WHERE id = ?', [id]);
        return linhas[0];
    },

    /**
     * Cria um novo administrador no banco de dados.
     * A senha deve ser criptografada com bcrypt antes de ser enviada.
     * @param {Object} dados - Objeto com nome, email e senha (já criptografada)
     * @returns {Object} Resultado da inserção no banco
     */
    criar: async (dados) => {
        const { nome, email, senha } = dados;
        const sql = "INSERT INTO administrador (nome, email, senha) VALUES (?, ?, ?)";
        const valores = [nome, email, senha];
        return await db.query(sql, valores);
    },

    /**
     * Atualiza os dados do administrador (nome e e-mail).
     * A senha não é alterada por esta função.
     * @param {number} id - ID do administrador
     * @param {Object} dados - Objeto com nome e email
     * @returns {Object} Resultado da atualização
     */
    atualizar: async (id, dados) => {
        const { nome, email } = dados;
        const sql = "UPDATE administrador SET nome = ?, email = ? WHERE id = ?";
        return await db.query(sql, [nome, email, id]);
    },

    /**
     * Atualiza a senha do administrador.
     * A nova senha deve ser criptografada com bcrypt antes de ser enviada.
     * @param {number} id - ID do administrador
     * @param {string} novaSenha - Nova senha já criptografada
     * @returns {Object} Resultado da atualização
     */
    atualizarSenha: async (id, novaSenha) => {
        const sql = "UPDATE administrador SET senha = ? WHERE id = ?";
        return await db.query(sql, [novaSenha, id]);
    },

    /**
     * Remove permanentemente a conta do administrador.
     * @param {number} id - ID do administrador
     * @returns {Object} Resultado da exclusão
     */
    excluir: async (id) => {
        const sql = "DELETE FROM administrador WHERE id = ?";
        return await db.query(sql, [id]);
    }
};

module.exports = Usuario;
