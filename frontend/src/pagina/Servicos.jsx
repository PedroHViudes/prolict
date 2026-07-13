import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import api from '../services/api';

/**
 * Página de Serviços Realizados.
 * Lista todos os serviços prestados com informações de quem recebeu.
 * Conectado ao backend para realizar o CRUD completo.
 */
export default function Servicos() {
  const navigate = useNavigate();
  const [servicos, setServicos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  /**
   * Busca todos os serviços e entregas no backend quando a página é carregada.
   */
  useEffect(() => {
    async function carregarDados() {
      try {
        const [respServicos, respEntregas] = await Promise.all([
          api.get('/servicos'),
          api.get('/entregas')
        ]);
        setServicos(respServicos.data);
        setEntregas(respEntregas.data);
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  /**
   * Busca a entrega vinculada a um serviço.
   * @param {number} servicoId - ID do serviço
   * @returns {Object|null} Dados da entrega ou null
   */
  function buscarEntrega(servicoId) {
    return entregas.find(e => e.servico_id === servicoId) || null;
  }

  /**
   * Exclui um serviço após confirmação do usuário.
   * @param {number} id - ID do serviço a ser excluído
   */
  async function excluirServico(id) {
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) {
      return;
    }

    try {
      await api.delete(`/servicos/${id}`);
      setServicos(servicos.filter(serv => serv.id !== id));
      setEntregas(entregas.filter(e => e.servico_id !== id));
      alert("Serviço excluído com sucesso!");
    } catch (erro) {
      console.error("Erro ao excluir serviço:", erro);
      alert("Erro ao excluir serviço.");
    }
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <Header 
          title="Serviços Realizados" 
          subtitle="Gerencie todos os serviços prestados" 
        />
        <button 
          onClick={() => navigate('/servicos/novo')}
          className="btn text-white rounded-pill px-4 py-2 fw-bold d-flex align-items-center mt-2 shadow-sm"
          style={{ backgroundColor: 'var(--prolicit-verde)' }}
        >
          <FaPlus className="me-2" /> Adicionar Serviço
        </button>
      </div>

      <Card>
        <h4 className="fw-bold mb-4">Serviços realizados</h4>

        <div className="table-responsive">
          <table className="table align-middle text-center">
            <thead className="table-light">
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Serviço</th>
                <th scope="col">Licitação</th>
                <th scope="col">Órgão</th>
                <th scope="col">Item</th>
                <th scope="col">Valor</th>
                <th scope="col">Quem Recebeu</th>
                <th scope="col">Responsável</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="9" className="text-muted py-5">
                    Carregando dados...
                  </td>
                </tr>
              ) : servicos.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-muted py-5">
                    Nenhum serviço realizado. Comece adicionando um!
                  </td>
                </tr>
              ) : (
                servicos.map((serv) => {
                  const entrega = buscarEntrega(serv.id);
                  return (
                    <tr key={serv.id}>
                      <td>{serv.data_execucao ? new Date(serv.data_execucao).toLocaleDateString('pt-BR') : '-'}</td>
                      <td className="fw-bold">{serv.nome_servico}</td>
                      <td>{serv.numero_processo || '-'}</td>
                      <td>{serv.orgao_publico || '-'}</td>
                      <td>{serv.item_descricao || '-'}</td>
                      <td className="text-end">
                        R$ {parseFloat(serv.valor_fixo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{entrega?.quem_recebeu || '-'}</td>
                      <td>{entrega?.responsavel_entrega || '-'}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-1" 
                          title="Editar"
                          onClick={() => navigate(`/servicos/editar/${serv.id}`)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          title="Excluir"
                          onClick={() => excluirServico(serv.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
}
