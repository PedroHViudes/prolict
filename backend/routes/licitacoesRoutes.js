const express = require('express');
const router = express.Router();
const LicitacaoController = require('../controllers/LicitacaoController');
const PdfExtractController = require('../controllers/PdfExtractController');
const autenticar = require('../middleware/autenticar');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.use(autenticar);

router.get('/', LicitacaoController.listar);
router.post('/', LicitacaoController.adicionar);
router.get('/ativas', LicitacaoController.listarAtivas);
router.get('/dashboard/resumo', LicitacaoController.resumoDashboard);
router.get('/relatorio/resumo', LicitacaoController.resumoGeral);

router.post('/extrair-pdf', upload.single('pdf'), PdfExtractController.extrair);

router.get('/:id', LicitacaoController.buscar);
router.put('/:id', LicitacaoController.atualizar);
router.delete('/:id', LicitacaoController.excluir);
router.get('/:id/resumo', LicitacaoController.buscarComSaldo);
router.get('/:id/lotes-itens', LicitacaoController.buscarLotesEItens);

module.exports = router;
