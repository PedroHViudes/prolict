import React from 'react';
import '../../estilos/ModalConfirmacao.css';

/**
 * Componente Modal de Confirmação reutilizável.
 * Exibe uma janela modal centralizada para confirmação de ações destrutivas (ex: exclusão de conta ou registro).
 * 
 * @param {boolean} isOpen - Define se a janela modal está visível
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem explicativa para o usuário
 * @param {Function} onConfirm - Callback acionado ao clicar no botão de confirmação
 * @param {Function} onCancel - Callback acionado ao cancelar ou fechar
 * @param {string} confirmText - Rótulo do botão de confirmação
 * @param {string} cancelText - Rótulo do botão de cancelamento
 * @param {string} confirmVariant - Variante de cor Bootstrap do botão (ex: 'danger', 'primary')
 */
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
        className="modal-backdrop fade show z-index-modal" 
        onClick={onCancel}
      />

      {/* Modal Box */}
      <div 
        className="modal fade show d-block z-index-modal-backdrop" 
        tabIndex="-1" 
        role="dialog"
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