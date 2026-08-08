import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import api from '../services/api';


/**
 * Página Minhas Licitações.
 * Exibe a lista completa de licitações com opção de adicionar, editar e excluir.
 * Conectado ao backend para realizar o CRUD completo.
 */
export default function Licitacoes() {
  const navigate = useNavigate();
  const [licitacoes, setLicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  /**
   * Busca todas as licitações no backend quando a página é carregada.
   */
  useEffect(() => {
    buscarLicitacoes();
  }, []);

  /**
   * Requisição GET para buscar todas as licitações da API.
   */
  async function buscarLicitacoes() {
    try {
      const resposta = await api.get('/licitacoes');
      setLicitacoes(resposta.data);
    } catch (erro) {
      console.error("Erro ao carregar licitações:", erro);
    } finally {
      setCarregando(false);
    }
  }

  /**
   * Exclui uma licitação após confirmação do usuário.
   * @param {number} id - ID da licitação a ser excluída
   */
  async function excluirLicitacao(id) {
    if (!window.confirm("Tem certeza que deseja excluir esta licitação? Todos os lotes, itens e documentos vinculados também serão excluídos.")) {
      return;
    }

    try {
      await api.delete(`/licitacoes/${id}`);
      // Remove a licitação da lista atualizada após exclusão bem-sucedida
      setLicitacoes(licitacoes.filter(lic => lic.id !== id));
      alert("Licitação excluída com sucesso!");
    } catch (erro) {
      console.error("Erro ao excluir licitação:", erro);
      alert("Erro ao excluir licitação.");
    }
  }
// Calculo de prazo restante para vigência da licitação

  function calcularPrazoRestante(dataVigencia) {
    if (!dataVigencia) {
      return 'Sem vigência';
    }

    const hoje = new Date();
    const vigencia = new Date(dataVigencia);
    hoje.setHours(0, 0, 0, 0);
    vigencia.setHours(0, 0, 0, 0);

    const diasRestantes = Math.ceil((vigencia - hoje) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return 'Prazo vencido';
    }
    if (diasRestantes === 0) {
      return 'Vence hoje';
    }

    return `${diasRestantes} dia${diasRestantes === 1 ? '' : 's'}`;
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <Header 
          title="Minhas Licitações" 
          subtitle="Gerencie todas as suas Licitações" 
        />
        <button 
          onClick={() => navigate('/licitacoes/nova')}
          className="btn text-white rounded-pill px-4 py-2 fw-bold d-flex align-items-center mt-2 shadow-sm"
          style={{ backgroundColor: 'var(--prolicit-verde)' }}
        >
          <FaPlus className="me-2" /> Adicionar Licitações
        </button>
      </div>

      <Card>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold m-0">Listagem</h4>
        </div>

        <div className="table-responsive">
          <table className="table align-middle text-center">
            <thead className="table-light">
              <tr>
                <th scope="col">Cliente/Órgão</th>
                <th scope="col">Nº Processo</th>
                <th scope="col">Valor Estimado</th>
                <th scope="col">Data Abertura</th>
                <th scope="col">Vigência</th>
                <th scope="col">Status</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="7" className="text-muted py-5">
                    Carregando dados...
                  </td>
                </tr>
              ) : licitacoes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-muted py-5">
                    Nenhuma licitação encontrada. Comece adicionando uma!
                  </td>
                </tr>
              ) : (
                licitacoes.map((lic) => (
                  <tr key={lic.id}>
                    <td>{lic.orgao_publico}</td>
                    <td>{lic.numero_processo}</td>
                    <td>R$ {parseFloat(lic.valor_estimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>{new Date(lic.data_abertura).toLocaleDateString('pt-BR')}</td>
                    <td>{calcularPrazoRestante(lic.data_vigencia)}</td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${lic.status === 'Ativa' ? 'bg-success' : 'bg-secondary'}`}>
                        {lic.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-1" 
                        title="Editar"
                        onClick={() => navigate(`/licitacoes/editar/${lic.id}`)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        title="Excluir"
                        onClick={() => excluirLicitacao(lic.id)}
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
      </Card>
    </Layout>
  );
}
