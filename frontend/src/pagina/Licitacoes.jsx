import React from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

/**
 * Página Minhas Licitações.
 * Exibe a lista completa de licitações com opção de adicionar novas.
 */
export default function Licitacoes() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <Header 
          title="Minhas Licitações" 
          subtitle="Gerencie todas os suas Licitações" 
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
          <div className="input-group" style={{ width: '300px' }}>
            <span className="input-group-text bg-light border-end-0 rounded-start-pill">
              <FaSearch className="text-muted" />
            </span>
            <input 
              type="text" 
              className="form-control bg-light border-start-0 rounded-end-pill" 
              placeholder="Pesquisar Licitação..."
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle text-center">
            <thead className="table-light">
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Nº da Licitação</th>
                <th scope="col">Valor</th>
                <th scope="col">Licitação</th>
                <th scope="col">Data de Inicio</th>
                <th scope="col">Status</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {/* Estado vazio para ilustrar o protótipo */}
              <tr>
                <td colSpan="7" className="text-muted py-5">
                  Nenhuma licitação encontrada. Começa adicionando uma !
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
}
