import React from 'react';

/**
 * 
 * @param {React.ReactNode} children O conteúdo a ser exibido dentro do card
 * @param {string} className Classes CSS adicionais
 */
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-3 shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
}
