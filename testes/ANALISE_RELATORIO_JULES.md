# Conferência do relatório do Jules e correções aplicadas – 23/10/2026

Este documento confere, item por item, o que o Jules afirmou em `testes/RELATORIO_JULES.md` (commit `4373658`). Também lista o que foi corrigido depois. Cada afirmação foi **reproduzida em ambiente separado**: Node 22, MariaDB 10.11 e o `banco.sql` do projeto.

## 1. O que o Jules alterou no repositório

| Arquivo | O que mudou | Era necessário? |
|---|---|---|
| `backend/index.js` | Passou a exportar o `app` e só abre a porta quando é executado direto (`require.main === module`) | **Sim.** Sem isso o Supertest não consegue testar a API. Não muda nada no uso normal. |
| `backend/package.json` / `package-lock.json` | `npm test` passou a rodar o Jest; entraram `jest` e `supertest` como dependências de desenvolvimento. Nenhuma dependência de produção mudou de versão. | Sim, para rodar a suíte. |
| `backend/tests/regras_negocio.test.js` | 13 testes Jest + Supertest cobrindo RN01 a RN10 | Sim. É a evidência das regras. |
| `frontend/package.json` / `package-lock.json` / `playwright.config.js` | `@playwright/test` e `@axe-core/playwright` como dependências de desenvolvimento | Sim, para os testes de tela e de acessibilidade. |
| `frontend/tests/*.spec.js` | 8 testes de ponta a ponta, incluindo a coleta do axe | Sim. |
| `frontend/tests/axe-results.json`, `testes/resultado_api.json` | Saídas geradas pelos testes | São resultados, não código. São reescritas a cada execução. |
| `testes/RELATORIO_JULES.md` | Relatório da auditoria | Sim. |

**Conclusão:** o Jules **não alterou nenhuma regra de negócio nem tela**. A única mudança em código da aplicação foi o `export` do `index.js`, necessário e sem efeito no uso normal.

## 2. Conferência dos números do relatório

| Afirmação do Jules | Reproduzido? | Observação |
|---|---|---|
| Jest: 13 testes, 13 aprovados | ✅ 13/13 | – |
| Playwright: 8 testes, 8 aprovados | ✅ 8/8 | – |
| `api.test.js`: 101 verificações, 99 ok, 2 avisos | ✅ | – |
| Concorrência: 4 de 10 aceitas, sem estouro | ✅ | – |
| `npm audit`: 6 vulnerabilidades no backend (1 crítica, 1 alta) | ✅ | body-parser, multer, mysql2, nodemailer, proxy-addr e qs |
| Acessibilidade: Dashboard **escuro com 0 violações** | ❌ **Erro do relatório** | O próprio `axe-results.json` dele, e a nossa execução, mostram **1** violação (`color-contrast`) no Dashboard escuro. Todas as páginas têm ao menos 1 violação de contraste, e Relatórios tem também `label`. |
| "Testes de acessibilidade aprovados" | ⚠️ | O teste do axe só **coleta** as violações e sempre passa. Ele não é um teste de aprovação de acessibilidade. |
| RN07 testada | ⚠️ parcial | O teste só confere que a licitação sem número ou órgão é recusada. A leitura real do PDF pela IA não foi testada, porque não havia chave do Gemini. |

## 3. Vulnerabilidades: conferência e decisão

| ID | Achado | Reproduzido? | Decisão |
|---|---|---|---|
| VULN-01 | Chave do Gemini inválida devolvia 401 e o front-end deslogava o usuário | ✅ (código) | **Corrigido:** agora responde 502 |
| VULN-02 | O "esqueci a senha" revelava quais e-mails têm conta | ✅ | **Corrigido:** mesma mensagem nos dois casos |
| VULN-03 | Não havia limite de tentativas | ✅ | **Corrigido:** `express-rate-limit` com login 10 erros/15 min por conta, pedido de código 5/15 min, redefinição 10/15 min, cadastro 20/h e limite geral de 100/15 min por IP |
| VULN-04 | Upload sem limite de tamanho nem de tipo | ✅ | **Corrigido:** 10 MB e só PDF (respostas 413 e 400) |
| VULN-05 | O servidor aceitava qualquer `valor_fixo` | ✅ (99999 foi gravado) | **Corrigido:** o servidor calcula quantidade × valor unitário, inclusive na edição |
| VULN-06 | Possível *prompt injection* pelo texto do edital | ⚠️ risco teórico | **Trabalho futuro.** O resultado da IA já passa por revisão humana e pelas validações (RN07) |
| VULN-07 | CORS liberava qualquer origem com `credentials`; não havia `helmet` | ✅ | **Corrigido:** origens vindas de `CORS_ORIGIN` e `helmet` ativo |
| VULN-08 | O token de uma conta excluída continuava valendo por até 8 h | ✅ | **Corrigido:** o middleware confere se a conta existe |
| VULN-09 | Senha fraca aceita (mínimo de 6 caracteres) | ✅ | **Trabalho futuro** |
| VULN-10 | Token JWT guardado no `localStorage` | ✅ | **Trabalho futuro:** migrar para cookie HttpOnly |
| VULN-11 | Dependências com falhas conhecidas | ✅ | **Corrigido:** `npm audit fix` (mysql2 3.24.6, multer 2.5.0, nodemailer 10.2.1 etc.), e o `npm audit` agora mostra 0 |

**Achado que o Jules não apontou:** a pasta `backend/node_modules` (3.982 arquivos) estava no Git. Ela foi tirada do controle de versão, sem apagar os arquivos do computador. O `.gitignore` já a ignorava, mas ela tinha sido commitada antes.

## 4. Resultados depois das correções

| Bateria | Resultado |
|---|---|
| Jest (`npm test`): regras de negócio + `seguranca.test.js` (6 testes novos) | **19/19** |
| `testes/api.test.js` | **102 verificações: 101 ok, 0 falhas, 1 aviso** (lote sem itens não aparece na escolha de item, comportamento esperado). Com `TESTAR_EMAIL=1`: 103 verificações, 102 ok |
| `testes/concorrencia.test.js` | 4 de 10 aceitas, executado 20 de 20 |
| Playwright (Jules), com `RATE_LIMIT=off` | **8/8** |
| Teste de telas próprio (44 verificações) | **44/44** |
| `npm audit` (backend e frontend) | **0 vulnerabilidades** |

Com o limite de tentativas ativo, as baterias que criam muitas contas recebem HTTP 429. Isso confirma que a proteção funciona. Por isso, os testes devem ser rodados com `RATE_LIMIT=off` (ver `COMO_RODAR.md`).

## 5. Fica para trabalhos futuros
- VULN-06, VULN-09 e VULN-10.
- Contraste de cores e rótulos dos filtros de data apontados pelo axe.
- Sugestões de usabilidade do relatório: spinner no login, reenviar código, barra de saldo do lote, cards recolhíveis, limpar filtros, mensagem de erro fixa, *onboarding*.
- Versão para celular. O sistema é para computador.
