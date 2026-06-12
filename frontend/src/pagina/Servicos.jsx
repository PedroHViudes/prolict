import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

/**
 * Página de Serviços Realizados.
 * Lista todos os serviços prestados em uma tabela com a opção de registrar novos.
 */
export default function Servicos() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <Header 
          title="Serviços Realizados" 
          subtitle="Gerencie todas os serviços prestados" 
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
                <th scope="col">Nº da OS</th>
                <th scope="col">Nº da Licitação/Lote</th>
                <th scope="col">Qtd</th>
                <th scope="col">Valor</th>
                <th scope="col">Cliente</th>
                <th scope="col">Data de Termino</th>
                <th scope="col">Descrição</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {/* Estado vazio para ilustrar o protótipo */}
              <tr>
                <td colSpan="8" className="text-muted py-5">
                  Nenhum serviço realizado Começa adicionando uma !
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
}
