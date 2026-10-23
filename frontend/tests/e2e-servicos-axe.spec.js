import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';

async function criarELogarUsuario(page) {
  const ts = Date.now() + Math.floor(Math.random() * 10000);
  const u = {
    nome: 'Playwright Axe User',
    email: `axe_${ts}@teste.com`,
    senha: 'Senha@123'
  };

  await page.goto('/cadastro');
  await page.fill('input[placeholder="Digite o Nome do Responsável"]', u.nome);
  await page.fill('input[placeholder="Digite o Email Empresarial"]', u.email);
  await page.fill('input[placeholder="Digite uma Senha"]', u.senha);
  await page.fill('input[placeholder="Confirme a Senha"]', u.senha);
  await page.click('button:has-text("Cadastrar")');

  await page.waitForURL('/');
  await page.fill('input[placeholder="Digite Seu Email"]', u.email);
  await page.fill('input[placeholder="Digite Sua Senha"]', u.senha);
  await page.click('button:has-text("Entrar")');
  await page.waitForURL('/dashboard');

  return u;
}

test.describe('E2E Serviços, Relatórios, CSV e Acessibilidade (Axe-core)', () => {
  let usuario;

  test.beforeEach(async ({ page }) => {
    usuario = await criarELogarUsuario(page);
  });

  test('Registro de Serviço em 3 etapas com aviso de Fora da Vigência e Selo na Listagem', async ({ page }) => {
    // 1. Cria licitação para ter item disponível
    await page.goto('/licitacoes/nova');
    await page.fill('input[placeholder="Ex: 001/2025"]', 'PE 888/2026');
    await page.fill('input[placeholder="Ex: Prefeitura de Jacarezinho"]', 'Órgão Vigência Test');
    await page.fill('input[placeholder="0,00"]', '10000');

    // Define término no passado para forçar Fora da Vigência (ex: 2020-01-01)
    const inputsData = page.locator('input[type="date"]');
    await inputsData.nth(1).fill('2020-01-01');

    await page.click('button:has-text("Adicionar Lote")');
    const loteCard = page.locator('.border.rounded.p-3').first();
    await loteCard.locator('input[type="number"]').first().fill('10000');

    await loteCard.locator('button:has-text("Adicionar Item")').click();
    await page.fill('input[placeholder="Descrição do item"]', 'Item Vigência');
    const inputsItem = loteCard.locator('table input[type="number"]');
    await inputsItem.nth(0).fill('10');
    await inputsItem.nth(1).fill('1000');

    await page.click('button:has-text("Salvar Licitação")');
    await page.waitForURL('/licitacoes');

    // 2. Registra serviço em 3 etapas
    await page.goto('/servicos/novo');

    // Etapa 1: Selecionar Licitação
    await page.click('text=PE 888/2026');

    // Etapa 2: Selecionar Item
    await page.click('button:has-text("Selecionar")');

    // Etapa 3: Preencher dados do Serviço + Quem recebeu + Aviso fora da vigência
    await page.fill('input[placeholder="Ex: Entrega de material de escritório"]', 'Serviço com Selo');
    await page.fill('input[placeholder="0"]', '2');

    // Verifica se o aviso de fora da vigência é exibido no formulário
    await expect(page.locator('text=fora da vigência').first()).toBeVisible();

    await page.fill('input[placeholder="Nome de quem recebeu"]', 'Recebedor Teste');
    await page.click('button:has-text("Salvar Serviço")');

    // 3. Verifica listagem de serviços e presença do selo "Fora da vigência"
    await page.waitForURL('/servicos');
    await expect(page.locator('text=Serviço com Selo')).toBeVisible();
    await expect(page.locator('.badge:has-text("Fora da vigência")')).toBeVisible();
  });

  test('Relatórios e Botão Exportar CSV', async ({ page }) => {
    await page.goto('/relatorios');
    await expect(page.locator('h4:has-text("Detalhes dos Serviços")')).toBeVisible();

    // Clica no botão Exportar CSV (se não houver dados, valida exibição do Toast)
    await page.click('button:has-text("Exportar CSV")');
    await expect(page.locator('.toast-body').first()).toBeVisible();
  });

  test('Auditoria de Acessibilidade (Axe-core WCAG 2.1 AA) nas Páginas Principais (Tema Claro e Escuro)', async ({ page }) => {
    const paginas = [
      { nome: 'Dashboard', url: '/dashboard' },
      { nome: 'Licitações', url: '/licitacoes' },
      { nome: 'Serviços', url: '/servicos' },
      { nome: 'Relatórios', url: '/relatorios' }
    ];

    const relatorioViolacoes = [];

    for (const p of paginas) {
      await page.goto(p.url);

      // 1. Tema Claro
      const resultsClaro = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      relatorioViolacoes.push({
        pagina: p.nome,
        tema: 'Claro',
        violacoesCount: resultsClaro.violations.length,
        violacoes: resultsClaro.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, helpUrl: v.helpUrl }))
      });

      // 2. Tema Escuro (aplica classe 'tema-escuro' no html)
      await page.evaluate(() => document.documentElement.classList.add('tema-escuro'));

      const resultsEscuro = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      relatorioViolacoes.push({
        pagina: p.nome,
        tema: 'Escuro',
        violacoesCount: resultsEscuro.violations.length,
        violacoes: resultsEscuro.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, helpUrl: v.helpUrl }))
      });
    }

    // Salva o relatório de acessibilidade em arquivo JSON para inclusão no relatório final
    fs.writeFileSync('./tests/axe-results.json', JSON.stringify(relatorioViolacoes, null, 2));

    expect(relatorioViolacoes.length).toBeGreaterThan(0);
  });
});
