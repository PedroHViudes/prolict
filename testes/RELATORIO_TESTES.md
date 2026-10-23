# Relatório de testes do PROLICIT — 21/10/2026

## Como foi testado

- **API (caixa-preta):** `api.test.js`, 99 verificações de autenticação, recuperação de senha, licitações, lotes, itens, serviços, entregas, documentos, painel, relatórios, exclusões em cascata e isolamento entre dois usuários (um não pode ver nem alterar os dados do outro).
- **Concorrência:** `concorrencia.test.js` envia 10 baixas ao mesmo tempo no mesmo item.
- **Telas (ponta a ponta):** robô no navegador (Playwright) fazendo cadastro, login, licitação com lotes e itens, edição, registro de serviço, relatórios, exportação CSV, tema e fonte, perfil, recuperação de senha, sessão expirada e tela de celular. São 44 verificações.
- **E-mail:** servidor SMTP de teste para conferir se o e-mail com o código chega e se o código funciona.

Banco: o próprio `banco.sql`. Dados fictícios.

## Resultado

| | Antes | Depois das correções |
|---|---|---|
| API | 82 ok · 7 falhas · 12 avisos | 97 ok · 0 falhas · 2 avisos |
| Telas | 31 ok · 9 falhas | 44 ok · 0 falhas |
| Baixas simultâneas no mesmo item | 2 baixas de 20 com saldo 20 → as duas passaram (executado 120 de 100) | 10 baixas de 5 com saldo 20 → só 4 aceitas (executado 20 de 20) |

## Redefinição de senha (o problema relatado)

1. **Causa principal: o Gmail recusa a senha do `.env`.**
   - O `SMTP_PASS` tem 11 caracteres com símbolos. Isso não é uma *senha de app* do Google, que tem 16 letras.
   - Desde 2022 o Gmail só aceita senha de app em programas, então o envio falha com o erro 535.
   - **Isso é configuração e só você pode corrigir** (passos no fim).
2. **O erro era escondido.**
   - O `emailService` capturava a falha e o controller respondia "Código enviado!" mesmo assim. Por isso a tela dizia que tinha enviado.
   - *Corrigido:* agora a API responde 503 com uma mensagem clara, e o código é cancelado.
3. **O código podia nascer vencido.**
   - O prazo de 15 min era calculado no Node e comparado com o `NOW()` do MySQL.
   - Com fusos diferentes (ex.: servidor na nuvem em UTC), o código já chegava expirado.
   - *Corrigido:* o prazo agora é calculado no próprio banco (`DATE_ADD(NOW(), INTERVAL 15 MINUTE)`).
4. **Segurança da redefinição.**
   - Dava para tentar códigos sem limite.
   - *Corrigido:* depois de 5 erros o código é cancelado. O código passou a exigir o e-mail junto e a usar `crypto.randomInt`.

## Falhas encontradas e corrigidas

| # | Onde | Problema | Correção |
|---|---|---|---|
| 1 | Adicionar serviço | **Tela ficava em branco** ao digitar a quantidade (`Toast` sem import). Não dava para registrar baixa pela tela. | import do Toast |
| 2 | Editar licitação | **Remover lote/item e salvar não apagava nada**: tudo voltava ao reabrir. | exclusões enviadas à API ao salvar + aviso quando o item já tem serviços |
| 3 | Serviços (RN03) | Duas baixas simultâneas passavam do saldo (saldo negativo). | baixa atômica: `UPDATE … WHERE saldo >= qtd` |
| 4 | Serviços | Recusa por saldo voltava como erro 500 genérico. | 400 com a mensagem do saldo |
| 5 | Serviços | Permitia baixa em licitação **Finalizada**. | bloqueado no servidor; finalizadas saem da lista na tela |
| 6 | Licitação (RN01) | Apagar ou zerar o valor estimado de uma licitação com lotes passava sem conferência. | validação sempre aplicada |
| 7 | Lote (RN01) | Lote com valor **negativo** era aceito e abria espaço para burlar o limite. | valores negativos recusados |
| 8 | Item (RN02/RN03) | Quantidade ganha podia ficar **menor que a executada** (saldo −30). Quantidades negativas e fracionadas (2,5 era gravado como 3) passavam. | validações de inteiro, ≥ 0 e ≥ executado |
| 9 | Perfil | Errar a senha atual **deslogava o usuário**: a API devolvia 401 e o front entendia como sessão expirada. | 400 |
| 10 | Relatório de licitações | Erro `setServicos is not defined` no console; as entregas não carregavam. | linha removida |
| 11 | Botão "Cadastrar licitação" (no serviço) | Ia para `/licitacoes/adicionar`, que não existe (tela em branco). | `/licitacoes/nova` + rota coringa que leva ao início |
| 12 | Datas | Em servidor com fuso UTC (deploy na nuvem), datas apareciam **um dia antes** e o prazo de vigência errava em 1 dia. | fuso padrão America/Sao_Paulo no backend + datas formatadas pela parte AAAA-MM-DD |
| 13 | CSV | Separado por vírgula, sem BOM e com data crua `2026-03-10T00:00:00.000Z`. No Excel em português abre tudo numa coluna e com acentos quebrados. | `;`, BOM UTF-8, campos entre aspas, data dd/mm/aaaa e valores 1500,00 |
| 14 | Validações menores | Status/tipo inválido dava 500; documento sem nome na edição dava 500; `/vencendo/abc` dava 500; cadastro aceitava e-mail inválido e senha "1". | respostas 400 com mensagem, senha mínima de 6 caracteres, e-mail com espaços aparado |
| 15 | Deploy | URL da API fixa em `localhost`. | `VITE_API_URL` (com localhost como padrão) |

## Avisos (não alterados, para você decidir)

- **Tela de celular:** o menu lateral fixo ocupa cerca de 2/3 da tela e o conteúdo fica espremido. O sistema funciona bem no computador; para celular seria preciso um menu recolhível.
- **Mensagens do "Esqueci a senha":** são diferentes para e-mail cadastrado e não cadastrado, então revelam se a conta existe. Mantive assim porque agora a tela precisa avisar quando o envio falha.
- **Escolha do item no serviço:** lote sem itens não aparece na etapa 2. É esperado, porque não há o que baixar.
- **Toasts durante a digitação:** "Valor fixo recalculado" e "Dados da entrega atualizados" aparecem a cada tecla. São só visuais.
- **Login após excluir a conta:** o JWT de uma conta excluída continua válido até expirar (8 h), mas não enxerga dados.
- **Leitura de edital com IA:** não foi possível testar daqui, porque a chave do Gemini fica só no seu `.env` e eu não uso suas chaves. Só o envio sem arquivo foi verificado (400).
- **`banco.sql`:** não define o charset. Se for importado por linha de comando com cliente latin1, o ENUM `'Serviços'` quebra (erro "Data truncated for column 'tipo'"). Pelo phpMyAdmin/Workbench funciona. Sugestão: `CREATE DATABASE prolicit CHARACTER SET utf8mb4;`.

## O que você precisa fazer para o e-mail funcionar

1. Na conta Google do `SMTP_USER`, ative a **Verificação em duas etapas**.
2. Acesse **myaccount.google.com/apppasswords**, crie uma senha de app (ex.: "PROLICIT") e copie os 16 caracteres.
3. No `backend/.env`, troque o `SMTP_PASS` por essa senha. Pode ser com ou sem espaços: o sistema remove os espaços. Mantenha `SMTP_PORT=465` e `SMTP_SECURE=true`.
4. Reinicie o backend e teste "Esqueci a senha". Se ainda falhar, a tela agora mostra o aviso e o terminal do backend mostra o motivo exato.

## Como rodar os testes de novo

```bash
cd backend && node index.js          # em um terminal
node testes/api.test.js              # em outro (cria e apaga usuários de teste)
node testes/concorrencia.test.js
TESTAR_EMAIL=1 node testes/api.test.js   # inclui o pedido de código por e-mail
```

O arquivo `correcoes.diff` mostra linha a linha tudo o que foi alterado.

## Atualização – 23/10/2026

- **RN08 (vigência):** um serviço com data depois do fim da vigência **não é recusado**. Ele é gravado com `fora_da_vigencia = 1` e aparece com o selo "Fora da vigência" na lista de serviços, no relatório e no CSV. O formulário avisa assim que a data passa da vigência. A marca é recalculada quando a data do serviço ou a vigência da licitação mudam.
- **Gestão documental removida:** a tabela `documento`, as rotas `/api/documentos` e os arquivos `DocumentoController.js`, `Documento.js` e `documentosRoutes.js` foram removidos. A gestão documental ficou nos trabalhos futuros.
- **Banco existente:** rode uma vez `backend/migracoes/2026-10-23_vigencia_sem_documentos.sql`, que cria a coluna nova e apaga a tabela `documento`. Quem recriar o banco com o `banco.sql` novo não precisa rodar.
- **Resultado:** `api.test.js` agora tem 101 verificações, com 99 ok, 0 falhas e 2 avisos de projeto. O teste de telas teve 44 de 44. No teste de concorrência, 4 de 10 baixas foram aceitas e o executado ficou em 20 de 20.
- **Diff desta etapa:** `testes/correcoes_2.diff`.
