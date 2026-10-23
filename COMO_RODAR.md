# Como rodar o PROLICIT (versão para computador)

> O PROLICIT foi projetado para uso em **computador (desktop)**. A adaptação para celular está prevista em trabalhos futuros.

## 1. Requisitos
- Node.js 18 ou superior (recomendado 22)
- MySQL 8 (ou MariaDB 10.6+)

## 2. Banco de dados
- **Banco novo:** rode `backend/banco.sql` no MySQL Workbench ou no phpMyAdmin.
- **Banco que já existia antes de 23/10/2026:** rode uma vez `backend/migracoes/2026-10-23_vigencia_sem_documentos.sql`. Ele cria a coluna `fora_da_vigencia` e remove a tabela `documento`.

## 3. Configuração
1. Copie `backend/.env.example` para `backend/.env` e preencha.
   - O Gmail exige **senha de app**, não a senha da conta.
2. Instale as dependências **no terminal do Windows**:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

## 4. Executar
```bash
# terminal 1
cd backend
node index.js        # API em http://localhost:3001

# terminal 2
cd frontend
npm run dev          # sistema em http://localhost:5173
```

## 5. Testes automatizados
Para rodar as baterias de teste, inicie o backend com `RATE_LIMIT=off` no `.env`. As baterias criam muitas contas e fazem muitos logins seguidos, e o limite de tentativas (proteção contra força bruta) bloquearia os testes. **Volte a comentar a linha depois.**

```bash
cd backend
npm test                          # Jest: regras de negócio (RN01–RN10) e segurança

# com o backend rodando:
node ../testes/api.test.js        # cerca de 100 verificações da API
node ../testes/concorrencia.test.js

# com o backend e o front rodando:
cd ../frontend
npx playwright install chromium   # só na primeira vez
npx playwright test               # fluxos de tela e acessibilidade (axe)
```
