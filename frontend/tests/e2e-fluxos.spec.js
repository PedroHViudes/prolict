import { test, expect } from '@playwright/test';

async function criarELogarUsuario(page) {
  const ts = Date.now() + Math.floor(Math.random() * 10000);
  const u = {
    nome: 'Playwright User',
    email: `e2e_${ts}@teste.com`,
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

test.describe('E2E Fluxos Principais do PROLICIT', () => {
  test('Cadastro de Usuário e Login', async ({ page }) => {
    const usuario = await criarELogarUsuario(page);
    await expect(page).toHaveURL('/dashboard');
  });

  test('Cadastro e Edição de Licitação com Lotes e Itens (incluindo exclusão de item e lote)', async ({ page }) => {
    await criarELogarUsuario(page);

    // Navega para licitações e cria nova licitação
    await page.goto('/licitacoes/nova');
    await page.fill('input[placeholder="Ex: 001/2025"]', 'PE 999/2026');
    await page.fill('input[placeholder="Ex: Prefeitura de Jacarezinho"]', 'Prefeitura E2E Test');
    await page.fill('input[placeholder="0,00"]', '15000');

    // Clica no botão para adicionar lote
    await page.click('button:has-text("Adicionar Lote")');

    // Preenche Valor Arrematado do Lote 1
    const loteCard = page.locator('.border.rounded.p-3').first();
    const inputsLote = loteCard.locator('input[type="number"]');
    await inputsLote.nth(0).fill('10000');

    // Adiciona Item 1 no Lote 1
    await loteCard.locator('button:has-text("Adicionar Item")').click();
    await page.fill('input[placeholder="Descrição do item"]', 'Item 1 Teste');

    // Qtd e Valor unitario
    const inputsItem1 = loteCard.locator('table input[type="number"]');
    await inputsItem1.nth(0).fill('10');
    await inputsItem1.nth(1).fill('500');

    // Adiciona Item 2 no Lote 1 para testar exclusão
    await loteCard.locator('button:has-text("Adicionar Item")').click();
    const descItem2 = page.locator('input[placeholder="Descrição do item"]').nth(1);
    await descItem2.fill('Item Para Remover');

    // Remove Item 2
    const btnRemoverItem = loteCard.locator('table button').nth(1);
    await btnRemoverItem.click();

    // Adiciona Lote 2 para testar exclusão de lote
    await page.click('button:has-text("Adicionar Lote")');

    // Remove Lote 2 (configura dialog handler para accept window.confirm)
    page.once('dialog', dialog => dialog.accept());
    const btnRemoverLote = page.locator('button:has-text("Remover Lote")').nth(1);
    await btnRemoverLote.click();

    // Cadastra a Licitação
    await page.click('button:has-text("Salvar Licitação")');

    // Confirma redirecionamento para listagem de licitações
    await page.waitForURL('/licitacoes');
    await expect(page.locator('text=PE 999/2026')).toBeVisible();
  });

  test('Perfil: Troca de Senha Errada Não Desloga o Usuário', async ({ page }) => {
    await criarELogarUsuario(page);

    // Acessa Perfil
    await page.goto('/perfil');

    // Tenta trocar senha com senha atual errada
    const inputsSenha = page.locator('input[type="password"]');
    await inputsSenha.nth(0).fill('SenhaErrada123!');
    await inputsSenha.nth(1).fill('NovaSenha123!');
    await inputsSenha.nth(2).fill('NovaSenha123!');

    await page.click('button:has-text("Atualizar Senha")');

    // Aguarda exibição do toast de erro
    await expect(page.locator('text=A senha atual está incorreta').or(page.locator('text=incorret'))).toBeVisible();

    // Garante que o usuário CONTINUA logado (permanece em /perfil e possui token no localStorage)
    await expect(page).toHaveURL('/perfil');
    expect(await page.evaluate(() => localStorage.getItem('token'))).not.toBeNull();
  });

  test('Configuração de Tema e Fonte Persistindo no LocalStorage', async ({ page }) => {
    await criarELogarUsuario(page);

    // Ir para configurações
    await page.goto('/configuracao');

    // Selecionar Tema Escuro
    await page.click('label:has-text("Escuro")');
    await page.click('button:has-text("Aplicar Tema")');

    // Selecionar Tamanho Grande
    await page.click('label:has-text("Grande (20px)")');
    await page.click('button:has-text("Aplicar Tamanho")');

    // Recarregar a página
    await page.reload();

    // Verificar se as preferências persistiram
    const temaSalvo = await page.evaluate(() => localStorage.getItem('prolicit_tema'));
    const fonteSalva = await page.evaluate(() => localStorage.getItem('prolicit_fonte'));

    expect(temaSalvo).toBe('escuro');
    expect(fonteSalva).toBe('grande');
  });

  test('Sessão Expirada Redireciona para Login', async ({ page }) => {
    await page.goto('/');
    // Tenta acessar rota protegida sem token
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
  });
});
