const express = require('express');
const router = express.Router({ mergeParams: true });
const ServicoController = require('../controllers/ServicoController');
const autenticar = require('../middleware/autenticar');

router.use(autenticar);

router.get('/', ServicoController.listar);
router.post('/', ServicoController.adicionar);
router.get('/valor-total', ServicoController.valorTotal);
router.get('/:id', ServicoController.buscar);
router.put('/:id', ServicoController.atualizar);
router.delete('/:id', ServicoController.excluir);

module.exports = router;
