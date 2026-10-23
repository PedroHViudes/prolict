import React from 'react';

/**
 * Componente Header reutilizável.
 * Exibe o título da página atual e subtítulo.
 * 
 * @param {string} title O título principal da página
 * @param {string} subtitle O texto descritivo abaixo do título
 */
export default function Header({ title, subtitle }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        <p className="text-muted mb-0">{subtitle}</p>
      </div>
    </div>
  );
}
