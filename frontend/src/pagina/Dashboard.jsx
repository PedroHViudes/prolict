import React, { useState, useEffect } from 'react';
import '../estilos/Dashboard.css';
import { FaInfoCircle, FaMoneyBillWave, FaCheckCircle, FaClock } from 'react-icons/fa';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import api from '../services/api';
import { calcularPrazoRestante } from '../utils/dateUtils';


/**
 * Página de Dashboard.
 * Exibe resumo rápido: cards com totais, últimas licitações com progresso,
 * e últimos serviços registrados.
 */
export default function Dashboard() {
  const [licitacoes, setLicitacoes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState({ nome: 'Usuário' });
  const [resumo, setResumo] = useState({
    totalLicitacoes: 0,
    licitacoesAtivas: 0,
    valorTotal: 0,
    valorServicos: 0,
    saldoTotal: 0
  });


  useEffect(() => {
    const dadosUsuario = localStorage.getItem('usuario');
    if (dadosUsuario) {
      setUsuario(JSON.parse(dadosUsuario));
    }

    async function buscarDados() {
      try {
        const [respLicitacoes, respResumo, respServicos] = await Promise.all([
          api.get('/licitacoes/ativas'),
          api.get('/licitacoes/relatorio/resumo'),
          api.get('/servicos')
        ]);

        setLicitacoes(respLicitacoes.data);
        setServicos(respServicos.data);

        const dados = respResumo.data;
        let totalLicitacoes = dados.length;
        let licitacoesAtivas = 0;
        let valorTotal = 0;
        let valorExecutado = 0;
        let saldoTotal = 0;

        dados.forEach(lic => {
          valorTotal += parseFloat(lic.valor_estimado || 0);
          valorExecutado += parseFloat(lic.valor_executado || 0);
          saldoTotal += parseFloat(lic.saldo || 0);
          if (lic.status === 'Ativa') licitacoesAtivas++;
        });

        setResumo({
          totalLicitacoes,
          licitacoesAtivas,
          valorTotal,
          valorServicos: valorExecutado,
          saldoTotal
        });

      } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro);
      } finally {
        setCarregando(false);
      }
    }
    buscarDados();
  }, []);

  function formatarMoeda(valor) {
    return `R$ ${parseFloat(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

 

  return (
    <Layout>
      <Header
        title={`Seja bem-vindo, ${usuario.nome}`}
        subtitle="Resumo rápido das suas licitações"
      />

      {/* ============================================================ */}
      {/* CARDS DE RESUMO */}
      {/* ============================================================ */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-2 fw-bold">Licitações Ativas</h6>
                <h2 className="fw-bold mb-0 cor-fundo-licitacao">
                  {resumo.licitacoesAtivas}
                </h2>
              </div>
              <FaClock className="cor-fundo-licitacao" size={32} />
            </div>
            <p className="mb-0 mt-2 text-muted small">
              {resumo.totalLicitacoes} total cadastradas
            </p>
          </Card>
        </div>

        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-2 fw-bold">Valor Estimado</h6>
                <h2 className="fw-bold mb-0 cor-fundo-valor">
                  {formatarMoeda(resumo.valorTotal)}
                </h2>
              </div>
              <FaInfoCircle className="cor-fundo-valor" size={32} />
            </div>
            <p className="mb-0 mt-2 text-muted small">Total das licitações</p>
          </Card>
        </div>

        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-2 fw-bold">Executado</h6>
                <h2 className="fw-bold mb-0 cor-fundo-executado">
                  {formatarMoeda(resumo.valorServicos)}
                </h2>
              </div>
              <FaCheckCircle className="cor-fundo-executado" size={32} />
            </div>
            <p className="mb-0 mt-2 text-muted small">Serviços já realizados</p>
          </Card>
        </div>

        <div className="col-md-3">
          <Card className="h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-2 fw-bold">Saldo Pendente</h6>
                <h2 className="fw-bold mb-0 cor-fundo-saldo" >
                  {formatarMoeda(resumo.saldoTotal)}
                </h2>
              </div>
              <FaMoneyBillWave className="cor-fundo-saldo" size={32} />
            </div>
            <p className="mb-0 mt-2 text-muted small">Valor restante para entregar</p>
          </Card>
        </div>
      </div>

      <div className="row">
        {/* ============================================================ */}
        {/* ÚLTIMAS LICITAÇÕES COM BARRA DE PROGRESSO */}
        {/* ============================================================ */}
        <div className="col-lg-8">
          <Card className="h-100">
            <h4 className="fw-bold mb-4">Licitações Ativas</h4>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Licitação</th>
                    <th>Órgão</th>
                    <th>Progresso</th>
                    <th className="text-end">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr>
                      <td colSpan="4" className="text-muted py-4 text-center">Carregando...</td>
                    </tr>
                  ) : licitacoes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-muted py-4 text-center">
                        Nenhuma licitação ativa.
                      </td>
                    </tr>
                  ) : (
                    licitacoes.slice(0, 6).map((lic) => {
                      return (
                        <tr key={lic.id}>
                          <td className="fw-bold">{lic.numero_processo}</td>
                          <td>
                            <span className="text-muted">{lic.orgao_publico}</span>
                            {lic.data_vigencia && (
                              <>
                                <br />
                                <small className="text-muted"> {calcularPrazoRestante(lic.data_vigencia)}</small>
                              </>
                            )}
                          </td>
                          <td style={{ minWidth: '180px' }}>
                            <small className="text-muted">
                              {formatarMoeda(lic.valor_executado)} / {formatarMoeda(lic.valor_estimado)}
                            </small>
                          </td>
                          <td className="text-end">
                            <strong style={{ color: parseFloat(lic.saldo || 0) > 0 ? '#33cc99' : 'var(--prolicit-verde)' }}>
                              {formatarMoeda(lic.saldo)}
                            </strong>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ============================================================ */}
        {/* ÚLTIMOS SERVIÇOS */}
        {/* ============================================================ */}
        <div className="col-lg-4">
          <Card className="h-100">
            <h4 className="fw-bold mb-4">Últimos Serviços</h4>

            {carregando ? (
              <p className="text-muted text-center py-3">Carregando...</p>
            ) : servicos.length === 0 ? (
              <p className="text-muted text-center py-3">Nenhum serviço registrado.</p>
            ) : (
              <div className="list-group list-group-flush ">
                {servicos.slice(0, 5).map((e) => (
                  <div key={e.id} className="list-group-item border-0 px-0 bg-transparent">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1 fw-bold text-muted">{e.nome_servico}</h6>
                        <small className="text-muted">{e.orgao_publico || '-'}</small>
                        {e.data_execucao && (
                          <>
                            <br />
                            <small className="text-muted">
                              {new Date(e.data_execucao).toLocaleDateString('pt-BR')}
                            </small>
                          </>
                        )}
                      </div>
                      <span className="fw-bold" style={{ color: 'var(--prolicit-verde)' }}>
                        {formatarMoeda(e.valor_fixo)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
