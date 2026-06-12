import React from 'react';
import './ccs/layout.css';
import Sidebar from './Sidebar';

/**
 * Componente Layout reutilizável.
 * Envolve as páginas internas com o Sidebar na esquerda e a área de conteúdo na direita.
 * 
 * @param {React.ReactNode} children O conteúdo da página a ser renderizado
 */
export default function Layout({ children }) {
  return (
    <div className="d-flex menu-lateral">
      {/* Menu Lateral */}
      <Sidebar />
      
      {/* Área de Conteúdo Principal */}
      <div className="flex-grow-1 p-5 overflow-auto conteudo-principal">
        {children}
      </div>
    </div>
  );
}
