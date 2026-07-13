const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ============================================================
// IMPORTAÇÃO DOS CONTROLADORES
// Cada controller gerencia as rotas e regras de negócio
// de uma entidade específica do sistema.
// ============================================================
const AuthController = require('./controllers/AuthController');
const LicitacaoController = require('./controllers/LicitacaoController');
const ServicoController = require('./controllers/ServicoController');
const LoteController = require('./controllers/LoteController');
const ItemController = require('./controllers/ItemController');
const DocumentoController = require('./controllers/DocumentoController');
const EntregaController = require('./controllers/EntregaController');

// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// Protege as rotas que exigem login (token JWT válido).
// ============================================================
const autenticar = require('./middleware/autenticar');

// ============================================================
// CONFIGURAÇÃO DO SERVIDOR EXPRESS
// ============================================================
const app = express();

// Middleware para permitir requisições de outras origens (CORS)
app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// ============================================================
// ROTAS PÚBLICAS (não exigem autenticação)
// ============================================================

// --- Rota de Login ---
app.post('/api/login', AuthController.login);

// --- Rota de Cadastro ---
app.post('/api/cadastro', AuthController.cadastrar);

// ============================================================
// ROTAS PROTEGIDAS (exigem token JWT válido)
// A partir daqui, todas as rotas passam pelo middleware autenticar
// ============================================================
app.use(autenticar);

// --- ROTAS DE PERFIL (Usuário Logado) ---
app.get('/api/perfil', AuthController.perfil);              // Ver perfil
app.put('/api/perfil', AuthController.atualizarPerfil);     // Atualizar perfil
app.put('/api/perfil/senha', AuthController.atualizarSenha); // Atualizar senha
app.delete('/api/perfil', AuthController.excluirConta);     // Excluir conta

// --- ROTAS DE LICITAÇÕES ---
// IMPORTANTE: Rotas específicas ANTES das rotas com :id para evitar conflitos
app.get('/api/licitacoes', LicitacaoController.listar);                    // Listar todas
app.get('/api/licitacoes/ativas', LicitacaoController.listarAtivas);      // Listar ativas (Dashboard)
app.get('/api/licitacoes/dashboard/resumo', LicitacaoController.resumoDashboard); // Dados do Dashboard
app.get('/api/licitacoes/relatorio/resumo', LicitacaoController.resumoGeral); // Resumo geral com saldo
app.post('/api/licitacoes', LicitacaoController.adicionar);               // Cadastrar nova
app.get('/api/licitacoes/:id/resumo', LicitacaoController.buscarComSaldo); // Detalhes com saldo
app.get('/api/licitacoes/:id/lotes-itens', LicitacaoController.buscarLotesEItens); // Lotes e itens
app.get('/api/licitacoes/:id', LicitacaoController.buscar);               // Detalhes de uma licitação
app.put('/api/licitacoes/:id', LicitacaoController.atualizar);           // Atualizar existente
app.delete('/api/licitacoes/:id', LicitacaoController.excluir);          // Excluir

// --- ROTAS DE LOTES (vinculados a uma licitação) ---
app.get('/api/licitacoes/:licitacaoId/lotes', LoteController.listarPorLicitacao); // Listar lotes da licitação
app.post('/api/licitacoes/:licitacaoId/lotes', LoteController.adicionar);         // Criar lote na licitação
app.get('/api/lotes/:id', LoteController.buscar);                                 // Detalhes de um lote
app.put('/api/lotes/:id', LoteController.atualizar);                             // Atualizar lote
app.delete('/api/lotes/:id', LoteController.excluir);                            // Excluir lote

// --- ROTAS DE ITENS (vinculados a um lote) ---
app.get('/api/lotes/:loteId/itens', ItemController.listarPorLote); // Listar itens do lote
app.post('/api/lotes/:loteId/itens', ItemController.adicionar);    // Criar item no lote
app.get('/api/itens', ItemController.listarTodos);                  // Listar todos os itens
app.get('/api/itens/:id', ItemController.buscar);                   // Detalhes de um item
app.put('/api/itens/:id', ItemController.atualizar);               // Atualizar item
app.delete('/api/itens/:id', ItemController.excluir);              // Excluir item

// --- ROTAS DE SERVIÇOS (Baixa Operacional) ---
// IMPORTANTE: Rotas específicas ANTES das rotas com :id para evitar conflitos
app.get('/api/servicos', ServicoController.listar);                  // Listar todos
app.get('/api/servicos/valor-total', ServicoController.valorTotal);  // Valor total (Dashboard)
app.post('/api/servicos', ServicoController.adicionar);              // Cadastrar novo
app.get('/api/servicos/:id', ServicoController.buscar);              // Detalhes de um serviço
app.put('/api/servicos/:id', ServicoController.atualizar);          // Atualizar existente
app.delete('/api/servicos/:id', ServicoController.excluir);         // Excluir

// --- ROTAS DE ENTREGAS (quem recebeu / responsável) ---
app.get('/api/servicos/:servicoId/entregas', EntregaController.listarPorServico); // Entregas do serviço
app.post('/api/servicos/:servicoId/entregas', EntregaController.adicionar);       // Registrar entrega
app.get('/api/entregas', EntregaController.listar);                                // Listar todas
app.get('/api/entregas/:id', EntregaController.buscar);                            // Detalhes de uma entrega
app.put('/api/entregas/:id', EntregaController.atualizar);                        // Atualizar entrega
app.delete('/api/entregas/:id', EntregaController.excluir);                       // Excluir entrega

// --- ROTAS DE DOCUMENTOS (vinculados a uma licitação) ---
app.get('/api/licitacoes/:licitacaoId/documentos', DocumentoController.listarPorLicitacao); // Documentos da licitação
app.post('/api/licitacoes/:licitacaoId/documentos', DocumentoController.adicionar);         // Criar documento na licitação
app.get('/api/documentos', DocumentoController.listarTodos);                                 // Listar todos
app.get('/api/documentos/vencendo/:dias', DocumentoController.vencendoEm);                  // Documentos vencendo
app.get('/api/documentos/:id', DocumentoController.buscar);                                  // Detalhes de um documento
app.put('/api/documentos/:id', DocumentoController.atualizar);                              // Atualizar documento
app.delete('/api/documentos/:id', DocumentoController.excluir);                             // Excluir documento

// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================
const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () => {
    console.log(`Backend PROLICIT rodando perfeitamente na porta ${PORTA}!`);
    console.log(`Banco de dados: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});
