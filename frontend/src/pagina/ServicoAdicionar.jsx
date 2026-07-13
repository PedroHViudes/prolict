import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBox, FaCheck, FaArrowLeft } from 'react-icons/fa';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import api from '../services/api';

/**
 * Página para adicionar ou editar um Serviço (Baixa Operacional).
 * Fluxo em etapas:
 *   1) Selecionar licitação
 *   2) Ver lotes e itens, escolher um item
 *   3) Preencher dados do serviço + quem recebeu
 */
export default function ServicoAdicionar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const ehEdicao = Boolean(id);

  // Etapa atual do formulário (1, 2 ou 3)
  const [etapa, setEtapa] = useState(ehEdicao ? 3 : 1);

  // Lista de licitações disponíveis
  const [licitacoes, setLicitacoes] = useState([]);
  const [licitacaoSelecionada, setLicitacaoSelecionada] = useState(null);

  // Lotes e itens da licitação selecionada
  const [lotesItens, setLotesItens] = useState([]);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  // Dados do formulário do serviço
  const [formData, setFormData] = useState({
    nome_servico: '',
    valor_fixo: '',
    quantidade: '',
    data_execucao: '',
    descricao_detalhada: ''
  });

  // Dados da entrega (quem recebeu)
  const [entregaData, setEntregaData] = useState({
    quem_recebeu: '',
    telefone: '',
    responsavel_entrega: '',
    data_recebimento: '',
    observacoes: ''
  });

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  /**
   * Se estiver no modo edição, carrega os dados do serviço existente.
   */
  useEffect(() => {
    if (ehEdicao) {
      async function carregarServico() {
        try {
          setCarregando(true);
          const resposta = await api.get(`/servicos/${id}`);
          const dados = resposta.data;

          setFormData({
            nome_servico: dados.nome_servico || '',
            valor_fixo: dados.valor_fixo || '',
            quantidade: dados.quantidade || '',
            data_execucao: dados.data_execucao ? dados.data_execucao.split('T')[0] : '',
            descricao_detalhada: dados.descricao_detalhada || ''
          });

          // Carrega entrega vinculada (se existir)
          try {
            const respEntrega = await api.get(`/servicos/${id}/entregas`);
            if (respEntrega.data.length > 0) {
              const ent = respEntrega.data[0];
              setEntregaData({
                quem_recebeu: ent.quem_recebeu || '',
                telefone: ent.telefone || '',
                responsavel_entrega: ent.responsavel_entrega || '',
                data_recebimento: ent.data_recebimento ? ent.data_recebimento.split('T')[0] : '',
                observacoes: ent.observacoes || ''
              });
            }
          } catch (e) { /* sem entrega vinculada */ }

        } catch (erro) {
          console.error("Erro ao carregar serviço:", erro);
          alert("Erro ao carregar dados do serviço.");
        } finally {
          setCarregando(false);
        }
      }
      carregarServico();
    }
  }, [id, ehEdicao]);

  /**
   * Carrega a lista de licitações disponíveis.
   */
  useEffect(() => {
    async function carregarLicitacoes() {
      try {
        const resposta = await api.get('/licitacoes');
        setLicitacoes(resposta.data);
      } catch (erro) {
        console.error("Erro ao carregar licitações:", erro);
      }
    }
    carregarLicitacoes();
  }, []);

  /**
   * Quando seleciona uma licitação, carrega seus lotes e itens.
   */
  async function selecionarLicitacao(licitacao) {
    setLicitacaoSelecionada(licitacao);
    setItemSelecionado(null);
    try {
      const resposta = await api.get(`/licitacoes/${licitacao.id}/lotes-itens`);
      setLotesItens(resposta.data);
      setEtapa(2);
    } catch (erro) {
      console.error("Erro ao carregar lotes e itens:", erro);
      alert("Erro ao carregar lotes e itens da licitação.");
    }
  }

  /**
   * Quando o usuário clica em um item, avança para o formulário.
   */
  function selecionarItem(item) {
    setItemSelecionado(item);
    setFormData({
      ...formData,
      quantidade: ''
    });
    setEtapa(3);
  }

  /**
   * Volta para a etapa anterior.
   */
  function voltarEtapa() {
    if (etapa === 3) {
      setItemSelecionado(null);
      setEtapa(2);
    } else if (etapa === 2) {
      setLicitacaoSelecionada(null);
      setLotesItens([]);
      setEtapa(1);
    }
  }

  /**
   * Atualiza os campos do formulário do serviço.
   * Quando a quantidade muda, recalcula o valor_fixo automaticamente.
   */
  function atualizarCampo(campo, valor) {
    const novosDados = { ...formData, [campo]: valor };

    // Se mudou a quantidade, recalcula valor_fixo automaticamente
    if (campo === 'quantidade' && itemSelecionado) {
      const qtd = parseInt(valor) || 0;
      const valorUnitario = parseFloat(itemSelecionado.valor_unitario) || 0;
      novosDados.valor_fixo = (qtd * valorUnitario).toFixed(2);
    }

    setFormData(novosDados);
  }

  /**
   * Atualiza os campos da entrega.
   */
  function atualizarEntrega(campo, valor) {
    setEntregaData({ ...entregaData, [campo]: valor });
  }

  /**
   * Formata valor para exibição em Real.
   */
  function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  }

  /**
   * Salva o serviço e a entrega vinculada.
   */
  async function salvarServico() {
    if (!formData.nome_servico) {
      alert("O nome do serviço é obrigatório.");
      return;
    }

    // Validação: quantidade não pode exceder o saldo
    if (!ehEdicao && itemSelecionado) {
      const qtd = parseInt(formData.quantidade) || 0;
      const saldo = itemSelecionado.saldo_disponivel || (itemSelecionado.quantidade_ganha - itemSelecionado.quantidade_executada);
      if (qtd > saldo) {
        alert(`Quantidade inválida! Saldo disponível: ${saldo}. Você está tentando enviar ${qtd}.`);
        return;
      }
      if (qtd <= 0) {
        alert("A quantidade deve ser maior que zero.");
        return;
      }
    }

    try {
      setSalvando(true);

      if (ehEdicao) {
        // Atualiza serviço existente
        await api.put(`/servicos/${id}`, {
          nome_servico: formData.nome_servico,
          valor_fixo: formData.valor_fixo || 0,
          data_execucao: formData.data_execucao || null,
          descricao_detalhada: formData.descricao_detalhada
        });

        // Atualiza ou cria entrega
        try {
          const respEntrega = await api.get(`/servicos/${id}/entregas`);
          if (respEntrega.data.length > 0) {
            await api.put(`/entregas/${respEntrega.data[0].id}`, entregaData);
          } else if (entregaData.quem_recebeu || entregaData.responsavel_entrega) {
            await api.post(`/servicos/${id}/entregas`, entregaData);
          }
        } catch (e) { /* sem entrega para atualizar */ }

      } else {
        // Cria novo serviço
        const dadosServico = {
          item_id: itemSelecionado.id,
          nome_servico: formData.nome_servico,
          valor_fixo: formData.valor_fixo || 0,
          quantidade: formData.quantidade || 0,
          data_execucao: formData.data_execucao || null,
          descricao_detalhada: formData.descricao_detalhada
        };

        const resposta = await api.post('/servicos', dadosServico);
        const novoServicoId = resposta.data.id;

        // Cria registro de entrega (se tiver dados)
        if (entregaData.quem_recebeu || entregaData.responsavel_entrega) {
          await api.post(`/servicos/${novoServicoId}/entregas`, entregaData);
        }
      }

      alert(ehEdicao ? "Serviço atualizado com sucesso!" : "Serviço cadastrado com sucesso!");
      navigate('/servicos');

    } catch (erro) {
      console.error("Erro ao salvar serviço:", erro);
      const mensagemErro = erro.response?.data?.mensagem || "Erro ao salvar serviço. Verifique os dados.";
      alert(mensagemErro);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <Layout>
        <div className="text-center py-5">
          <p className="text-muted">Carregando dados do serviço...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        title={ehEdicao ? "Editar Serviço" : "Adicionar Serviço (Baixa Operacional)"}
        subtitle={ehEdicao ? "Atualize os dados do serviço" : "Registre a execução de um serviço"}
      />

      {/* Indicador de etapas (apenas no modo criação) */}
      {!ehEdicao && (
        <div className="d-flex justify-content-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <span className={`badge rounded-pill px-3 py-2 ${etapa >= 1 ? 'bg-success' : 'bg-secondary'}`}>
              1. Licitação
            </span>
            <span className="text-muted">→</span>
            <span className={`badge rounded-pill px-3 py-2 ${etapa >= 2 ? 'bg-success' : 'bg-secondary'}`}>
              2. Item
            </span>
            <span className="text-muted">→</span>
            <span className={`badge rounded-pill px-3 py-2 ${etapa >= 3 ? 'bg-success' : 'bg-secondary'}`}>
              3. Serviço
            </span>
          </div>
        </div>
      )}

      <Card>
        {/* ============================================================ */}
        {/* ETAPA 1: Selecionar Licitação */}
        {/* ============================================================ */}
        {etapa === 1 && (
          <div>
            <h4 className="fw-bold mb-3">Selecione a Licitação</h4>
            <p className="text-muted mb-4">Escolha a licitação para registrar o serviço.</p>

            {licitacoes.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">Nenhuma licitação cadastrada.</p>
                <button className="btn btn-primary" onClick={() => navigate('/licitacoes/adicionar')}>
                  Cadastrar Licitação
                </button>
              </div>
            ) : (
              <div className="row">
                {licitacoes.map((lic) => (
                  <div key={lic.id} className="col-md-6 col-lg-4 mb-3">
                    <div
                      className="border rounded p-3 cursor-pointer h-100"
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => selecionarLicitacao(lic)}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--prolicit-verde)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--cor-borda)'}
                    >
                      <div className="d-flex align-items-start justify-content-between">
                        <div>
                          <h6 className="fw-bold mb-1">{lic.numero_processo}</h6>
                          <small className="text-muted">{lic.orgao_publico}</small>
                        </div>
                        <span className={`badge ${
                          lic.status === 'Ativa' ? 'bg-success' : 'bg-secondary'
                        }`}>
                          {lic.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">
                          Valor: <strong>{formatarMoeda(lic.valor_estimado)}</strong>
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* ETAPA 2: Selecionar Item (Lotes e Itens) */}
        {/* ============================================================ */}
        {etapa === 2 && (
          <div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <button className="btn btn-sm btn-outline-secondary" onClick={voltarEtapa}>
                <FaArrowLeft /> Voltar
              </button>
              <div>
                <h4 className="fw-bold mb-0">
                  Itens de: {licitacaoSelecionada?.numero_processo}
                </h4>
                <small className="text-muted">{licitacaoSelecionada?.orgao_publico}</small>
              </div>
            </div>

            {lotesItens.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">Nenhum lote ou item encontrado nesta licitação.</p>
              </div>
            ) : (
              lotesItens.map((lote) => (
                <div key={lote.id} className="border rounded p-3 mb-4">
                  <h5 className="fw-bold mb-3" style={{ color: 'var(--prolicit-azul)' }}>
                    <FaBox className="me-2" />
                    {lote.numero_lote || 'Lote sem número'}
                    {lote.descricao && <small className="text-muted ms-2">- {lote.descricao}</small>}
                  </h5>

                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Descrição do Item</th>
                          <th className="text-center">Qtde. Ganha</th>
                          <th className="text-center">Qtde. Executada</th>
                          <th className="text-center">Saldo</th>
                          <th className="text-end">Valor Unit.</th>
                          <th className="text-center">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lote.itens.map((item) => {
                          const saldo = item.saldo_disponivel || (item.quantidade_ganha - item.quantidade_executada);
                          return (
                            <tr key={item.id} className={saldo <= 0 ? 'text-muted' : ''}>
                              <td>{item.descricao}</td>
                              <td className="text-center">{item.quantidade_ganha}</td>
                              <td className="text-center">{item.quantidade_executada}</td>
                              <td className="text-center">
                                <span className={`fw-bold ${saldo > 0 ? 'text-success' : 'text-danger'}`}>
                                  {saldo}
                                </span>
                              </td>
                              <td className="text-end">{formatarMoeda(item.valor_unitario)}</td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => selecionarItem(item)}
                                  disabled={saldo <= 0}
                                  title={saldo <= 0 ? 'Sem saldo disponível' : 'Selecionar este item'}
                                >
                                  <FaCheck /> Selecionar
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* ETAPA 3: Formulário do Serviço + Entrega */}
        {/* ============================================================ */}
        {etapa === 3 && (
          <div>
            {!ehEdicao && (
              <div className="d-flex align-items-center gap-3 mb-4">
                <button className="btn btn-sm btn-outline-secondary" onClick={voltarEtapa}>
                  <FaArrowLeft /> Voltar
                </button>
                <div>
                  <h5 className="fw-bold mb-0">
                    Item: {itemSelecionado?.descricao}
                  </h5>
                  <small className="text-muted">
                    {licitacaoSelecionada?.numero_processo} - {licitacaoSelecionada?.orgao_publico}
                  </small>
                </div>
              </div>
            )}

            {/* Resumo do item selecionado */}
            {itemSelecionado && (
              <div className="alert alert-info mb-4">
                <div className="row text-center">
                  <div className="col-md-3">
                    <small className="text-muted d-block">Quantidade Ganha</small>
                    <strong>{itemSelecionado.quantidade_ganha}</strong>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted d-block">Já Executado</small>
                    <strong>{itemSelecionado.quantidade_executada}</strong>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted d-block">Saldo Disponível</small>
                    <strong className="text-success">{itemSelecionado.saldo_disponivel || (itemSelecionado.quantidade_ganha - itemSelecionado.quantidade_executada)}</strong>
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted d-block">Valor Unitário</small>
                    <strong>{formatarMoeda(itemSelecionado.valor_unitario)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Dados do Serviço */}
            <h5 className="fw-bold mb-3">Dados do Serviço</h5>
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Nome do Serviço *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nome_servico}
                  onChange={(e) => atualizarCampo('nome_servico', e.target.value)}
                  placeholder="Ex: Entrega de material de escritório"
                />
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label fw-bold">Quantidade *</label>
                <input
                  type="number"
                  className={`form-control ${
                    (parseInt(formData.quantidade) || 0) > (itemSelecionado?.saldo_disponivel || 0)
                      ? 'border-danger'
                      : ''
                  }`}
                  value={formData.quantidade}
                  onChange={(e) => atualizarCampo('quantidade', e.target.value)}
                  placeholder="0"
                  min="1"
                  max={itemSelecionado?.saldo_disponivel || 0}
                />
                {itemSelecionado && (
                  <small className={`${
                    (parseInt(formData.quantidade) || 0) > (itemSelecionado.saldo_disponivel || 0)
                      ? 'text-danger fw-bold'
                      : 'text-muted'
                  }`}>
                    Saldo: {itemSelecionado.saldo_disponivel || (itemSelecionado.quantidade_ganha - itemSelecionado.quantidade_executada)}
                  </small>
                )}
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label fw-bold">Valor Unit.</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={formatarMoeda(itemSelecionado?.valor_unitario)}
                  readOnly
                  disabled
                />
                <small className="text-muted">Puxado do item</small>
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label fw-bold">Valor Total</label>
                <input
                  type="text"
                  className="form-control fw-bold"
                  value={formatarMoeda(formData.valor_fixo)}
                  readOnly
                  disabled
                  style={{ color: 'var(--prolicit-verde)' }}
                />
                <small className="text-muted">Qtd × Valor Unit.</small>
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label fw-bold">Data de Execução</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.data_execucao}
                  onChange={(e) => atualizarCampo('data_execucao', e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Descrição Detalhada</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.descricao_detalhada}
                onChange={(e) => atualizarCampo('descricao_detalhada', e.target.value)}
                placeholder="Detalhes sobre a execução do serviço..."
              ></textarea>
            </div>

            <hr className="my-4" />

            {/* Dados da Entrega (Quem Recebeu) */}
            <h5 className="fw-bold mb-3">Quem Recebeu (Opcional)</h5>
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Quem Recebeu</label>
                <input
                  type="text"
                  className="form-control"
                  value={entregaData.quem_recebeu}
                  onChange={(e) => atualizarEntrega('quem_recebeu', e.target.value)}
                  placeholder="Nome de quem recebeu"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Telefone</label>
                <input
                  type="text"
                  className="form-control"
                  value={entregaData.telefone}
                  onChange={(e) => atualizarEntrega('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Responsável pela Entrega</label>
                <input
                  type="text"
                  className="form-control"
                  value={entregaData.responsavel_entrega}
                  onChange={(e) => atualizarEntrega('responsavel_entrega', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Data do Recebimento</label>
                <input
                  type="date"
                  className="form-control"
                  value={entregaData.data_recebimento}
                  onChange={(e) => atualizarEntrega('data_recebimento', e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Observações</label>
                <input
                  type="text"
                  className="form-control"
                  value={entregaData.observacoes}
                  onChange={(e) => atualizarEntrega('observacoes', e.target.value)}
                  placeholder="Observações sobre o recebimento"
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="d-flex gap-3 mt-4">
              <button
                className="btn text-white px-5 py-2 fw-bold rounded-3"
                style={{ backgroundColor: 'var(--prolicit-verde)' }}
                onClick={salvarServico}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : (ehEdicao ? "Atualizar Serviço" : "Salvar Serviço")}
              </button>
              <button
                type="button"
                className="btn text-white px-5 py-2 fw-bold rounded-3"
                style={{ backgroundColor: '#4a5568' }}
                onClick={() => navigate('/servicos')}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Card>
    </Layout>
  );
}
