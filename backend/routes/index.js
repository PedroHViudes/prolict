const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const licitacoesRoutes = require('./licitacoesRoutes');
const lotesRoutes = require('./lotesRoutes');
const itensRoutes = require('./itensRoutes');
const servicosRoutes = require('./servicosRoutes');
const entregasRoutes = require('./entregasRoutes');

const LoteController = require('../controllers/LoteController');
const ItemController = require('../controllers/ItemController');
const EntregaController = require('../controllers/EntregaController');
const autenticar = require('../middleware/autenticar');

// Rotas Base
router.use('/', authRoutes);
router.use('/licitacoes', licitacoesRoutes);
router.use('/lotes', lotesRoutes);
router.use('/itens', itensRoutes);
router.use('/servicos', servicosRoutes);
router.use('/entregas', entregasRoutes);

// Rotas Aninhadas
router.use(autenticar);

// Lotes por Licitação
router.get('/licitacoes/:licitacaoId/lotes', LoteController.listarPorLicitacao);
router.post('/licitacoes/:licitacaoId/lotes', LoteController.adicionar);

// Itens por Lote
router.get('/lotes/:loteId/itens', ItemController.listarPorLote);
router.post('/lotes/:loteId/itens', ItemController.adicionar);

// Entregas por Serviço
router.get('/servicos/:servicoId/entregas', EntregaController.listarPorServico);
router.post('/servicos/:servicoId/entregas', EntregaController.adicionar);


module.exports = router;
