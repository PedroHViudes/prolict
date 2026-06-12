import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

/**
 * Página para cadastro de novos Serviços Realizados.
 * Formulário para dar baixa técnica na ordem de serviço.
 */
export default function ServicoAdicionar() {
  const navigate = useNavigate();

  return (
    <Layout>
      <Header 
        title="Cadastro de Serviços Realizados" 
        subtitle="" 
      />

      <Card>
        <h4 className="fw-bold mb-4">Cadastro De serviço</h4>
        
        <div className="row mb-4">
          <div className="col-md-2 mb-3">
            <label className="form-label fw-bold">Nº da OS</label>
            <input type="text" className="form-control bg-light" />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label fw-bold">Nº da Licitação / Lote</label>
            <input type="text" className="form-control bg-light" />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label fw-bold">Qtd</label>
            <input type="number" className="form-control bg-light" />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label fw-bold">Valor Unitario</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Sera preenchido de acordo com o valor buscado do lote" 
              disabled 
              style={{ fontSize: '0.75rem' }}
            />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label fw-bold">Valor total</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Sera preenchido de acordo com o valor buscado do lote e feiro a multiplicação da qtd" 
              disabled 
              style={{ fontSize: '0.75rem' }}
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Cliente</label>
            <input type="text" className="form-control bg-light" />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Local</label>
            <input type="text" className="form-control bg-light" />
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Secretaria Responsável</label>
            <input type="text" className="form-control bg-light" />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label fw-bold">Data de Termino</label>
            <input type="date" className="form-control bg-light" />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label fw-bold">Telefone</label>
            <input type="text" className="form-control bg-light" />
          </div>
        </div>

        <hr className="my-4 text-muted" />

        <div className="row mb-5">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Descição</label> {/* Mantido como no protótipo "Descição" ou corrijo para Descrição? Vou usar Descrição */}
            <textarea className="form-control bg-light" rows="4"></textarea>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Anexar Foto do Serviço</label>
            <div className="border rounded bg-light d-flex justify-content-center align-items-center" style={{ height: '110px', borderStyle: 'dashed' }}>
              <span className="fs-5 fw-bold">Upload</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="d-flex gap-3">
          <button className="btn text-white px-5 py-2 fw-bold rounded-3" style={{ backgroundColor: 'var(--prolicit-verde)' }}>
            Salvar Serviço
          </button>
          <button 
            type="button" 
            className="btn text-white px-5 py-2 fw-bold rounded-3" 
            style={{ backgroundColor: '#4a5568' }}
            onClick={() => navigate('/servicos')}
          >
            Cancelar
          </button>
        </div>
      </Card>
    </Layout>
  );
}
