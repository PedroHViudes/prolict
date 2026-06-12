import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

/**
 * Página para adicionar nova Licitação Ganha.
 * Contém o formulário com dados gerais e a tabela para adicionar itens.
 */
export default function LicitacaoAdicionar() {
  const navigate = useNavigate();

  return (
    <Layout>
      <Header 
        title="Adicionar Nova Licitação Ganha" 
        subtitle="Preencha os dados do novo contrato e seus itens" 
      />

      <Card>
        {/* Seção: Dados Gerais */}
        <h4 className="fw-bold mb-4">Dados Gerais</h4>
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Clientes</label>
            <input type="text" className="form-control bg-light" />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Nº da Licitação</label>
            <input type="text" className="form-control bg-light" />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Local</label>
            <input type="text" className="form-control bg-light" />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label fw-bold">Data de Início</label>
            <input type="date" className="form-control bg-light" />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label fw-bold">Data de termino</label>
            <input type="date" className="form-control bg-light" />
          </div>
        </div>

        <hr className="my-4 text-muted" />

        {/* Seção: Itens da Licitação */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold m-0">Itens da Licitação</h4>
          <button className="btn text-white rounded-pill px-4 fw-bold" style={{ backgroundColor: 'var(--prolicit-azul)' }}>
            <FaPlus className="me-2" /> Adicionar
          </button>
        </div>

        <div className="table-responsive mb-4">
          <table className="table align-middle text-center">
            <thead className="table-light">
              <tr>
                <th scope="col" className="text-start">Descrição do Item</th>
                <th scope="col">Qtde.</th>
                <th scope="col">Valor Unit.(R$)</th>
                <th scope="col">Valor Total</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="text-muted py-4">
                  Nenhum item adicionado. Clique em "Adicionar"
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Seção: Observações e Upload */}
        <div className="row mb-5">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Observações</label>
            <textarea className="form-control bg-light" rows="4"></textarea>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Anexar licitação PDF</label>
            <div className="border rounded bg-light d-flex justify-content-center align-items-center" style={{ height: '110px', borderStyle: 'dashed' }}>
              <span className="fs-5 fw-bold">Upload</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="d-flex gap-3">
          <button className="btn text-white px-5 py-2 fw-bold rounded-3" style={{ backgroundColor: 'var(--prolicit-verde)' }}>
            Salvar Licitação
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
    </Layout>
  );
}
