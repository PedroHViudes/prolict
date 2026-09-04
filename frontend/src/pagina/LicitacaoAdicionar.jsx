import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import Toast from '../components/Toast';
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
    tipo: 'Serviços',
    observacoes: ''
  });

  // Lista de lotes (cada lote tem sua lista de itens)
  const [lotes, setLotes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  
  // Estado para armazenar os campos com erro
  const [erros, setErros] = useState({ licitacao: false, lotes: [] });
  
  // Ref para o input de PDF oculto e estado de carregamento do PDF
  const fileInputRef = useRef(null);
  const [processandoPdf, setProcessandoPdf] = useState(false);


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
            tipo: dados.tipo || 'Serviços',
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
    if (campo === 'valor_estimado') setErros({ ...erros, licitacao: false });
  }

  /**
   * Envia o PDF para o backend extrair dados usando Inteligência Artificial.
   */
  async function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      exibirToast("Por favor, selecione um arquivo PDF.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('pdf', file);

    try {
      setProcessandoPdf(true);
      exibirToast("Lendo PDF com Inteligência Artificial... Isso pode levar alguns segundos.");
      
      const resposta = await api.post('/licitacoes/extrair-pdf', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const dadosExtraidos = resposta.data;

      // Atualiza os campos gerais da licitação
      setFormData(prev => ({
        ...prev,
        numero_processo: dadosExtraidos.numero_processo || prev.numero_processo,
        orgao_publico: dadosExtraidos.orgao_publico || prev.orgao_publico,
        data_abertura: dadosExtraidos.data_abertura || prev.data_abertura,
        data_vigencia: dadosExtraidos.data_vigencia || prev.data_vigencia,
        valor_estimado: dadosExtraidos.valor_estimado ? String(dadosExtraidos.valor_estimado) : prev.valor_estimado,
        observacoes: dadosExtraidos.observacoes || prev.observacoes
      }));

      // Se a IA encontrou lotes, atualizamos o state
      if (dadosExtraidos.lotes && dadosExtraidos.lotes.length > 0) {
        if (lotes.length === 0 || window.confirm("O PDF continha lotes e itens. Deseja substituir os lotes atuais pelos encontrados no PDF?")) {
            const novosLotes = dadosExtraidos.lotes.map((lote, index) => ({
               numero_lote: lote.numero_lote || `Lote ${index + 1}`,
               valor_total_arrematado: lote.valor_total_arrematado ? String(lote.valor_total_arrematado) : '',
               descricao: lote.descricao || '',
               itens: (lote.itens || []).map(item => ({
                  descricao: item.descricao || '',
                  quantidade_ganha: item.quantidade_ganha ? String(item.quantidade_ganha) : '',
                  valor_unitario: item.valor_unitario ? String(item.valor_unitario) : ''
               }))
            }));
            setLotes(novosLotes);
        }
      }

      exibirToast("PDF processado! Por favor, revise e confirme os dados extraídos.");

    } catch (erro) {
      console.error("Erro ao processar PDF:", erro);
      const msg = erro.response?.data?.mensagem || "Erro ao processar o PDF. Verifique se o arquivo está corrompido.";
      exibirToast(msg);
    } finally {
      setProcessandoPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
    if (campo === 'valor_total_arrematado') {
      setErros({ ...erros, lotes: erros.lotes.filter(l => l !== indice) });
    }
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

    // Validação de Regras de Negócio: Lotes e Itens
    const valorEstimadoLicitacao = parseFloat(formData.valor_estimado) || 0;
    let somaLotes = 0;
    let novosErros = { licitacao: false, lotes: [] };
    let temErro = false;

    for (let i = 0; i < lotes.length; i++) {
      const lote = lotes[i];
      const valorLote = parseFloat(lote.valor_total_arrematado) || 0;
      somaLotes += valorLote;

      let somaItens = 0;
      for (let j = 0; j < lote.itens.length; j++) {
        const item = lote.itens[j];
        const valorItem = (parseFloat(item.quantidade_ganha) || 0) * (parseFloat(item.valor_unitario) || 0);
        somaItens += valorItem;
      }

      // Validação 1: A soma dos itens não pode ser maior que o valor do lote
      if (somaItens > valorLote) {
        exibirToast(`A soma dos itens (R$ ${somaItens.toFixed(2)}) do ${lote.numero_lote || 'Lote ' + (i + 1)} ultrapassa o valor arrematado do lote (R$ ${valorLote.toFixed(2)}).`);
        novosErros.lotes.push(i);
        temErro = true;
      }
    }

    // Validação 2: A soma dos lotes não pode passar do valor total da licitação
    if (somaLotes > valorEstimadoLicitacao) {
      exibirToast(`A soma total dos lotes (R$ ${somaLotes.toFixed(2)}) ultrapassa o valor estimado da licitação (R$ ${valorEstimadoLicitacao.toFixed(2)}).`);
      novosErros.licitacao = true;
      temErro = true;
    }

    setErros(novosErros);

    if (temErro) return;

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
        {/* Seção: Inteligência Artificial */}
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded border border-primary">
          <div>
            <h5 className="fw-bold m-0 text-primary">Preenchimento Automático com IA</h5>
            <p className="text-muted m-0 small">Faça upload do edital em PDF e a Inteligência Artificial preencherá os dados e lotes para você.</p>
          </div>
          <div>
            <input 
              type="file" 
              accept="application/pdf" 
              className="d-none" 
              ref={fileInputRef} 
              onChange={handlePdfUpload} 
            />
            <button
              className="btn btn-primary rounded-pill px-4 fw-bold"
              onClick={() => fileInputRef.current?.click()}
              disabled={processandoPdf}
            >
              {processandoPdf ? "Lendo PDF..." : "Importar PDF do Edital"}
            </button>
          </div>
        </div>

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
              className={`form-control bg-light ${erros.licitacao ? 'is-invalid border-danger border-2' : ''}`}
              value={formData.valor_estimado}
              onChange={(e) => atualizarCampo('valor_estimado', e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="col-md-2 mb-3">
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
          <div className="col-md-2 mb-3">
            <label className="form-label fw-bold">Tipo</label>
            <select
              className="form-select bg-light"
              value={formData.tipo}
              onChange={(e) => atualizarCampo('tipo', e.target.value)}
            >
              <option value="Serviços">Serviços</option>
              <option value="Equipamentos">Equipamentos</option>
              <option value="Ambos">Ambos</option>
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
                    className={`form-control form-control-sm ${erros.lotes.includes(loteIndice) ? 'is-invalid border-danger border-2' : ''}`}
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

              <table className="table table-sm align-middle text-center mb-0 p-4">
                <thead className="table-light">
                  <tr>
                    <th className="text-start">Descrição do Item</th>
                    <th>Quantidade.</th>
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
                            style={{ margin : '0', width: '100%' }}
                          />
                        </td>
                        <td >
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={item.quantidade_ganha}
                            onChange={(e) => atualizarItem(loteIndice, itemIndice, 'quantidade_ganha', e.target.value)}
                            style={{ width: '120px', margin: '0 auto' , textAlign: 'center' }}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={item.valor_unitario}
                            onChange={(e) => atualizarItem(loteIndice, itemIndice, 'valor_unitario', e.target.value)}
                            style={{ width: '120px', margin: '0 auto' , textAlign: 'center' }}
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
