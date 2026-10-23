const express = require('express');
const router = express.Router({ mergeParams: true });
const LoteController = require('../controllers/LoteController');
const autenticar = require('../middleware/autenticar');

router.use(autenticar);

// Rotas genéricas de lotes
router.get('/:id', LoteController.buscar);
router.put('/:id', LoteController.atualizar);
router.delete('/:id', LoteController.excluir);

module.exports = router;
