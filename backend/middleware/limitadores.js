const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

/**
 * Limites de tentativas (proteção contra força bruta) nas rotas públicas de autenticação.
 * Desligados automaticamente nos testes do Jest (NODE_ENV=test) ou com RATE_LIMIT=off no .env.
 */
const desligado = () => process.env.NODE_ENV === 'test' || process.env.RATE_LIMIT === 'off';
const email = (req) => String((req.body && req.body.email) || '').trim().toLowerCase();
const porIpEEmail = (req) => `${ipKeyGenerator(req.ip)}|${email(req)}`;
const mensagem = (texto) => ({ mensagem: texto });

// Limite geral por IP para todas as rotas públicas de autenticação
const limiteAuthGeral = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 100,
    standardHeaders: 'draft-7', legacyHeaders: false, skip: desligado,
    message: mensagem('Muitas requisições em pouco tempo. Aguarde alguns minutos e tente novamente.')
});

// Login: até 10 tentativas ERRADAS por conta (IP + e-mail) a cada 15 minutos
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true,
    keyGenerator: porIpEEmail, standardHeaders: 'draft-7', legacyHeaders: false, skip: desligado,
    message: mensagem('Muitas tentativas de login para esta conta. Aguarde 15 minutos e tente novamente.')
});

// Pedido de código de recuperação: até 5 por e-mail a cada 15 minutos (evita disparo de e-mails)
const limiteEsqueciSenha = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 5,
    keyGenerator: porIpEEmail, standardHeaders: 'draft-7', legacyHeaders: false, skip: desligado,
    message: mensagem('Muitos pedidos de código para este e-mail. Aguarde 15 minutos e tente novamente.')
});

// Redefinição com o código: até 10 tentativas por e-mail a cada 15 minutos
// (além disso, o próprio código é cancelado após 5 erros – ver AuthController)
const limiteRedefinir = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 10,
    keyGenerator: porIpEEmail, standardHeaders: 'draft-7', legacyHeaders: false, skip: desligado,
    message: mensagem('Muitas tentativas de redefinição. Aguarde 15 minutos e solicite um novo código.')
});

// Cadastro de contas: até 20 por IP por hora
const limiteCadastro = rateLimit({
    windowMs: 60 * 60 * 1000, limit: 20,
    standardHeaders: 'draft-7', legacyHeaders: false, skip: desligado,
    message: mensagem('Muitos cadastros a partir deste endereço. Tente novamente mais tarde.')
});

module.exports = { limiteAuthGeral, limiteLogin, limiteEsqueciSenha, limiteRedefinir, limiteCadastro };
