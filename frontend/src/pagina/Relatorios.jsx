import React from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

/**
 * Página de Relatórios.
 * Exibe dados de forma facilitada usando filtros por data, cliente e valor.
 */
export default function Relatorios() {
  return (
    <Layout>
      <Header 
        title="Relatórios" 
        subtitle="Visualize os seu dados com mais facilidade" 
      />

      <Card className="mb-4">
        <h4 className="fw-bold mb-4">Relatório de serviços</h4>

        <div className="row mb-4 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>Filtrar por data</label>
            <input type="date" className="form-control" />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>Filtrar por cliente</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>Filtrar Por Valor</label>
            <input type="number" className="form-control" />
          </div>
          
          <div className="col-md-3 d-flex align-items-center">
            {/* Divisor Visual */}
            <div className="vr me-3 d-none d-md-block" style={{ height: '40px' }}></div>
            
            <div className="flex-grow-1">
              <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>Valor total</label>
              <input 
                type="text" 
                className="form-control fw-bold bg-light" 
                value="R$ 122.000,00" 
                readOnly 
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle text-center mt-3">
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

      <button className="btn text-white rounded-3 px-4 py-2 fw-bold" style={{ backgroundColor: 'var(--prolicit-verde)' }}>
        Exportar dados
      </button>
    </Layout>
  );
}
