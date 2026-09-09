const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const autenticar = require('../middleware/autenticar');

// Rotas públicas
router.post('/login', AuthController.login);
router.post('/cadastro', AuthController.cadastrar);

// Rotas protegidas (perfil)
router.use(autenticar);
router.get('/perfil', AuthController.perfil);
router.put('/perfil', AuthController.atualizarPerfil);
router.put('/perfil/senha', AuthController.atualizarSenha);
router.delete('/perfil', AuthController.excluirConta);

module.exports = router;
