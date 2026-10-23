const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware de Autenticação JWT.
 * Verifica se a requisição possui um token válido no cabeçalho Authorization.
 * Se o token for válido, decodifica e anexa os dados do usuário ao request.
 * Se não, retorna erro 401 (Não Autenticado).
 */
function autenticar(req, res, next) {
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

    try {
        // Tenta verificar e decodificar o token usando a chave secreta
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // Anexa os dados do usuário decodificados ao objeto request
        // Estes dados ficam disponíveis em todas as rotas seguintes
        req.usuario = decodificado;
        
        // Chama a próxima função/middleware da cadeia
        next();
    } catch (erro) {
        // Se o token expirou ou é inválido, retorna erro 401
        return res.status(401).json({ 
            mensagem: "Token inválido ou expirado. Faça login novamente." 
        });
    }
}

module.exports = autenticar;
