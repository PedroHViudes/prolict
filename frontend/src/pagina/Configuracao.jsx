import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import Toast from '../components/Toast';

/**
 * Página de Configurações do Sistema.
 * Permite alterar o tema (Claro/Escuro) e o tamanho da fonte (Pequeno/Médio/Grande).
 * As preferências são salvas no localStorage e aplicadas imediatamente.
 */
export default function Configuracao() {
  // Estado do tema selecionado (true = escuro, false = claro)
  const [temaEscuro, setTemaEscuro] = useState(false);
  // Estado do tamanho da fonte ('pequena', 'media', 'grande')
  const [tamanhoFonte, setTamanhoFonte] = useState('media');

  //Estado de mostrar o toast ou não
const [toast, setToast] = useState({ visivel: false, mensagem: '' });
 
function exibirToast(mensagem) {
  setToast({ visivel: true, mensagem });
  setTimeout(() => setToast({ visivel: false, mensagem: '' }), 3500);
}

  /**
   * Carrega as preferências salvas no localStorage ao montar o componente.
   * Aplica as classes CSS correspondentes no elemento <html>.
   */
  useEffect(() => {
    const temaSalvo = localStorage.getItem('prolicit_tema');
    const fonteSalva = localStorage.getItem('prolicit_fonte');

    if (temaSalvo === 'escuro') {
      setTemaEscuro(true);
      document.documentElement.classList.add('tema-escuro');
    }

    if (fonteSalva) {
      setTamanhoFonte(fonteSalva);
      document.documentElement.classList.add(`font-${fonteSalva}`);
    }
  }, []);

  /**
   * Aplica o tema selecionado (Claro ou Escuro).
   * Adiciona ou remove a classe .tema-escuro no <html>.
   */
  function aplicarTema() {
    if (temaEscuro) {
      document.documentElement.classList.add('tema-escuro');
      localStorage.setItem('prolicit_tema', 'escuro');
    } else {
      document.documentElement.classList.remove('tema-escuro');
      localStorage.setItem('prolicit_tema', 'claro');
    } exibirToast("Tema aplicado com sucesso!");
  }

  /**
   * Aplica o tamanho de fonte selecionado.
   * Remove todas as classes de fonte anteriores e adiciona a nova.
   */
  function aplicarFonte() {
    // Remove todas as classes de tamanho de fonte
    document.documentElement.classList.remove('font-pequena', 'font-media', 'font-grande');
    // Adiciona a classe correspondente ao tamanho selecionado
    document.documentElement.classList.add(`font-${tamanhoFonte}`);
    localStorage.setItem('prolicit_fonte', tamanhoFonte);
    exibirToast("Tamanho da fonte aplicado com sucesso!");
  }

  return (
    <Layout>
      <Header 
        title="Configurações" 
        subtitle="Configure para a melhor usabilidade do sistema" 
      />

      {/* Card: Configuração de Tema */}
      <Card className="mb-4">
        <h5 className="fw-bold mb-1">Configuração de Tema</h5>
        <p className="text-muted small mb-4">Modifique o visual do sistema entre claro e escuro</p>
        
        <p className="fw-bold small mb-2">Tema</p>
        
        <div className="form-check mb-2">
          <input 
            className="form-check-input" 
            type="radio" 
            name="temaRadios" 
            id="temaClaro" 
            checked={!temaEscuro}
            onChange={() => setTemaEscuro(false)}
          />
          <label className="form-check-label" htmlFor="temaClaro">
            Claro (Padrão)
          </label>
        </div>
        

        <div className="form-check mb-4">
          <input 
            className="form-check-input" 
            type="radio" 
            name="temaRadios" 
            id="temaEscuro" 
            checked={temaEscuro}
            onChange={() => setTemaEscuro(true)}
          />
          <label className="form-check-label" htmlFor="temaEscuro">
            Escuro
          </label>
        </div>

        <button 
          className="btn text-white rounded-pill px-4 py-1 fw-bold" 
          style={{ backgroundColor: 'var(--prolicit-verde)' }}
          onClick={aplicarTema}
        >
          Aplicar Tema
        </button>
        
      </Card>

      {/* Card: Configuração de Texto */}
      <Card>
        <h5 className="fw-bold mb-1">Configuração de Texto</h5>
        <p className="text-muted small mb-4">Modifique o tamanho do texto do sistema</p>
        
        <p className="fw-bold small mb-2">Tamanhos</p>
        
        <div className="form-check mb-2">
          <input 
            className="form-check-input" 
            type="radio" 
            name="textoRadios" 
            id="textoPequeno" 
            checked={tamanhoFonte === 'pequena'}
            onChange={() => setTamanhoFonte('pequena')}
          />
          <label className="form-check-label" htmlFor="textoPequeno">
            Pequeno (13px)
          </label>
        </div>
        
        <div className="form-check mb-2">
          <input 
            className="form-check-input" 
            type="radio" 
            name="textoRadios" 
            id="textoMedio" 
            checked={tamanhoFonte === 'media'}
            onChange={() => setTamanhoFonte('media')}
          />
          <label className="form-check-label" htmlFor="textoMedio">
            Médio (15px) - Padrão
          </label>
        </div>

        <div className="form-check mb-4">
          <input 
            className="form-check-input" 
            type="radio" 
            name="textoRadios" 
            id="textoGrande" 
            checked={tamanhoFonte === 'grande'}
            onChange={() => setTamanhoFonte('grande')}
          />
          <label className="form-check-label" htmlFor="textoGrande">
            Grande (20px)
          </label>
        </div>

        <button 
          className="btn text-white rounded-pill px-4 py-1 fw-bold" 
          style={{ backgroundColor: 'var(--prolicit-verde)' }}
          onClick={aplicarFonte}
        >
          Aplicar Tamanho
        </button>

      </Card>
      
      {/* Renderização única do Toast para qualquer tipo de mensagem */}
      {toast.visivel && (
        <Toast>
          {toast.mensagem}
        </Toast>
      )}
    </Layout>
  );
}
