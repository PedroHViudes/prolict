import React, { useState, useEffect } from 'react';
import { FaFileCsv } from 'react-icons/fa';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import api from '../services/api';
import '../estilos/Dashboard.css';
import Toast from '../components/Toast';



/**
 * Página de Relatórios.
 * Exibe resumo geral de licitações com saldo e detalhes de serviços.
 * Cards de resumo + tabela de licitações + tabela de serviços com filtros.
 */
export default function RelatorioLicitacao() {
  const [licitacoes, setLicitacoes] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Filtros de licitação
  const [filtroOrgao, setFiltroOrgao] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroLicitacao, setFiltroLicitacao] = useState('');

  // Filtros de serviço
  const [filtroServicoCliente, setFiltroServicoCliente] = useState('');
  const [filtroServicoData, setFiltroServicoData] = useState('');


  //toast para exibir mensagens
  const [toast, setToast] = useState({ visivel: false, mensagem: '' });

  function exibirToast(mensagem) {
    setToast({ visivel: true, mensagem });
    setTimeout(() => setToast({ visivel: false, mensagem: '' }), 3500);
  }


  useEffect(() => {
    async function carregarDados() {
      try {
        const [respLicitacoes, respServicos, respEntregas] = await Promise.all([
          api.get('/licitacoes/relatorio/resumo'),
          api.get('/servicos'),
          api.get('/entregas')
        ]);
        setLicitacoes(respLicitacoes.data);
        setServicos(respServicos.data);
        setEntregas(respEntregas.data);
      } catch (erro) {
        console.error("Erro ao carregar relatórios:", erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // Filtros de licitação
  const licitacoesFiltradas = licitacoes.filter(lic => {
    const orgaoMatch = !filtroOrgao ||
      lic.orgao_publico?.toLowerCase().includes(filtroOrgao.toLowerCase());
    const statusMatch = !filtroStatus || lic.status === filtroStatus;
    const dataMatch = !filtroData || lic.data_abertura?.split('T')[0] === filtroData;
    const licitacaoMatch = !filtroLicitacao || lic.numero_processo?.includes(filtroLicitacao);
    return orgaoMatch && statusMatch && dataMatch && licitacaoMatch;
  });

  // Filtros de serviço
  const LicitacoesFiltrados = licitacoes.filter(serv => {
    const clienteMatch = !filtroServicoCliente ||
      serv.orgao_publico?.toLowerCase().includes(filtroServicoCliente.toLowerCase());
    const dataMatch = !filtroServicoData ||
      serv.data_execucao?.split('T')[0] === filtroServicoData;
    return clienteMatch && dataMatch;
  });

  // Totais dos cards
  const totalEstimado = licitacoes.reduce((s, l) => s + parseFloat(l.valor_estimado || 0), 0);
  const totalExecutado = licitacoes.reduce((s, l) => s + parseFloat(l.valor_executado || 0), 0);
  const saldoTotal = licitacoes.reduce((s, l) => s + parseFloat(l.saldo || 0), 0);

  // Busca entrega de um serviço
  function buscarEntrega(servicoId) {
    return entregas.find(e => e.servico_id === servicoId) || null;
  }

  /**
   * Exporta licitações como CSV.
   */
  function exportarLicitacoesCSV() {
    if (licitacoesFiltradas.length === 0) {
      exibirToast("Nenhum dado para exportar.");
      return;
    }
    const cabecalho = "Licitação,Órgão,Data,Valor Estimado,Executado,Saldo,Status\n";
    const linhas = licitacoesFiltradas.map(lic =>
      `${lic.numero_processo},${lic.orgao_publico},${lic.data_abertura || '-'},${lic.valor_estimado || 0},${lic.valor_executado || 0},${lic.saldo || 0},${lic.status}`
    ).join('\n');
    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_licitacoes.csv';
    link.click();
  }

  /**
   * Exporta serviços como CSV.
   */
  function exportarServicosCSV() {
    if (servicosFiltrados.length === 0) {
      exibirToast("Nenhum dado para exportar.");
      return;
    }
    const cabecalho = "Data,Serviço,Licitação,Órgão,Item,Valor,Quem Recebeu,Responsável\n";
    const linhas = servicosFiltrados.map(serv => {
      const ent = buscarEntrega(serv.id);
      return `${serv.data_execucao || '-'},${serv.nome_servico},${serv.numero_processo || '-'},${serv.orgao_publico || '-'},${serv.item_descricao || '-'},${serv.valor_fixo || 0},${ent?.quem_recebeu || '-'},${ent?.responsavel_entrega || '-'}`;
    }).join('\n');
    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_servicos.csv';
    link.click();
  }

  function formatarMoeda(valor) {
    return `R$ ${parseFloat(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  return (
    <Layout>
      <Header
        title="Relatórios Licitação"
        subtitle="Visualize o resumo das licitações"
      />

      {/* ============================================================ */}
      {/* SEÇÃO 1: Cards de Resumo */}
      {/* ============================================================ */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="h-100">
            <h6 className="text-muted mb-3 fw-bold">Total de Licitações</h6>
            <h2 className="fw-bold mb-0 cor-fundo-licitacao" >
              {licitacoes.length}
            </h2>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="h-100">
            <h6 className="text-muted mb-3 fw-bold">Valor Estimado Total</h6>
            <h2 className="fw-bold mb-0 cor-fundo-valor" >
              {formatarMoeda(totalEstimado)}
            </h2>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="h-100">
            <h6 className="text-muted mb-3 fw-bold">Valor Executado</h6>
            <h2 className="fw-bold mb-0 cor-fundo-executado" >
              {formatarMoeda(totalExecutado)}
            </h2>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="h-100">
            <h6 className="text-muted mb-3 fw-bold">Saldo Pendente</h6>
            <h2 className="fw-bold mb-0 cor-fundo-saldo" >
              {formatarMoeda(saldoTotal)}
            </h2>
          </Card>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEÇÃO 2: Tabela de Licitações com Saldo */}
      {/* ============================================================ */}
      <Card className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold m-0">Licitações com Saldo</h4>
          <button
            className="btn btn-sm text-white rounded-pill px-3"
            style={{ backgroundColor: 'var(--prolicit-verde)' }}
            onClick={exportarLicitacoesCSV}
          >
            <FaFileCsv className="me-1" /> Exportar CSV
          </button>
        </div>

        {/* Filtros de licitação */}
        <div className="row mb-6 mt-2 g-2">

          <div className="col-md-4">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Filtrar por licitação..."
              value={filtroLicitacao}
              onChange={(e) => setFiltroLicitacao(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Filtrar por órgão..."
              value={filtroOrgao}
              onChange={(e) => setFiltroOrgao(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="Ativa">Ativa</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="date"
              className="form-control form-control-sm"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-hover align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>Licitação</th>
                <th>Órgão</th>
                <th>Data</th>
                <th>Valor Estimado</th>
                <th>Executado</th>
                <th>Saldo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="7" className="text-muted py-4">Carregando...</td>
                </tr>
              ) : licitacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-muted py-4">Nenhuma licitação encontrada.</td>
                </tr>
              ) : (
                licitacoesFiltradas.map((lic) => (
                  <tr key={lic.id}>
                    <td className="fw-bold">{lic.numero_processo}</td>
                    <td>{lic.orgao_publico}</td>
                    <td>{lic.data_abertura ? new Date(lic.data_abertura).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>{formatarMoeda(lic.valor_estimado)}</td>
                    <td>{formatarMoeda(lic.valor_executado)}</td>
                    <td>
                      <strong style={{ color: parseFloat(lic.saldo || 0) > 0 ? '#ff6600' : 'var(--prolicit-verde)' }}>
                        {formatarMoeda(lic.saldo)}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${lic.status === 'Ativa' ? 'bg-success' : 'bg-secondary'
                        }`}>
                        {lic.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ============================================================ */}
      {/* Total dos serviços filtrados */}
      {licitacoesFiltradas.length > 0 ? (
        <div className="text-end mt-3">
          <strong>
            Total filtrado: {formatarMoeda(licitacoesFiltradas.reduce((s, lic) => s + parseFloat(lic.valor_estimado || 0), 0))}
          </strong>
        </div>
      ) : (
        <div className="text-end mt-3 text-muted">
          <strong>0 licitações encontradas</strong>
        </div>
      )}

      {/* Renderização do Toast Global */}
      {toast.visivel && (
        <Toast>
          {toast.mensagem}
        </Toast>
      )}
    </Layout>
  );
}
