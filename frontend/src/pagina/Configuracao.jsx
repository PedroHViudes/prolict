import React from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';

/**
 * Página de Configurações do Sistema.
 * Opções para ajustar tema (Claro/Escuro) e tamanho do texto.
 */
export default function Configuracao() {
  return (
    <Layout>
      <Header 
        title="Configurações" 
        subtitle="Configure para a melhor usabilidade do sistema" 
      />

      {/* Card: Configuração de Tema */}
      <Card className="mb-4">
        <h5 className="fw-bold mb-1">Configuração de Tema</h5>
        <p className="text-muted small mb-4">Modifique o Tema do sistema</p>
        
        <p className="fw-bold small mb-2">Tema</p>
        
        <div className="form-check mb-2">
          <input className="form-check-input" type="radio" name="temaRadios" id="temaClaro" defaultChecked />
          <label className="form-check-label text-muted small" htmlFor="temaClaro">
            Claro
          </label>
        </div>
        
        <div className="form-check mb-4">
          <input className="form-check-input" type="radio" name="temaRadios" id="temaEscuro" />
          <label className="form-check-label text-muted small" htmlFor="temaEscuro">
            Escuro
          </label>
        </div>

        <button className="btn text-white rounded-pill px-4 py-1 fw-bold" style={{ backgroundColor: 'var(--prolicit-verde)' }}>
          Salvar
        </button>
      </Card>

      {/* Card: Configuração de Texto */}
      <Card>
        <h5 className="fw-bold mb-1">Configuração de Texto</h5>
        <p className="text-muted small mb-4">Modifique o tamanho do texto</p>
        
        <p className="fw-bold small mb-2">Tamanhos</p>
        
        <div className="form-check mb-2">
          <input className="form-check-input" type="radio" name="textoRadios" id="textoPequeno" defaultChecked />
          <label className="form-check-label text-muted small" htmlFor="textoPequeno">
            Pequeno
          </label>
        </div>
        
        <div className="form-check mb-2">
          <input className="form-check-input" type="radio" name="textoRadios" id="textoMedio" />
          <label className="form-check-label text-muted small" htmlFor="textoMedio">
            Medio
          </label>
        </div>

        <div className="form-check mb-4">
          <input className="form-check-input" type="radio" name="textoRadios" id="textoGrande" />
          <label className="form-check-label text-muted small" htmlFor="textoGrande">
            Grande
          </label>
        </div>

        <button className="btn text-white rounded-pill px-4 py-1 fw-bold" style={{ backgroundColor: 'var(--prolicit-verde)' }}>
          Salvar
        </button>
      </Card>
      
    </Layout>
  );
}
