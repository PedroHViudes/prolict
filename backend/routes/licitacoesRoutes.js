const express = require('express');
const router = express.Router();
const LicitacaoController = require('../controllers/LicitacaoController');
const PdfExtractController = require('../controllers/PdfExtractController');
const autenticar = require('../middleware/autenticar');
const multer = require('multer');

// Upload do edital em memória, limitado a 10 MB e somente PDF (evita esgotar a memória do servidor)
const TAMANHO_MAXIMO_PDF = 10 * 1024 * 1024;
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: TAMANHO_MAXIMO_PDF, files: 1 },
    fileFilter: (req, arquivo, callback) => {
        const ehPdf = arquivo.mimetype === 'application/pdf' && /\.pdf$/i.test(arquivo.originalname || '');
        callback(ehPdf ? null : Object.assign(new Error('Envie apenas arquivos PDF.'), { code: 'TIPO_INVALIDO' }), ehPdf);
    }
});
// Converte os erros do Multer em respostas claras (em vez de erro 500)
function receberPdf(req, res, next) {
    upload.single('pdf')(req, res, (erro) => {
        if (!erro) return next();
        if (erro.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ mensagem: 'O PDF ultrapassa o limite de 10 MB.' });
        if (erro.code === 'TIPO_INVALIDO') return res.status(400).json({ mensagem: erro.message });
        return res.status(400).json({ mensagem: 'Não foi possível receber o arquivo enviado.' });
    });
}

router.use(autenticar);

router.get('/', LicitacaoController.listar);
router.post('/', LicitacaoController.adicionar);
router.get('/ativas', LicitacaoController.listarAtivas);
router.get('/dashboard/resumo', LicitacaoController.resumoDashboard);
router.get('/relatorio/resumo', LicitacaoController.resumoGeral);

router.post('/extrair-pdf', receberPdf, PdfExtractController.extrair);

router.get('/:id', LicitacaoController.buscar);
router.put('/:id', LicitacaoController.atualizar);
router.delete('/:id', LicitacaoController.excluir);
router.get('/:id/resumo', LicitacaoController.buscarComSaldo);
router.get('/:id/lotes-itens', LicitacaoController.buscarLotesEItens);

module.exports = router;
