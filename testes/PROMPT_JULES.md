# Prompt para o Jules – auditoria do PROLICIT

> Copie tudo abaixo da linha e cole no Jules, com o repositório `PedroHViudes/prolict` selecionado.

---

Você vai auditar o PROLICIT, um sistema web de gestão de licitações para pequenas empresas fornecedoras. Ele é o software do meu TCC de Tecnologia em Sistemas para Internet (IFPR). Preciso de **evidências verificáveis** para o capítulo de resultados, então registre comandos, saídas e arquivos/linhas de tudo o que afirmar. Não invente resultados: o que não conseguir executar, marque como "não verificado" e explique o motivo.

## Contexto do projeto
- `backend/`: Node.js + Express 5, padrão rotas → controllers → models (DAO), MySQL via `mysql2` (pool, consultas parametrizadas), JWT (`jsonwebtoken`, 8 h), `bcrypt`, Nodemailer (código de 6 dígitos para recuperar senha), Multer + `pdf-parse` + `@google/genai` (Gemini 2.5 Flash) para extrair dados de editais em PDF.
- `frontend/`: React 19 + Vite + React Router + Bootstrap + Axios (token no `localStorage`, interceptor que desloga em 401).
- Banco: `backend/banco.sql` (6 tabelas: administrador, licitacao, lote, item, servico, entrega). Migração para bancos antigos: `backend/migracoes/2026-10-23_vigencia_sem_documentos.sql`.
- Testes já existentes (caixa-preta, Node 18+ com `fetch`): `testes/api.test.js` (cerca de 100 verificações) e `testes/concorrencia.test.js`.

## Como subir o ambiente
1. Instale MySQL 8 ou MariaDB e rode `mysql < backend/banco.sql` com charset utf8mb4 (`mysql --default-character-set=utf8mb4`).
2. Crie `backend/.env` **apenas no ambiente de teste** (nunca faça commit dele), com valores fictícios: `DB_HOST=127.0.0.1`, `DB_USER`, `DB_PASS`, `DB_NAME=prolicit`, `PORT=3001`, `JWT_SECRET=<aleatório>`. Deixe `GEMINI_API_KEY` vazio. Para SMTP, use um servidor de teste local (por exemplo `smtp4dev`, MailHog ou `python -m aiosmtpd`) com `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE=false`, `SMTP_USER` e `SMTP_PASS` fictícios.
3. `cd backend && npm ci && node index.js` e `cd frontend && npm ci && npm run dev`.

## Tarefas

### 1. Auditoria de segurança (prioridade)
Use o OWASP Top 10 (2021) como referência e verifique, no mínimo:
- **Controle de acesso / IDOR:** em todas as rotas, um usuário consegue ler, alterar ou excluir dados de outro? Teste com duas contas.
- **Autenticação:** segredo e expiração do JWT; token em `localStorage` (risco de XSS); token continua válido depois de excluir a conta; política de senha.
- **Força bruta e limite de requisições:** `/api/login`, `/api/esqueci-senha` e `/api/redefinir-senha` (o PIN é cancelado após 5 erros por e-mail; confirme). Existe rate limiting?
- **Injeção:** confirme que todas as consultas SQL são parametrizadas; procure qualquer concatenação de entrada do usuário.
- **Validação de entrada:** valores negativos, tipos errados, campos enormes, datas inválidas.
- **Upload de PDF:** o Multer tem limite de tamanho e de tipo de arquivo? Um PDF muito grande derruba o servidor? Há risco de *prompt injection* pelo texto do edital enviado ao Gemini?
- **Configuração:** CORS (`origin: true` com `credentials`), ausência de cabeçalhos de segurança (ex.: `helmet`), mensagens de erro que vazam detalhes internos.
- **Dependências:** `npm audit` no backend e no frontend.
- **Segredos:** procure no **histórico do Git** qualquer `.env`, senha, chave de API ou credencial já commitada.

Pontos que eu já suspeito. **Confirme ou refute cada um**, com evidência:
- (a) o servidor aceita qualquer `valor_fixo` no serviço, em vez de calcular quantidade × valor unitário;
- (b) com chave do Gemini inválida a API responde 401, e o front-end desloga o usuário;
- (c) as mensagens do "esqueci a senha" revelam se o e-mail está cadastrado;
- (d) não há rate limiting;
- (e) o Multer não tem limite de tamanho.

### 2. Regras de negócio
Escreva uma suíte **Jest + Supertest** em `backend/tests/`, usando um banco de teste separado, que cubra estas regras:
- RN01: a soma dos lotes não pode passar do valor estimado da licitação, e o valor não pode ser reduzido abaixo dessa soma (nem zerado com lotes cadastrados).
- RN02: a soma (quantidade × valor unitário) dos itens não pode passar do valor arrematado do lote.
- RN03: um serviço só é aceito se executado + novo ≤ ganho. Recusa com HTTP 400 e a mensagem do saldo. Deve continuar correto com requisições simultâneas.
- RN04: editar um serviço não altera a quantidade.
- RN05: excluir um serviço devolve a quantidade ao saldo.
- RN06: isolamento total entre contas.
- RN07: os dados vindos da IA passam pelas mesmas rotas e validações.
- RN08: serviço com data **depois** do fim da vigência é **aceito**, mas gravado com `fora_da_vigencia = 1`. A marca é recalculada quando a data do serviço ou a vigência mudam.
- RN09: licitação Finalizada não aceita novos serviços.
- RN10: a quantidade ganha não pode ficar menor que a executada.

Rode também `testes/api.test.js` e `testes/concorrencia.test.js` e registre as saídas.

### 3. Testes de ponta a ponta e acessibilidade
- Com **Playwright**, automatize os fluxos: cadastro e login; cadastro de licitação com lotes e itens (incluindo a remoção de item e de lote na edição); registro de serviço em três etapas (com aviso de saldo e de fora da vigência); listagem com o selo "Fora da vigência"; relatórios e exportação CSV; perfil (troca de senha errada **não** pode deslogar); tema claro/escuro e fonte grande persistindo após recarregar; sessão expirada.
- Rode **axe-core** (`@axe-core/playwright`) nas páginas principais, nos temas claro e escuro, com o critério WCAG 2.1 AA, e liste as violações por página.

### 4. Revisão heurística (só relatório, sem alterar código)
Avalie as telas pelas 10 heurísticas de Nielsen. Para cada problema, informe a tela, a heurística, a severidade (0 a 4) e uma sugestão.

## Regras de trabalho
- **Não altere regras de negócio, o esquema do banco nem textos da interface** sem explicar no relatório. Prefira **propor** correções.
- Faça dois PRs separados: (1) **somente testes** (Jest, Playwright, axe), sem mudar o código da aplicação; (2) **correções sugeridas** de segurança, uma por commit, cada uma com o teste que a comprova.
- Nunca faça commit de `.env`, senhas ou chaves.

## Entrega
Crie `testes/RELATORIO_JULES.md` com:
1. **Resumo executivo:** 5 a 10 linhas.
2. **Ambiente:** versões do Node, do MySQL e do sistema; os comandos usados.
3. **Vulnerabilidades:** tabela com ID | severidade (Alta/Média/Baixa) | categoria OWASP | arquivo:linha | como reproduzir | evidência | correção sugerida.
4. **Regras de negócio:** tabela RN | teste | resultado (passou/falhou) | observação.
5. **Testes automatizados:** quantos testes, quantos passaram, saída resumida e como rodar (`npm test`, `npx playwright test`).
6. **Acessibilidade (axe):** violações por página e tema.
7. **Heurísticas de Nielsen:** tabela de problemas.
8. **Não verificado e por quê:** por exemplo, chamada real ao Gemini e envio real pelo Gmail.
