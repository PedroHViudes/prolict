# PROLICIT

Sistema web para gestão da execução de contratos licitatórios em pequenas empresas fornecedoras. Ele controla licitações ganhas, lotes, itens, serviços executados e entregas, e confere automaticamente os saldos e as regras do contrato.

Projeto desenvolvido como Trabalho de Conclusão de Curso do curso de Tecnologia em Sistemas para Internet do IFPR, *campus* Jacarezinho.

> O sistema foi projetado para uso em **computador**. A versão para celular está prevista em trabalhos futuros.

## Funcionalidades

- Cadastro e login com senha protegida por hash (bcrypt) e token JWT
- Recuperação de senha por código enviado por e-mail
- Licitações, lotes e itens, com limites de valor e de quantidade conferidos no servidor
- Registro de serviços e entregas, com controle de saldo e marcação de serviços fora da vigência
- Painel de indicadores, relatórios e exportação em CSV
- Leitura de editais em PDF com inteligência artificial (Gemini) para preencher o cadastro
- Tema claro e escuro e ajuste do tamanho da fonte

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Front-end | React 19, Vite, React Router, Bootstrap, Axios |
| Back-end | Node.js, Express 5, mysql2, JWT, bcrypt, Nodemailer, Multer, pdf-parse, Gemini, helmet, express-rate-limit |
| Banco de dados | MySQL 8 (ou MariaDB 10.6+) |
| Testes | Jest, Supertest, Playwright, axe-core |

## Estrutura

```
backend/    API REST (rotas → controllers → models) e banco.sql
frontend/   interface em React
testes/     testes de API e de concorrência (caixa-preta)
```

## Como rodar

**Requisitos:** Node.js 18 ou superior (recomendado 22) e MySQL 8.

1. **Banco de dados:** execute `backend/banco.sql` no MySQL Workbench ou no phpMyAdmin. O script recria as tabelas do zero.
2. **Configuração:** copie `backend/.env.example` para `backend/.env` e preencha os valores. No Gmail, use uma **senha de app** (16 letras), não a senha da conta.
3. **Instalação:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. **Execução**, em dois terminais:
   ```bash
   cd backend && npm start      # API em http://localhost:3001
   cd frontend && npm run dev   # sistema em http://localhost:5173
   ```

## Testes automatizados

As baterias criam muitas contas e fazem muitos logins seguidos. Para rodá-las, descomente `RATE_LIMIT=off` no `.env` e reinicie o backend. Depois dos testes, comente a linha de novo.

```bash
cd backend && npm test               # regras de negócio (RN01–RN10) e segurança
node testes/api.test.js              # com o backend rodando
node testes/concorrencia.test.js
cd frontend && npx playwright test   # com o backend e o front-end rodando
```

## Autor

Pedro Henrique Viudes Bezerra da Silva
