const express = require('express');
const router = express.Router({ mergeParams: true });
const EntregaController = require('../controllers/EntregaController');
const autenticar = require('../middleware/autenticar');

router.use(autenticar);

router.get('/', EntregaController.listar);
router.get('/:id', EntregaController.buscar);
router.put('/:id', EntregaController.atualizar);
router.delete('/:id', EntregaController.excluir);

module.exports = router;
