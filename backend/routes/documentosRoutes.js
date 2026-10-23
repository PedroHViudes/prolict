const express = require('express');
const router = express.Router({ mergeParams: true });
const DocumentoController = require('../controllers/DocumentoController');
const autenticar = require('../middleware/autenticar');

router.use(autenticar);

router.get('/', DocumentoController.listarTodos);
router.get('/vencendo/:dias', DocumentoController.vencendoEm);
router.get('/:id', DocumentoController.buscar);
router.put('/:id', DocumentoController.atualizar);
router.delete('/:id', DocumentoController.excluir);

module.exports = router;
