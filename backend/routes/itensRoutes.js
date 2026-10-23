const express = require('express');
const router = express.Router({ mergeParams: true });
const ItemController = require('../controllers/ItemController');
const autenticar = require('../middleware/autenticar');

router.use(autenticar);

router.get('/', ItemController.listarTodos);
router.get('/:id', ItemController.buscar);
router.put('/:id', ItemController.atualizar);
router.delete('/:id', ItemController.excluir);

module.exports = router;
