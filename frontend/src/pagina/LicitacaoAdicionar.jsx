import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import api from '../services/api';

/**
 * Página para adicionar ou editar uma Licitação.
 * Se houver um ID na URL, entra no modo de edição (carrega dados existentes).
 * Se não houver ID, entra no modo de criação (formulário vazio).
 * Permite cadastrar a licitação, seus lotes e itens em uma única tela.
 */
export default function LicitacaoAdicionar() {
  const navigate = useNavigate();
  const { id } = useParams(); // Captura o ID da URL (se existir)
  const ehEdicao = Boolean(id);

  // Estado do formulário da licitação
  const [formData, setFormData] = useState({
    numero_processo: '',
    orgao_publico: '',
    data_abertura: '',
    data_vigencia: '',
    valor_estimado: '',
    status: 'Ativa',
    observacoes: ''
  });

  // Lista de lotes (cada lote tem sua lista de itens)
  const [lotes, setLotes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);


  //toast
  const [toast, setToast] = useState({ visivel: false, mensagem: '' });
  
  function exibirToast(mensagem) {
    setToast({ visivel: true, mensagem });
    setTimeout(() => setToast({ visivel: false, mensagem: '' }), 3500);
  } 


  /**
   * Se estiver no modo edição, carrega os dados da licitação existente.
   */
  useEffect(() => {
    if (ehEdicao) {
      async function carregarLicitacao() {
        try {
          setCarregando(true);
          const resposta = await api.get(`/licitacoes/${id}`);
          const dados = resposta.data;
          setFormData({
            numero_processo: dados.numero_processo || '',
            orgao_publico: dados.orgao_publico || '',
            data_abertura: dados.data_abertura ? dados.data_abertura.split('T')[0] : '',
            data_vigencia: dados.data_vigencia ? dados.data_vigencia.split('T')[0] : '',
            valor_estimado: dados.valor_estimado || '',
            status: dados.status || 'Ativa',
            observacoes: dados.observacoes || ''
          });

          // Carrega lotes existentes
          const respostaLotes = await api.get(`/licitacoes/${id}/lotes`);
          const lotesComItens = await Promise.all(
            respostaLotes.data.map(async (lote) => {
              const respostaItens = await api.get(`/lotes/${lote.id}/itens`);
              return { ...lote, itens: respostaItens.data };
            })
          );
          setLotes(lotesComItens);
        } catch (erro) {
          console.error("Erro ao carregar licitação:", erro);
          exibirToast("Erro ao carregar dados da licitação.");
        } finally {
          setCarregando(false);
        }
      }
      carregarLicitacao();
    }
  }, [id, ehEdicao]);

  /**
   * Atualiza os campos do formulário de licitação.
   */
  function atualizarCampo(campo, valor) {
    setFormData({ ...formData, [campo]: valor });
  }

  /**
   * Adiciona um novo lote vazio à lista de lotes.
   */
  function adicionarLote() {
    setLotes([...lotes, {
      numero_lote: `Lote ${lotes.length + 1}`,
      valor_total_arrematado: '',
      descricao: '',
      itens: []
    }]);
  }

  /**
   * Remove um lote da lista pelo seu índice.
   */
  function removerLote(indice) {
    if (window.confirm("Tem certeza que deseja excluir este lote e todos os seus itens?")) {
      setLotes(lotes.filter((_, i) => i !== indice));
    }
  }

  /**
   * Atualiza os campos de um lote específico.
   */
  function atualizarLote(indice, campo, valor) {
    const novosLotes = [...lotes];
    novosLotes[indice] = { ...novosLotes[indice], [campo]: valor };
    setLotes(novosLotes);
  }

  /**
   * Adiciona um novo item vazio a um lote específico.
   */
  function adicionarItem(loteIndice) {
    const novosLotes = [...lotes];
    novosLotes[loteIndice].itens.push({
      descricao: '',
      quantidade_ganha: '',
      valor_unitario: ''
    });
    setLotes(novosLotes);
  }

  /**
   * Remove um item de um lote específico pelo índice do item.
   */
  function removerItem(loteIndice, itemIndice) {
    const novosLotes = [...lotes];
    novosLotes[loteIndice].itens.splice(itemIndice, 1);
    setLotes(novosLotes);
  }

  /**
   * Atualiza os campos de um item específico dentro de um lote.
   */
  function atualizarItem(loteIndice, itemIndice, campo, valor) {
    const novosLotes = [...lotes];
    novosLotes[loteIndice].itens[itemIndice] = {
      ...novosLotes[loteIndice].itens[itemIndice],
      [campo]: valor
    };
    setLotes(novosLotes);
  }

  /**
   * Salva a licitação (criação ou edição) e todos os lotes/itens.
   * No modo criação, primeiro cria a licitação, depois os lotes e itens.
   * No modo edição, atualiza a licitação e sincroniza lotes/itens.
   */
  async function salvarLicitacao() {
    // Validação: campos obrigatórios
    if (!formData.numero_processo || !formData.orgao_publico) {
      exibirToast("O número do processo e o órgão público são obrigatórios.");
      return;
    }

    try {
      setSalvando(true);
      let licitacaoId = id;

      if (ehEdicao) {
        // Atualiza licitação existente
        await api.put(`/licitacoes/${id}`, formData);
      } else {
        // Cria nova licitação
        const resposta = await api.post('/licitacoes', formData);
        licitacaoId = resposta.data.id;
      }

      // Salva cada lote e seus itens
      for (const lote of lotes) {
        let loteId = lote.id;

        if (loteId) {
          // Atualiza lote existente
          await api.put(`/lotes/${loteId}`, lote);
        } else {
          // Cria novo lote vinculado à licitação
          const respostaLote = await api.post(`/licitacoes/${licitacaoId}/lotes`, lote);
          loteId = respostaLote.data.id;
        }

        // Salva cada item do lote
        for (const item of lote.itens) {
          if (item.id) {
            await api.put(`/itens/${item.id}`, item);
          } else {
            await api.post(`/lotes/${loteId}/itens`, item);
          }
        }
      }

      exibirToast(ehEdicao ? "Licitação atualizada com sucesso!" : "Licitação cadastrada com sucesso!");
      navigate('/licitacoes');

    } catch (erro) {
      console.error("Erro ao salvar licitação:", erro);
      const mensagemErro = erro.response?.data?.mensagem || "Erro ao salvar licitação. Verifique os dados e tente novamente.";
      exibirToast(mensagemErro);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <Layout>
        <div className="text-center py-5">
          <p className="text-muted">Carregando dados da licitação...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header 
        title={ehEdicao ? "Editar Licitação" : "Adicionar Nova Licitação Ganha"} 
        subtitle={ehEdicao ? "Atualize os dados do contrato" : "Preencha os dados do novo contrato e seus itens"} 
      />

      <Card>
        {/* Seção: Dados Gerais */}
        <h4 className="fw-bold mb-4">Dados Gerais</h4>
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Órgão Público / Cliente</label>
            <input 
              type="text" 
              className="form-control bg-light" 
              value={formData.orgao_publico}
              onChange={(e) => atualizarCampo('orgao_publico', e.target.value)}
              placeholder="Ex: Prefeitura de Jacarezinho"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Nº da Licitação / Processo</label>
            <input 
              type="text" 
              className="form-control bg-light" 
              value={formData.numero_processo}
              onChange={(e) => atualizarCampo('numero_processo', e.target.value)}
              placeholder="Ex: 001/2025"
            />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label fw-bold">Data de Início</label>
            <input 
              type="date" 
              className="form-control bg-light" 
              value={formData.data_abertura}
              onChange={(e) => atualizarCampo('data_abertura', e.target.value)}
            />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label fw-bold">Data de Término</label>
            <input 
              type="date" 
              className="form-control bg-light" 
              value={formData.data_vigencia}
              onChange={(e) => atualizarCampo('data_vigencia', e.target.value)}
            />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label fw-bold">Valor Estimado (R$)</label>
            <input 
              type="number" 
              className="form-control bg-light" 
              value={formData.valor_estimado}
              onChange={(e) => atualizarCampo('valor_estimado', e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label fw-bold">Status</label>
            <select 
              className="form-select bg-light" 
              value={formData.status}
              onChange={(e) => atualizarCampo('status', e.target.value)}
            >
              <option value="Ativa">Ativa</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">Observações</label>
          <textarea 
            className="form-control bg-light" 
            rows="3"
            value={formData.observacoes}
            onChange={(e) => atualizarCampo('observacoes', e.target.value)}
            placeholder="Observações gerais sobre a licitação..."
          ></textarea>
        </div>

        <hr className="my-4 text-muted" />

        {/* Seção: Lotes e Itens */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold m-0">Lotes e Itens</h4>
          <button 
            className="btn text-white rounded-pill px-4 fw-bold" 
            style={{ backgroundColor: 'var(--prolicit-azul)' }}
            onClick={adicionarLote}
          >
            <FaPlus className="me-2" /> Adicionar Lote
          </button>
        </div>

        {lotes.length === 0 ? (
          <p className="text-muted text-center py-4">
            Nenhum lote adicionado. Clique em "Adicionar Lote" para começar.
          </p>
        ) : (
          lotes.map((lote, loteIndice) => (
            <div key={loteIndice} className="border rounded p-3 mb-4 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0">Lote {loteIndice + 1}</h5>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removerLote(loteIndice)}
                >
                  <FaTrash /> Remover Lote
                </button>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold small">Nº do Lote</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    value={lote.numero_lote}
                    onChange={(e) => atualizarLote(loteIndice, 'numero_lote', e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small">Valor Arrematado (R$)</label>
                  <input 
                    type="number" 
                    className="form-control form-control-sm" 
                    value={lote.valor_total_arrematado}
                    onChange={(e) => atualizarLote(loteIndice, 'valor_total_arrematado', e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small">Descrição</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    value={lote.descricao}
                    onChange={(e) => atualizarLote(loteIndice, 'descricao', e.target.value)}
                  />
                </div>
              </div>

              {/* Itens do Lote */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold small">Itens do Lote</span>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => adicionarItem(loteIndice)}
                >
                  <FaPlus /> Adicionar Item
                </button>
              </div>

              <table className="table table-sm align-middle text-center mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-start">Descrição do Item</th>
                    <th>Qtde.</th>
                    <th>Valor Unit. (R$)</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {lote.itens.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-muted py-3">
                        Nenhum item neste lote.
                      </td>
                    </tr>
                  ) : (
                    lote.itens.map((item, itemIndice) => (
                      <tr key={itemIndice}>
                        <td className="text-start">
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            value={item.descricao}
                            onChange={(e) => atualizarItem(loteIndice, itemIndice, 'descricao', e.target.value)}
                            placeholder="Descrição do item"
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-control form-control-sm" 
                            value={item.quantidade_ganha}
                            onChange={(e) => atualizarItem(loteIndice, itemIndice, 'quantidade_ganha', e.target.value)}
                            style={{ width: '7F0px' , margin: ' 0 auto', textAlign: 'center' }}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-control form-control-sm" 
                            value={item.valor_unitario}
                            onChange={(e) => atualizarItem(loteIndice, itemIndice, 'valor_unitario', e.target.value)}
                            style={{ width: '120px', margin: ' 0 auto' }}
                          />
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removerItem(loteIndice, itemIndice)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))
        )}

        {/* Botões de Ação */}
        <div className="d-flex gap-3 mt-4">
          <button 
            className="btn text-white px-5 py-2 fw-bold rounded-3" 
            style={{ backgroundColor: 'var(--prolicit-verde)' }}
            onClick={salvarLicitacao}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : (ehEdicao ? "Atualizar Licitação" : "Salvar Licitação")}
          </button>
          <button 
            type="button" 
            className="btn text-white px-5 py-2 fw-bold rounded-3" 
            style={{ backgroundColor: '#4a5568' }}
            onClick={() => navigate('/licitacoes')}
          >
            Cancelar
          </button>
        </div>
      </Card>
      {/* Renderização do Toast Global */}
                    {toast.visivel && (
                      <Toast>
                        {toast.mensagem}
                      </Toast>
                    )}
      
    </Layout>
  );
}
