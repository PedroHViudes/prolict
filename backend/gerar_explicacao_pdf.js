const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50 });
const outputPath = path.join(__dirname, '..', 'Explicacao_LicitacaoAdicionar.pdf');
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
doc.fillColor('#003366').font('Helvetica-Bold').fontSize(24).text('EXPLICAÇÃO DE CÓDIGO', 0, 80, { align: 'center' });
doc.fontSize(14).text('Página: LicitacaoAdicionar.jsx', { align: 'center' });
doc.moveDown(1.5);
doc.rect(50, 150, doc.page.width - 100, doc.page.height - 200).fill('#FFFFFF');

// 1. INTRODUÇÃO
doc.y = 160;
doc.x = 60;
sectionTitle('Resumo das Modificações');
bodyText('Este documento explica, passo a passo, todas as alterações que foram feitas no componente React "LicitacaoAdicionar.jsx" para incorporar as novas regras de negócio e os alertas visuais (bordas vermelhas).');

// 2. IMPORTAÇÕES
subTitle('1. A Importação do Toast (Correção do "White Screen")');
bodyText('Quando uma validação falhava e o Toast era chamado, a tela ficava totalmente branca. Isso acontecia porque o componente Toast estava sendo usado no JSX, mas nunca havia sido importado no topo do arquivo. Adicionamos a linha:');
codeText("import Toast from '../components/Toast';");

// 3. ESTADOS
subTitle('2. Criação do Estado de Erros (State)');
bodyText('Foi criado um novo Hook de estado (useState) para controlar e memorizar quais campos estão inválidos no momento. Ele guarda um valor booleano para a licitação geral, e uma lista (array) contendo o índice dos lotes que estão com problema.');
codeText("const [erros, setErros] = useState({ licitacao: false, lotes: [] });");

// 4. CAMPO TIPO
subTitle('3. Adição do Campo "Tipo" (Serviços/Equipamentos/Ambos)');
bodyText('No estado inicial "formData", adicionamos a propriedade "tipo: \'Serviços\'". E na estrutura JSX (HTML), incluímos um <select> ao lado do Status. Esse select chama a função "atualizarCampo(\'tipo\', e.target.value)" quando o usuário altera a opção.');

// 5. A LÓGICA DE VALIDAÇÃO (O CORAÇÃO DA MUDANÇA)
subTitle('4. A Lógica de Validação na função salvarLicitacao()');
bodyText('Dentro da função responsável por salvar, antes de fazer qualquer requisição (API POST/PUT), incluímos a matemática financeira:');
bodyText('- 1º Passo: Lemos o valor_estimado total digitado.');
bodyText('- 2º Passo: Criamos um loop (for) para passar por cada lote adicionado.');
bodyText('- 3º Passo: Dentro de cada lote, fazemos outro loop nos "itens", multiplicando a "quantidade_ganha" pelo "valor_unitario" de cada item, e somamos isso na variável "somaItens".');
bodyText('- 4º Passo: Verificamos se "somaItens" é maior que o valor do respectivo lote. Se for, ativamos o alerta, registramos o erro visual daquele lote (novosErros.lotes.push(indice)) e bloqueamos o salvamento.');
bodyText('- 5º Passo: Ao final de todos os lotes, verificamos se a soma do valor de todos eles ultrapassa o "valor_estimado" global da licitação. Se sim, bloqueamos novamente.');

// 6. CLASSES DINÂMICAS (CSS)
subTitle('5. As Bordas Vermelhas Dinâmicas no JSX');
bodyText('Para que o input fique vermelho quando há erro, usamos uma expressão JavaScript dentro da className dos inputs. Essa técnica é chamada de interpolação de strings.');
codeText("className={`form-control ${erros.licitacao ? 'is-invalid border-danger border-2' : ''}`}");
bodyText('O que isso faz? Se a variável "erros.licitacao" for true, o React injeta a classe "is-invalid border-danger", que o Bootstrap já reconhece e pinta de vermelho. Se for false, a classe fica vazia. O mesmo foi feito no input do lote, verificando se o array "erros.lotes" inclui aquele lote específico.');

// FINALIZANDO
doc.moveDown(3);
doc.font('Helvetica-Oblique').fontSize(10).fillColor('#999999').text('Fim da explicação técnica.', { align: 'center' });

doc.end();

stream.on('finish', () => {
  console.log('PDF de explicação gerado com sucesso em: ' + outputPath);
});
