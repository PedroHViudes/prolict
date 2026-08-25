import React from 'react';

export default function ConfirmModal({ 
  isOpen, 
  title = "Confirmar ação", 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "danger"
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (fundo escuro) */}
      <div 
        className="modal-backdrop fade show" 
        style={{ zIndex: 1050 }}
        onClick={onCancel}
      />

      {/* Modal Box */}
      <div 
        className="modal fade show d-block" 
        tabIndex="-1" 
        role="dialog"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold text-danger">{title}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onCancel}
                aria-label="Close"
              />
            </div>
            <div className="modal-body text-muted small py-3">
              {message}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button 
                type="button" 
                className="btn btn-light rounded-pill px-4" 
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button 
                type="button" 
                className={`btn btn-${confirmVariant} rounded-pill px-4 fw-bold`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}