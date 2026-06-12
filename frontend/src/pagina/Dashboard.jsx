import React from 'react';
import { FaSearch, FaArrowUp, FaInfoCircle, FaEllipsisV } from 'react-icons/fa';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

/**
 * Página de Dashboard.
 * Exibe um resumo geral das licitações e uma tabela com as mais recentes.
 */
export default function Dashboard() {
  return (
    <Layout>
      <Header 
        title="Seja bem-vindo, [Nome do Usuário]" 
        subtitle="Aqui está o resumo das suas Licitações" 
      />

      {/* Cards de Resumo */}
      <div className="row mb-4">
        {/* Card 1: Licitações Ativas */}
        <div className="col-md-4">
          <Card className="h-100">
            <h6 className="text-muted mb-3 fw-bold">Licitações Ativas</h6>
            <h2 className="fw-bold mb-3" style={{ color: 'var(--prolicit-azul)' }}>12</h2>
            <p className="mb-0 fw-bold" style={{ color: 'var(--prolicit-verde)' }}>
              <FaArrowUp /> 2 novas está semana
            </p>
          </Card>
        </div>

        {/* Card 2: Dias de Vigência */}
        <div className="col-md-4">
          <Card className="h-100">
            <h6 className="text-muted mb-3 fw-bold">Dias de Vigência</h6>
            <h2 className="fw-bold mb-3" style={{ color: 'var(--prolicit-azul)' }}>45</h2>
            <p className="mb-0 fw-bold text-warning">
              3 perto do vencimento
            </p>
          </Card>
        </div>

        {/* Card 3: Valor Total */}
        <div className="col-md-4">
          <Card className="h-100">
            <h6 className="text-muted mb-3 fw-bold">Valor Total</h6>
            <h2 className="fw-bold mb-3" style={{ color: 'var(--prolicit-azul)' }}>R$ 1.245.000</h2>
            <p className="mb-0 text-muted fw-bold">
              <FaInfoCircle /> R$ 450.000 a entrar
            </p>
          </Card>
        </div>
      </div>

      {/* Tabela de Últimas Licitações */}
      <Card>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">Últimas Licitações</h3>
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
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Local</th>
                <th scope="col">Serviço</th>
                <th scope="col">Licitação</th>
                <th scope="col">Data</th>
                <th scope="col">Itens</th>
                <th scope="col">Valor</th>
                <th scope="col">Status</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {/* Linha 1 */}
              <tr>
                <td>Prefeitura Municipal</td>
                <td>São Paulo, SP</td>
                <td>Obras de Infraestrutura</td>
                <td>#LIC0001</td>
                <td>11/12/2004</td>
                <td>2</td>
                <td>R$ 42.000,00</td>
                <td><span className="badge rounded-pill bg-prolicit-verde text-white px-3 py-2">Ativo</span></td>
                <td><button className="btn btn-sm text-muted"><FaEllipsisV/></button></td>
              </tr>
              {/* Linha 2 */}
              <tr>
                <td>Governo do Estado</td>
                <td>Rio de Janeiro, RJ</td>
                <td>Serviço de TI</td>
                <td>#LIC0002</td>
                <td>11/12/2004</td>
                <td>2</td>
                <td>R$ 42.000,00</td>
                <td><span className="badge rounded-pill bg-prolicit-verde text-white px-3 py-2">Ativo</span></td>
                <td><button className="btn btn-sm text-muted"><FaEllipsisV/></button></td>
              </tr>
              {/* Linha 3 */}
              <tr>
                <td>Universidade federal</td>
                <td>Jacarezinho, PR</td>
                <td>Manutenção de Ar Condicionado</td>
                <td>#LIC0003</td>
                <td>11/12/2004</td>
                <td>2</td>
                <td>R$ 42.000,00</td>
                <td><span className="badge rounded-pill bg-warning text-dark px-3 py-2">Pendente</span></td>
                <td><button className="btn btn-sm text-muted"><FaEllipsisV/></button></td>
              </tr>
              {/* Linha 4 */}
              <tr>
                <td>Hospital Municipal</td>
                <td>Curitiba, PR</td>
                <td>Aquisição de Produtos</td>
                <td>#LIC0004</td>
                <td>11/12/2004</td>
                <td>2</td>
                <td>R$ 42.000,00</td>
                <td><span className="badge rounded-pill bg-danger text-white px-3 py-2">Encerradas</span></td>
                <td><button className="btn btn-sm text-muted"><FaEllipsisV/></button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button className="btn text-white rounded-pill px-5 py-2 fw-bold" style={{ backgroundColor: 'var(--prolicit-azul)' }}>
            Visualizar mais Licitações
          </button>
        </div>
      </Card>
    </Layout>
  );
}
