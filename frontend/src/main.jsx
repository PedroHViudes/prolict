import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

/**
 * Ponto de entrada da aplicação React.
 * Antes de renderizar o App, verifica se existe preferência de tema
 * e tamanho de fonte salva no localStorage e aplica no <html>.
 */
function aplicarPreferencias() {
  const tema = localStorage.getItem('prolicit_tema');
  const fonte = localStorage.getItem('prolicit_fonte');

  // Aplica tema escuro se salvo
  if (tema === 'escuro') {
    document.documentElement.classList.add('tema-escuro');
  }

  // Aplica tamanho de fonte se salvo
  if (fonte) {
    document.documentElement.classList.add(`font-${fonte}`);
  }
}

// Executa antes de renderizar os componentes
aplicarPreferencias();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
