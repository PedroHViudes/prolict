const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

/**
 * Middleware de Autenticação JWT.
 * Verifica se a requisição possui um token válido no cabeçalho Authorization.
 * Se o token for válido, decodifica e anexa os dados do usuário ao request.
 * Se não, retorna erro 401 (Não Autenticado).
 */
async function autenticar(req, res, next) {
    // Captura o cabeçalho de autorização da requisição
    const cabecalhoAuth = req.headers.authorization;

    // Verifica se o cabeçalho existe e começa com "Bearer "
    if (!cabecalhoAuth || !cabecalhoAuth.startsWith('Bearer ')) {
        return res.status(401).json({ 
            mensagem: "Acesso negado. Token de autenticação não fornecido." 
        });
    }

    // Extrai o token removendo o prefixo "Bearer "
    const token = cabecalhoAuth.split(' ')[1];

    let decodificado;
    try {
        // Verifica assinatura e validade do token com a chave secreta
        decodificado = jwt.verify(token, process.env.JWT_SECRET);
    } catch (erro) {
        // Token expirado ou inválido
        return res.status(401).json({ 
            mensagem: "Token inválido ou expirado. Faça login novamente." 
        });
    }

    try {
        // A conta ainda existe? (um token de conta excluída deixa de valer na hora)
        const [linhas] = await db.query('SELECT id FROM administrador WHERE id = ?', [decodificado.id]);
        if (linhas.length === 0) {
            return res.status(401).json({ mensagem: "Conta não encontrada. Faça login novamente." });
        }
    } catch (erro) {
        console.error("Erro ao validar a conta do token:", erro);
        return res.status(500).json({ mensagem: "Erro ao validar a sessão." });
    }

    // Disponibiliza os dados do usuário para as rotas seguintes
    req.usuario = decodificado;
    next();
}

module.exports = autenticar;
