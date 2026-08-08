const express = require('express');
const router = express.Router();

const AuthController = require('./controllers/AuthController');
const LicitacaoController = require('./controllers/LicitacaoController');
const ServicoController = require('./controllers/ServicoController');
const LoteController = require('./controllers/LoteController');
const ItemController = require('./controllers/ItemController');
const DocumentoController = require('./controllers/DocumentoController');
const EntregaController = require('./controllers/EntregaController');

const autenticar = require('./middleware/autenticar');

// ============================================================
// ROTAS PÚBLICAS (não exigem autenticação)
// ============================================================
router.post('/login', AuthController.login);
router.post('/cadastro', AuthController.cadastrar);

// ============================================================
// ROTAS PROTEGIDAS (exigem token JWT válido)
// ============================================================
router.use(autenticar);

// --- ROTAS DE PERFIL ---
router.get('/perfil', AuthController.perfil);
router.put('/perfil', AuthController.atualizarPerfil);
router.put('/perfil/senha', AuthController.atualizarSenha);
router.delete('/perfil', AuthController.excluirConta);

// --- ROTAS DE LICITAÇÕES ---
router.get('/licitacoes', LicitacaoController.listar);
router.get('/licitacoes/ativas', LicitacaoController.listarAtivas);
router.get('/licitacoes/dashboard/resumo', LicitacaoController.resumoDashboard);
router.get('/licitacoes/relatorio/resumo', LicitacaoController.resumoGeral);
router.post('/licitacoes', LicitacaoController.adicionar);
router.get('/licitacoes/:id/resumo', LicitacaoController.buscarComSaldo);
router.get('/licitacoes/:id/lotes-itens', LicitacaoController.buscarLotesEItens);
router.get('/licitacoes/:id', LicitacaoController.buscar);
router.put('/licitacoes/:id', LicitacaoController.atualizar);
router.delete('/licitacoes/:id', LicitacaoController.excluir);

// --- ROTAS DE LOTES ---
router.get('/licitacoes/:licitacaoId/lotes', LoteController.listarPorLicitacao);
router.post('/licitacoes/:licitacaoId/lotes', LoteController.adicionar);
router.get('/lotes/:id', LoteController.buscar);
router.put('/lotes/:id', LoteController.atualizar);
router.delete('/lotes/:id', LoteController.excluir);

// --- ROTAS DE ITENS ---
router.get('/lotes/:loteId/itens', ItemController.listarPorLote);
router.post('/lotes/:loteId/itens', ItemController.adicionar);
router.get('/itens', ItemController.listarTodos);
router.get('/itens/:id', ItemController.buscar);
router.put('/itens/:id', ItemController.atualizar);
router.delete('/itens/:id', ItemController.excluir);

// --- ROTAS DE SERVIÇOS ---
router.get('/servicos', ServicoController.listar);
router.get('/servicos/valor-total', ServicoController.valorTotal);
router.post('/servicos', ServicoController.adicionar);
router.get('/servicos/:id', ServicoController.buscar);
router.put('/servicos/:id', ServicoController.atualizar);
router.delete('/servicos/:id', ServicoController.excluir);

// --- ROTAS DE ENTREGAS ---
router.get('/servicos/:servicoId/entregas', EntregaController.listarPorServico);
router.post('/servicos/:servicoId/entregas', EntregaController.adicionar);
router.get('/entregas', EntregaController.listar);
router.get('/entregas/:id', EntregaController.buscar);
router.put('/entregas/:id', EntregaController.atualizar);
router.delete('/entregas/:id', EntregaController.excluir);

// --- ROTAS DE DOCUMENTOS ---
router.get('/licitacoes/:licitacaoId/documentos', DocumentoController.listarPorLicitacao);
router.post('/licitacoes/:licitacaoId/documentos', DocumentoController.adicionar);
router.get('/documentos', DocumentoController.listarTodos);
router.get('/documentos/vencendo/:dias', DocumentoController.vencendoEm);
router.get('/documentos/:id', DocumentoController.buscar);
router.put('/documentos/:id', DocumentoController.atualizar);
router.delete('/documentos/:id', DocumentoController.excluir);

module.exports = router;
