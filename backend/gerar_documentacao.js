const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50 });
const outputPath = path.join(__dirname, '..', 'Documentacao_Prolicit.pdf');
const stream = fs.createWriteStream(outputPath);

doc.pipe(stream);

// Função auxiliar para criar títulos e subtítulos
function sectionTitle(title) {
  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#003366').text(title);
  doc.moveDown(0.5);
  doc.font('Helvetica').fillColor('black');
}

function subTitle(title) {
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#00509E').text(title);
  doc.moveDown(0.2);
  doc.font('Helvetica').fillColor('black');
}

function bodyText(text) {
  doc.font('Helvetica').fontSize(10).fillColor('#333333').text(text, { align: 'justify' });
  doc.moveDown(0.3);
}

function codeText(text) {
  doc.font('Courier').fontSize(9).fillColor('#D6336C').text(text);
  doc.moveDown(0.3);
}

// CAPA
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#F8F9FA');
doc.fillColor('#003366').font('Helvetica-Bold').fontSize(24).text('DOCUMENTAÇÃO TÉCNICA', 0, 300, { align: 'center' });
doc.fontSize(16).text('Sistema Prolicit - Gestão de Licitações', { align: 'center' });
doc.moveDown(2);
doc.fontSize(12).fillColor('#666666').text('Visão Geral, Arquitetura, Banco de Dados, Backend e Frontend', { align: 'center' });
doc.addPage();
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFFFFF');

// 1. VISÃO GERAL
sectionTitle('1. Visão Geral do Sistema');
bodyText('O Prolicit é um sistema de gestão desenvolvido para o controle de licitações, lotes, itens, serviços executados e entregas, além de gerenciamento de documentos e orçamentos. Seu objetivo principal é fornecer à empresa uma plataforma centralizada para acompanhar o andamento financeiro e operacional de contratos públicos.');
bodyText('Arquitetura Base:');
bodyText('- Frontend: React (Vite) + Bootstrap + React Router + Axios');
bodyText('- Backend: Node.js + Express + JWT (JSON Web Token)');
bodyText('- Banco de Dados: MySQL');

// 2. BANCO DE DADOS
sectionTitle('2. Estrutura do Banco de Dados (MySQL)');
bodyText('A base de dados possui as seguintes tabelas principais, com todas as regras de exclusão em cascata (ON DELETE CASCADE) a partir do administrador.');

subTitle('Tabela: administrador');
bodyText('Armazena o usuário único da empresa (single-tenant).');
codeText('id, nome, email, senha, criado_em');

subTitle('Tabela: licitacao');
bodyText('O contrato mestre ganho pela empresa.');
codeText('id, administrador_id, numero_processo, orgao_publico, data_abertura, data_vigencia, valor_estimado, status, tipo (Serviços/Equipamentos/Ambos), observacoes');

subTitle('Tabela: lote');
bodyText('Divisão financeira da licitação.');
codeText('id, licitacao_id, numero_lote, valor_total_arrematado, descricao');

subTitle('Tabela: item');
bodyText('Os produtos/serviços detalhados do lote.');
codeText('id, lote_id, descricao, quantidade_ganha, quantidade_executada, valor_unitario');

subTitle('Tabela: servico e entrega');
bodyText('Registro da execução de um item e comprovante de entrega (quem recebeu e data).');

// 3. BACKEND E APIs
sectionTitle('3. Backend - Estrutura e Rotas (Express)');
bodyText('O backend segue a arquitetura MVC (Model-View-Controller) simplificada para APIs REST.');

subTitle('Controllers Principais:');
bodyText('- AuthController: Login, Cadastro, Perfil, Alteração de Senha. Gera token JWT.');
bodyText('- LicitacaoController: Criação, listagem, resumo financeiro da licitação.');
bodyText('- LoteController e ItemController: CRUD de lotes e itens.');
bodyText('- ServicoController e EntregaController: Gerenciamento da execução (baixas) e canhotos de entrega.');
bodyText('- DocumentoController: Controle de arquivos e avisos de vencimento.');

subTitle('Middleware (autenticar.js):');
bodyText('Verifica o token JWT presente no cabeçalho (Authorization) de cada requisição protegida, inserindo o ID do usuário (req.usuarioId) para isolamento dos dados.');

// 4. FRONTEND
sectionTitle('4. Frontend - Estrutura e Fluxos (React)');
bodyText('O frontend é uma SPA (Single Page Application) que consome as rotas do backend.');

subTitle('Páginas (src/pagina):');
bodyText('- Dashboard.jsx: Resumo de licitações ativas, alertas de documentos vencendo.');
bodyText('- Licitacoes.jsx e LicitacaoAdicionar.jsx: Listagem e Formulário complexo para adicionar a licitação em lote (Licitação + Lotes + Itens na mesma tela).');
bodyText('- Servicos.jsx e ServicoAdicionar.jsx: Registro da execução dos itens (baixa). Verifica qual saldo está disponível e vincula ao item.');
bodyText('- Relatorios.jsx: Emissão de extratos, medições e filtros detalhados.');

// 5. REGRAS DE NEGÓCIO E VALIDAÇÕES (Novidades Implementadas)
sectionTitle('5. Regras de Negócio de Valores');
bodyText('Para garantir a coerência financeira, as seguintes validações foram implementadas no formulário (LicitacaoAdicionar.jsx):');
bodyText('1. A soma do cálculo (quantidade_ganha * valor_unitario) de todos os itens de um lote NÃO pode ultrapassar o valor_total_arrematado do respectivo lote.');
bodyText('2. A soma do valor_total_arrematado de todos os lotes de uma licitação NÃO pode ultrapassar o valor_estimado total da licitação.');
bodyText('MVC e Segurança: Se o usuário tentar burlar esses limites (ou se a API for chamada diretamente), essas regras estão rigorosamente codificadas nos Controllers (LicitacaoController, LoteController e ItemController), que verificarão a consistência matemática via Banco de Dados e retornarão um Erro 400 (Bad Request). O Frontend, adicionalmente, bloqueia a transação visualmente com bordas vermelhas e exibe um erro amigável (Toast).');
bodyText('3. A licitação agora conta com o campo "Tipo" para filtrar entre Serviços, Equipamentos ou Ambos.');

// FINALIZANDO
doc.moveDown(3);
doc.font('Helvetica-Oblique').fontSize(10).fillColor('#999999').text('Documentação gerada automaticamente para os estudos do projeto.', { align: 'center' });

doc.end();

stream.on('finish', () => {
  console.log('PDF gerado com sucesso em: ' + outputPath);
});
