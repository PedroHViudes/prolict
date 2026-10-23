const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const autenticar = require('../middleware/autenticar');
const { limiteAuthGeral, limiteLogin, limiteEsqueciSenha, limiteRedefinir, limiteCadastro } = require('../middleware/limitadores');

// Rotas públicas (com limite de tentativas contra força bruta)
router.post('/login', limiteAuthGeral, limiteLogin, AuthController.login);
router.post('/cadastro', limiteAuthGeral, limiteCadastro, AuthController.cadastrar);
router.post('/esqueci-senha', limiteAuthGeral, limiteEsqueciSenha, AuthController.solicitarRecuperacaoSenha);
router.post('/redefinir-senha', limiteAuthGeral, limiteRedefinir, AuthController.redefinirSenhaComToken);

// Rotas protegidas (perfil)
router.use(autenticar);
router.get('/perfil', AuthController.perfil);
router.put('/perfil', AuthController.atualizarPerfil);
router.put('/perfil/senha', AuthController.atualizarSenha);
router.delete('/perfil', AuthController.excluirConta);

module.exports = router;
