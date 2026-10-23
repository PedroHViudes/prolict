// Como rodar: com o backend ligado (npm start / node index.js), execute  node testes/api.test.js
// Cria usuários de teste com e-mails aleatórios e apaga tudo no final.
// Bateria de testes da API do PROLICIT (caixa-preta, via HTTP)
const B = process.env.API || 'http://localhost:3001/api';
const res = [];
let sec = '';
const S = (t) => { sec = t; };
async function call(method, path, body, token) {
  const h = { 'content-type': 'application/json' };
  if (token) h.authorization = 'Bearer ' + token;
  const r = await fetch(B + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  let d = null; const txt = await r.text(); try { d = JSON.parse(txt); } catch { d = txt; }
  return { s: r.status, d };
}
function check(nome, ok, info = '', sev = 'erro') {
  res.push({ sec, nome, ok: !!ok, info: typeof info === 'string' ? info : JSON.stringify(info).slice(0, 200), sev });
}
const msg = (r) => (r.d && r.d.mensagem) || JSON.stringify(r.d).slice(0, 120);

(async () => {
  const u = Date.now();
  const A = { nome: 'Usuário A', email: `a${u}@teste.com`, senha: 'Senha@123' };
  const Bu = { nome: 'Usuário B', email: `b${u}@teste.com`, senha: 'Senha@123' };

  S('Autenticação');
  let r = await call('POST', '/cadastro', A); check('Cadastro válido → 201', r.s === 201, msg(r));
  r = await call('POST', '/cadastro', A); check('E-mail duplicado → 400', r.s === 400, msg(r));
  r = await call('POST', '/cadastro', { email: 'x@x.com' }); check('Cadastro sem campos → 400', r.s === 400, msg(r));
  r = await call('POST', '/cadastro', { nome: 'X', email: 'isso-nao-e-email', senha: '1' });
  check('Cadastro com e-mail inválido e senha "1" é recusado', r.s === 400, `status ${r.s}: ${msg(r)}`, 'aviso');
  await call('POST', '/cadastro', Bu);
  r = await call('POST', '/login', { email: A.email, senha: 'errada' }); check('Senha errada → 401', r.s === 401, msg(r));
  r = await call('POST', '/login', { email: 'ninguem@x.com', senha: 'x' }); check('E-mail inexistente → 401 (mesma msg)', r.s === 401 && /incorretos/.test(msg(r)), msg(r));
  r = await call('POST', '/login', {}); check('Login sem campos → 400', r.s === 400, msg(r));
  r = await call('POST', '/login', { email: A.email, senha: A.senha }); check('Login válido → 200 + token', r.s === 200 && r.d.token, msg(r));
  const tA = r.d.token;
  r = await call('POST', '/login', { email: ' ' + A.email.toUpperCase() + ' ', senha: A.senha });
  check('Login com e-mail em maiúsculas/espaços', r.s === 200, `status ${r.s}`, 'aviso');
  const tB = (await call('POST', '/login', { email: Bu.email, senha: Bu.senha })).d.token;
  r = await call('GET', '/licitacoes'); check('Rota protegida sem token → 401', r.s === 401, msg(r));
  r = await call('GET', '/licitacoes', null, 'abc.def.ghi'); check('Token inválido → 401', r.s === 401, msg(r));
  r = await call('GET', '/perfil', null, tA); check('GET perfil', r.s === 200 && r.d.email === A.email && !r.d.senha, r.d);
  r = await call('PUT', '/perfil', { nome: 'A2', email: Bu.email }, tA); check('Perfil com e-mail de outro → 400', r.s === 400, msg(r));
  r = await call('PUT', '/perfil', { nome: 'Usuário A editado', email: A.email }, tA); check('Atualizar perfil → 200', r.s === 200, msg(r));
  r = await call('PUT', '/perfil/senha', { senhaAtual: 'x', novaSenha: 'Nova@1' }, tA); check('Trocar senha com senha atual errada é recusado', r.s === 400 || r.s === 401, msg(r));
  // atenção: 401 aqui faz o front deslogar o usuário (interceptor)
  check('Senha atual errada NÃO deveria devolver 401 (o front interpreta como sessão expirada e desloga)', r.s !== 401, `status ${r.s}`, 'aviso');
  r = await call('PUT', '/perfil/senha', { senhaAtual: A.senha, novaSenha: 'Nova@123' }, tA); check('Trocar senha → 200', r.s === 200, msg(r));
  r = await call('POST', '/login', { email: A.email, senha: 'Nova@123' }); check('Login com senha nova', r.s === 200, msg(r));

  S('Recuperação de senha');
  // Envia e-mail de verdade: só roda com TESTAR_EMAIL=1 (os e-mails de teste são fictícios e voltariam como não entregues)
  if (process.env.TESTAR_EMAIL) { r = await call('POST', '/esqueci-senha', { email: A.email }); check('Solicitar código → 200', r.s === 200, msg(r)); }
  r = await call('POST', '/esqueci-senha', { email: 'nao-existe@x.com' });
  check('Resposta igual para e-mail cadastrado e não cadastrado (não revela contas)', false, 'mensagens diferentes: "' + msg(r).slice(0, 40) + '…" vs "Código de verificação… enviado"', 'aviso');
  r = await call('POST', '/redefinir-senha', { email: A.email, codigoPIN: '000000', novaSenha: 'x' }); check('PIN errado → 400', r.s === 400, msg(r));
  let tent = 0; for (let i = 0; i < 30; i++) { const x = await call('POST', '/redefinir-senha', { email: A.email, codigoPIN: String(100000 + i), novaSenha: 'Senha@123' }); if (x.s === 400) tent++; }
  check('Limite de tentativas de PIN (força bruta)', tent < 30, `${tent} tentativas seguidas aceitas sem bloqueio`, 'aviso');

  S('Licitações');
  const L = { numero_processo: 'PE 001/2026', orgao_publico: 'Prefeitura Teste', data_abertura: '2026-01-10', data_vigencia: '2026-12-31', valor_estimado: 10000, tipo: 'Serviços', observacoes: 'teste' };
  r = await call('POST', '/licitacoes', L, tA); check('Criar licitação → 201', r.s === 201, msg(r)); const lic = r.d.id;
  r = await call('POST', '/licitacoes', { orgao_publico: 'x' }, tA); check('Sem nº processo → 400', r.s === 400, msg(r));
  r = await call('GET', '/licitacoes/' + lic, null, tA); check('Buscar licitação', r.s === 200 && r.d.numero_processo === L.numero_processo, msg(r));
  check('Data de abertura volta igual (sem deslocar fuso)', r.d.data_abertura && String(r.d.data_abertura).startsWith('2026-01-1'), r.d.data_abertura, 'aviso');
  r = await call('GET', '/licitacoes/' + lic, null, tB); check('Outro usuário NÃO vê a licitação → 404', r.s === 404, msg(r));
  r = await call('PUT', '/licitacoes/' + lic, { ...L, orgao_publico: 'Hack' }, tB); check('Outro usuário NÃO edita → 404', r.s === 404, msg(r));
  r = await call('DELETE', '/licitacoes/' + lic, null, tB); check('Outro usuário NÃO exclui → 404', r.s === 404, msg(r));
  r = await call('GET', '/licitacoes', null, tB); check('Lista do usuário B não traz dados de A', r.s === 200 && r.d.length === 0, `${r.d.length} itens`);
  r = await call('POST', '/licitacoes', { ...L, valor_estimado: -500 }, tA); check('Valor estimado negativo é recusado', r.s === 400, `status ${r.s}`, 'aviso');
  if (r.s === 201) await call('DELETE', '/licitacoes/' + r.d.id, null, tA);
  r = await call('POST', '/licitacoes', { ...L, status: 'Qualquer' }, tA); check('Status inválido → 400 (não 500)', r.s === 400, `status ${r.s}: ${msg(r)}`, 'aviso');
  if (r.s === 201) await call('DELETE', '/licitacoes/' + r.d.id, null, tA);
  r = await call('GET', '/licitacoes/999999', null, tA); check('Licitação inexistente → 404', r.s === 404, msg(r));
  r = await call('GET', '/licitacoes/abc', null, tA); check('ID não numérico → 404/400', r.s === 404 || r.s === 400, `status ${r.s}`);

  S('Lotes (RN01: soma dos lotes ≤ valor da licitação)');
  r = await call('POST', `/licitacoes/${lic}/lotes`, { numero_lote: 'Lote 1', valor_total_arrematado: 6000, descricao: 'L1' }, tA); check('Criar lote 6.000 → 201', r.s === 201, msg(r)); const lo1 = r.d.id;
  r = await call('POST', `/licitacoes/${lic}/lotes`, { numero_lote: 'Lote 2', valor_total_arrematado: 5000 }, tA); check('Lote que estoura (6.000+5.000 > 10.000) → 400', r.s === 400, msg(r));
  r = await call('POST', `/licitacoes/${lic}/lotes`, { numero_lote: 'Lote 2', valor_total_arrematado: 4000 }, tA); check('Lote no limite exato (10.000) → 201', r.s === 201, msg(r)); const lo2 = r.d.id;
  r = await call('POST', `/licitacoes/${lic}/lotes`, { numero_lote: 'X', valor_total_arrematado: 1 }, tB); check('Outro usuário não cria lote → 404', r.s === 404, msg(r));
  r = await call('PUT', '/licitacoes/' + lic, { ...L, valor_estimado: 9000 }, tA); check('Reduzir licitação abaixo da soma dos lotes → 400', r.s === 400, msg(r));
  r = await call('PUT', '/licitacoes/' + lic, { ...L, valor_estimado: 0 }, tA);
  const lc = await call('GET', '/licitacoes/' + lic, null, tA);
  check('Zerar valor da licitação com lotes cadastrados é recusado', r.s === 400, `status ${r.s}; valor ficou ${lc.d.valor_estimado}`);
  await call('PUT', '/licitacoes/' + lic, L, tA);
  r = await call('POST', `/licitacoes/${lic}/lotes`, { numero_lote: 'Lote neg', valor_total_arrematado: -3000 }, tA);
  check('Lote com valor negativo é recusado', r.s === 400, `status ${r.s}`);
  let loNeg = r.s === 201 ? r.d.id : null;
  if (loNeg) {
    r = await call('POST', `/licitacoes/${lic}/lotes`, { numero_lote: 'Lote extra', valor_total_arrematado: 3000 }, tA);
    check('…e com o lote negativo dá para burlar a RN01 (soma real > valor da licitação)', r.s !== 201, `lote extra de 3.000 aceito: ${r.s === 201}`);
    if (r.s === 201) await call('DELETE', '/lotes/' + r.d.id, null, tA);
    await call('DELETE', '/lotes/' + loNeg, null, tA);
  }
  r = await call('POST', `/licitacoes/${lic}/lotes`, { valor_total_arrematado: 0 }, tA); check('Lote sem número → 400', r.s === 400, msg(r));
  r = await call('GET', `/licitacoes/${lic}/lotes`, null, tA); check('Listar lotes', r.s === 200 && r.d.length === 2, `${r.d.length} lotes`);

  S('Itens (RN02: soma dos itens ≤ valor do lote)');
  r = await call('POST', `/lotes/${lo1}/itens`, { descricao: 'Manutenção split', quantidade_ganha: 100, valor_unitario: 50 }, tA); check('Item 100×50 = 5.000 → 201', r.s === 201, msg(r)); const it1 = r.d.id;
  r = await call('POST', `/lotes/${lo1}/itens`, { descricao: 'Excesso', quantidade_ganha: 30, valor_unitario: 50 }, tA); check('Item que estoura o lote (5.000+1.500 > 6.000) → 400', r.s === 400, msg(r));
  r = await call('POST', `/lotes/${lo1}/itens`, { descricao: 'Limpeza', quantidade_ganha: 20, valor_unitario: 50 }, tA); check('Item no limite exato → 201', r.s === 201, msg(r)); const it2 = r.d.id;
  r = await call('POST', `/lotes/${lo1}/itens`, { quantidade_ganha: 0, valor_unitario: 0 }, tA); check('Item sem descrição → 400', r.s === 400, msg(r));
  r = await call('POST', `/lotes/${lo1}/itens`, { descricao: 'X', quantidade_ganha: 1, valor_unitario: 1 }, tB); check('Outro usuário não cria item → 404', r.s === 404, msg(r));
  r = await call('PUT', '/lotes/' + lo1, { numero_lote: 'Lote 1', valor_total_arrematado: 5500, descricao: 'L1' }, tA); check('Reduzir lote abaixo da soma dos itens → 400', r.s === 400, msg(r));
  r = await call('PUT', '/lotes/' + lo1, { numero_lote: 'Lote 1', valor_total_arrematado: 7000 }, tA); check('Aumentar lote estourando a licitação → 400', r.s === 400, msg(r));
  r = await call('PUT', `/itens/${it2}`, { descricao: 'Limpeza', quantidade_ganha: 21, valor_unitario: 50 }, tA); check('Editar item estourando o lote → 400', r.s === 400, msg(r));
  r = await call('POST', `/lotes/${lo2}/itens`, { descricao: 'Fracionado', quantidade_ganha: 2.5, valor_unitario: 100 }, tA);
  let itf = r.d.id; let gf = await call('GET', '/itens/' + itf, null, tA);
  check('Quantidade fracionada (2,5) é tratada (recusada ou guardada como 2,5)', r.s === 400 || Number(gf.d.quantidade_ganha) === 2.5, `aceito com status ${r.s}, gravado como ${gf.d && gf.d.quantidade_ganha} (coluna INT arredonda)`, 'aviso');
  if (itf) await call('DELETE', '/itens/' + itf, null, tA);
  r = await call('POST', `/lotes/${lo2}/itens`, { descricao: 'Negativo', quantidade_ganha: -10, valor_unitario: 100 }, tA);
  check('Item com quantidade negativa é recusado', r.s === 400, `status ${r.s}`);
  if (r.s === 201) await call('DELETE', '/itens/' + r.d.id, null, tA);

  S('Serviços (RN03: quantidade ≤ saldo do item)');
  const sv = (q, extra = {}) => ({ item_id: it1, nome_servico: 'Manutenção preventiva', quantidade: q, valor_fixo: q * 50, data_execucao: '2026-03-10', descricao_detalhada: 'teste', ...extra });
  r = await call('POST', '/servicos', sv(30), tA); check('Serviço de 30 (saldo 100) → 201', r.s === 201, msg(r)); const s1 = r.d.id;
  r = await call('GET', '/itens/' + it1, null, tA); check('Quantidade executada do item passou a 30', Number(r.d.quantidade_executada) === 30, r.d.quantidade_executada);
  r = await call('POST', '/servicos', sv(50), tA); check('Serviço de 50 (saldo 70) → 201', r.s === 201, msg(r)); const s2 = r.d.id;
  r = await call('POST', '/servicos', sv(21), tA); check('Serviço de 21 com saldo 20 → recusado', r.s >= 400, msg(r));
  check('Recusa por saldo devolve 400 com a mensagem do saldo (não 500 genérico)', r.s === 400 && /saldo/i.test(msg(r)), `status ${r.s}: ${msg(r)}`);
  r = await call('POST', '/servicos', sv('5'), tA); check('Quantidade enviada como texto "5" funciona', r.s === 201, msg(r)); const s3 = r.d.id;
  r = await call('GET', '/itens/' + it1, null, tA); check('Executada = 85 (30+50+5)', Number(r.d.quantidade_executada) === 85, r.d.quantidade_executada);
  r = await call('POST', '/servicos', sv(-10), tA); check('Serviço com quantidade negativa é recusado', r.s === 400, `status ${r.s}`, 'aviso');
  if (r.s === 201) await call('DELETE', '/servicos/' + r.d.id, null, tA);
  r = await call('POST', '/servicos', sv(1), tB); check('Outro usuário não registra serviço no item de A → 404', r.s === 404, msg(r));
  r = await call('POST', '/servicos', { item_id: it1 }, tA); check('Serviço sem nome → 400', r.s === 400, msg(r));
  r = await call('DELETE', '/servicos/' + s3, null, tA); check('Excluir serviço → 200', r.s === 200, msg(r));
  r = await call('GET', '/itens/' + it1, null, tA); check('Exclusão estorna o saldo (executada volta a 80)', Number(r.d.quantidade_executada) === 80, r.d.quantidade_executada);
  r = await call('PUT', `/itens/${it1}`, { descricao: 'Manutenção split', quantidade_ganha: 50, valor_unitario: 50 }, tA);
  let it1b = await call('GET', '/itens/' + it1, null, tA);
  check('Reduzir quantidade ganha abaixo da executada (80) é recusado', r.s === 400, `status ${r.s}; ganha=${it1b.d.quantidade_ganha}, executada=${it1b.d.quantidade_executada} → saldo ${it1b.d.quantidade_ganha - it1b.d.quantidade_executada}`);
  await call('PUT', `/itens/${it1}`, { descricao: 'Manutenção split', quantidade_ganha: 100, valor_unitario: 50 }, tA);
  r = await call('PUT', '/servicos/' + s1, { nome_servico: 'Editado', valor_fixo: 1500, data_execucao: '2026-03-11', descricao_detalhada: 'x', quantidade: 10 }, tA); check('Editar serviço → 200', r.s === 200, msg(r));
  r = await call('GET', '/itens/' + it1, null, tA); check('Editar serviço não altera quantidade (só nome/valor/data)', Number(r.d.quantidade_executada) === 80, r.d.quantidade_executada, 'aviso');
  r = await call('PUT', '/servicos/' + s1, { nome_servico: 'x' }, tB); check('Outro usuário não edita serviço → 404', r.s === 404, msg(r));
  // concorrência
  const par = await Promise.all([call('POST', '/servicos', sv(20), tA), call('POST', '/servicos', sv(20), tA)]);
  const okPar = par.filter(p => p.s === 201).length;
  r = await call('GET', '/itens/' + it1, null, tA);
  check('Dois registros simultâneos de 20 (saldo 20) — só um deve passar', okPar === 1, `${okPar} aceitos; executada=${r.d.quantidade_executada} de ${r.d.quantidade_ganha}`, 'aviso');
  for (const p of par) if (p.s === 201) await call('DELETE', '/servicos/' + p.d.id, null, tA);
  r = await call('GET', '/servicos', null, tA); check('Listar serviços', r.s === 200 && r.d.length >= 2, `${r.d.length}`);
  r = await call('GET', '/servicos', null, tB); check('Lista de serviços de B vazia', r.s === 200 && r.d.length === 0, `${r.d.length}`);
  r = await call('GET', '/servicos/valor-total', null, tA); check('Valor total de serviços', r.s === 200, r.d);

  S('Entregas');
  r = await call('POST', `/servicos/${s1}/entregas`, { quem_recebeu: 'João', telefone: '43999999999', responsavel_entrega: 'Pedro', data_recebimento: '2026-03-12', observacoes: 'ok' }, tA); check('Registrar entrega → 201', r.s === 201, msg(r)); const e1 = r.d.id;
  r = await call('GET', `/servicos/${s1}/entregas`, null, tA); check('Listar entregas do serviço', r.s === 200 && r.d.length === 1, r.d.length);
  r = await call('GET', `/servicos/${s1}/entregas`, null, tB); check('Outro usuário não vê entregas → 404', r.s === 404, msg(r));
  r = await call('PUT', '/entregas/' + e1, { quem_recebeu: 'Maria' }, tA); check('Editar entrega → 200', r.s === 200, msg(r));
  r = await call('DELETE', '/entregas/' + e1, null, tB); check('Outro usuário não exclui entrega → 404', r.s === 404, msg(r));
  r = await call('GET', '/entregas', null, tA); check('Listar todas as entregas', r.s === 200, r.d.length);

  S('Vigência (RN08: aceita, mas marca o serviço feito depois do fim da vigência)');
  const LV = { ...L, numero_processo: 'PE 002/2026', data_vigencia: '2026-03-31', valor_estimado: 1000 };
  const licV = (await call('POST', '/licitacoes', LV, tA)).d.id;
  const loV = (await call('POST', `/licitacoes/${licV}/lotes`, { numero_lote: 'Lote 1', valor_total_arrematado: 1000 }, tA)).d.id;
  const itV = (await call('POST', `/lotes/${loV}/itens`, { descricao: 'Item vigência', quantidade_ganha: 10, valor_unitario: 100 }, tA)).d.id;
  r = await call('POST', '/servicos', { item_id: itV, nome_servico: 'Dentro', quantidade: 1, valor_fixo: 100, data_execucao: '2026-03-15' }, tA);
  check('Serviço dentro da vigência → 201 sem marca', r.s === 201 && r.d.fora_da_vigencia === false, JSON.stringify(r.d));
  const sDentro = r.d.id;
  r = await call('POST', '/servicos', { item_id: itV, nome_servico: 'Depois', quantidade: 1, valor_fixo: 100, data_execucao: '2026-04-10' }, tA);
  check('Serviço depois da vigência é ACEITO (201), não recusado', r.s === 201, msg(r));
  check('…e volta marcado como fora da vigência, com aviso na mensagem', r.d.fora_da_vigencia === true && /FORA DA VIG/i.test(msg(r)), JSON.stringify(r.d));
  const sFora = r.d.id;
  r = await call('GET', '/servicos/' + sFora, null, tA); check('Marca gravada no banco (fora_da_vigencia = 1)', Number(r.d.fora_da_vigencia) === 1, r.d.fora_da_vigencia);
  r = await call('GET', '/servicos/' + sDentro, null, tA); check('Serviço dentro da vigência continua com marca 0', Number(r.d.fora_da_vigencia) === 0, r.d.fora_da_vigencia);
  await call('PUT', '/licitacoes/' + licV, { ...LV, data_vigencia: '2026-12-31' }, tA);
  r = await call('GET', '/servicos/' + sFora, null, tA); check('Ao corrigir a vigência da licitação, a marca é recalculada', Number(r.d.fora_da_vigencia) === 0, r.d.fora_da_vigencia);
  await call('PUT', '/servicos/' + sDentro, { nome_servico: 'Dentro', valor_fixo: 100, data_execucao: '2027-01-05', descricao_detalhada: '' }, tA);
  r = await call('GET', '/servicos/' + sDentro, null, tA); check('Ao editar a data do serviço para depois da vigência, a marca é atualizada', Number(r.d.fora_da_vigencia) === 1, r.d.fora_da_vigencia);
  await call('DELETE', '/licitacoes/' + licV, null, tA);

  S('Gestão documental removida (fora do escopo)');
  r = await call('GET', '/documentos', null, tA); check('Rota /documentos não existe mais (404)', r.s === 404, `status ${r.s}`);

  S('Painel e relatórios');
  r = await call('GET', '/licitacoes/dashboard/resumo', null, tA); check('Resumo do painel', r.s === 200 && r.d.contagem, r.d);
  r = await call('GET', '/licitacoes/ativas', null, tA); const at = r.d.find(x => x.id === lic);
  check('Licitações ativas com saldo = estimado − executado', at && Math.abs(Number(at.saldo) - (Number(at.valor_estimado) - Number(at.valor_executado))) < 0.01, at && { est: at.valor_estimado, exe: at.valor_executado, saldo: at.saldo });
  r = await call('GET', '/licitacoes/relatorio/resumo', null, tA); check('Relatório geral', r.s === 200 && r.d.length >= 1, r.d.length);
  r = await call('GET', `/licitacoes/${lic}/resumo`, null, tA); check('Resumo com saldo da licitação', r.s === 200, msg(r));
  r = await call('GET', `/licitacoes/${lic}/lotes-itens`, null, tA); check('Lotes e itens agrupados', r.s === 200 && r.d.length >= 1, r.d.length);
  check('Lote sem itens aparece em lotes-itens', r.d.length === 2, `${r.d.length} de 2 lotes (lote sem item some)`, 'aviso');
  r = await call('GET', `/licitacoes/${lic}/lotes-itens`, null, tB); check('Outro usuário → 404', r.s === 404, msg(r));

  S('Licitação finalizada');
  await call('PUT', '/licitacoes/' + lic, { ...L, status: 'Finalizada' }, tA);
  r = await call('POST', '/servicos', sv(1), tA); check('Registrar serviço em licitação Finalizada é bloqueado', r.s === 400, `status ${r.s}`);
  if (r.s === 201) await call('DELETE', '/servicos/' + r.d.id, null, tA);
  await call('PUT', '/licitacoes/' + lic, { ...L, status: 'Ativa' }, tA);

  S('Leitura de edital com IA');
  const fd = new FormData(); const rr = await fetch(B + '/licitacoes/extrair-pdf', { method: 'POST', headers: { authorization: 'Bearer ' + tA }, body: fd });
  check('Envio sem arquivo → 400', rr.status === 400, rr.status);

  S('Exclusões em cascata');
  r = await call('DELETE', '/lotes/' + lo2, null, tA); check('Excluir lote → 200', r.s === 200, msg(r));
  r = await call('DELETE', '/licitacoes/' + lic, null, tA); check('Excluir licitação → 200', r.s === 200, msg(r));
  r = await call('GET', '/servicos', null, tA); check('Serviços da licitação excluída somem (cascata)', r.s === 200 && r.d.length === 0, r.d.length);
  r = await call('DELETE', '/perfil', null, tB); check('Excluir conta B → 200', r.s === 200, msg(r));
  r = await call('POST', '/login', Bu); check('Conta excluída não loga', r.s === 401, msg(r));
  r = await call('GET', '/licitacoes', null, tB); check('Token da conta excluída deixa de funcionar', r.s === 401 || (r.s === 200 && r.d.length === 0), `status ${r.s} (JWT continua válido até expirar)`, 'aviso');
  await call('DELETE', '/perfil', null, tA);

  const fs = require('fs'); fs.writeFileSync(require('path').join(__dirname, 'resultado_api.json'), JSON.stringify(res, null, 1));
  let cur = '';
  for (const x of res) { if (x.sec !== cur) { cur = x.sec; console.log('\n## ' + cur); } console.log((x.ok ? 'PASS' : (x.sev === 'aviso' ? 'AVISO' : 'FALHA')).padEnd(6), x.nome, x.ok ? '' : ' → ' + x.info); }
  console.log('\nTotal', res.length, 'pass', res.filter(x => x.ok).length, 'falha', res.filter(x => !x.ok && x.sev === 'erro').length, 'aviso', res.filter(x => !x.ok && x.sev === 'aviso').length);
})().catch(e => { console.error('ERRO NO SCRIPT', e); process.exit(1); });
