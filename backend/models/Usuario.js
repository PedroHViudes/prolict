const db = require('../db');

/**
 * Modelo de dados do Administrador (usuário único por empresa).
 * Gerencia as operações de busca, criação, atualização e exclusão
 * de contas de administrador no banco de dados.
 */
const Usuario = {

    /**
     * Busca um administrador pelo seu endereço de e-mail.
     * @param {string} email - E-mail do administrador
     * @returns {Object|undefined} Dados do administrador ou undefined se não encontrado
     */
    async buscarPorEmail(email) {
        const [linhas] = await db.query('SELECT * FROM administrador WHERE email = ?', [email]);
        return linhas[0];
    },

    /**
     * Busca um administrador pelo seu ID.
     * @param {number} id - ID do administrador
     * @returns {Object|undefined} Dados do administrador ou undefined se não encontrado
     */
    async buscarPorId(id) {
        const [linhas] = await db.query('SELECT id, nome, email, criado_em FROM administrador WHERE id = ?', [id]);
        return linhas[0];
    },

    /**
     * Cria um novo administrador no banco de dados.
     * @param {Object} dados - Objeto com nome, email e senha (já criptografada)
     * @returns {Object} Resultado da inserção no banco
     */
    async criar(dados) {
        const { nome, email, senha } = dados;
        const sql = "INSERT INTO administrador (nome, email, senha) VALUES (?, ?, ?)";
        const valores = [nome, email, senha];
        return await db.query(sql, valores);
    },

    /**
     * Atualiza os dados do administrador (nome e e-mail).
     * @param {number} id - ID do administrador
     * @param {Object} dados - Objeto com nome e email
     * @returns {Object} Resultado da atualização
     */
    async atualizar(id, dados) {
        const { nome, email } = dados;
        const sql = "UPDATE administrador SET nome = ?, email = ? WHERE id = ?";
        return await db.query(sql, [nome, email, id]);
    },

    /**
     * Atualiza a senha do administrador.
     * @param {number} id - ID do administrador
     * @param {string} novaSenha - Nova senha já criptografada
     * @returns {Object} Resultado da atualização
     */
    async atualizarSenha(id, novaSenha) {
        const sql = "UPDATE administrador SET senha = ? WHERE id = ?";
        return await db.query(sql, [novaSenha, id]);
    },

    /**
     * Salva o token de redefinição de senha e sua data de expiração.
     * @param {number} id - ID do administrador
     * @param {string} token - Token gerado para redefinição
     * @param {Date} dataExpiracao - Data e hora limite de validade do token
     */
    async salvarTokenReset(id, token, minutosValidade = 15) {
        // A validade é calculada pelo próprio banco (NOW()), o mesmo relógio usado na conferência,
        // evitando que o código já nasça "expirado" quando o Node e o MySQL estão em fusos diferentes.
        const sql = "UPDATE administrador SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?";
        return await db.query(sql, [token, minutosValidade, id]);
    },

    /**
     * Busca um administrador pelo token de redefinição de senha válido (não expirado).
     * @param {string} token - Token enviado no link de recuperação
     * @returns {Object|undefined} Administrador correspondente ou undefined
     */
    async buscarPorTokenReset(token) {
        const sql = "SELECT * FROM administrador WHERE reset_token = ? AND reset_token_expires > NOW()";
        const [linhas] = await db.query(sql, [token]);
        return linhas[0];
    },

    /**
     * Busca um administrador pelo e-mail e pelo código PIN de 6 dígitos não expirado.
     * @param {string} email - E-mail do administrador
     * @param {string} codigoPIN - Código PIN enviado por e-mail
     * @returns {Object|undefined} Administrador correspondente ou undefined
     */
    async buscarPorEmailETokenReset(email, codigoPIN) {
        const sql = "SELECT * FROM administrador WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()";
        const [linhas] = await db.query(sql, [email, codigoPIN]);
        return linhas[0];
    },

    /**
     * Limpa o token de redefinição de senha após o uso ou expiração.
     * @param {number} id - ID do administrador
     */
    async limparTokenReset(id) {
        const sql = "UPDATE administrador SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?";
        return await db.query(sql, [id]);
    },

    /**
     * Remove permanentemente a conta do administrador.
     * @param {number} id - ID do administrador
     * @returns {Object} Resultado da exclusão
     */
    async excluir(id) {
        const sql = "DELETE FROM administrador WHERE id = ?";
        return await db.query(sql, [id]);
    }
};

module.exports = Usuario;
