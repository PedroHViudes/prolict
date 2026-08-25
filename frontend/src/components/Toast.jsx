import React from 'react';
import { IoMdNotifications } from "react-icons/io";


/**
 * Componente Toast reutilizável.
 * Cria um toast com estilo visual consistente com os protótipos.
 * 
 * @param {React.ReactNode} children 
 * @param {string} className Classes CSS adicionais
 */
export default function Toast({ children, className = '' }) {
  return (
<div aria-live="polite" aria-atomic="true" className="position-relative w-100">

<div className={`toast-container position-fixed bottom-0 end-0 p-3 ${className}`}
style={{ zIndex: 9999 }}>

  <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
    <div className="toast-header">
      <IoMdNotifications className="me-auto fw-bold fs-4" />
      <strong className="me-auto fw-bold">Prolicit Informa</strong>
      <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div className="toast-body">
      {children}
    </div>
  </div>
</div>
</div>
  );
}
