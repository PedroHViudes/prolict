import React, { useRef } from 'react';
import '../../estilos/PdfIAUpload.css';

/**
 * Componente de Upload de Edital em PDF com IA.
 * Permite selecionar um arquivo PDF e envia para o backend extrair dados e lotes via Gemini.
 * 
 * @param {boolean} processandoPdf - Indica se o PDF está sendo processado no momento
 * @param {Function} onPdfUpload - Callback acionado ao selecionar o arquivo PDF
 */
export default function PdfIAUpload({ processandoPdf, onPdfUpload }) {
  const fileInputRef = useRef(null);

  function handleChange(e) {
    onPdfUpload(e);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleButtonClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  return (
    <>
      {processandoPdf && (
        <div className="pdf-ia-overlay d-flex flex-column justify-content-center align-items-center">
          <div className="spinner-border text-light mb-3 pdf-ia-spinner" role="status">
            <span className="visually-hidden">Analisando PDF...</span>
          </div>
          <h3 className="text-white fw-bold">Analisando o Edital com IA...</h3>
          <p className="text-white-50 fs-5 mt-2">Por favor, aguarde. Isso pode levar alguns segundos.</p>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded pdf-ia-card-header">
        <div>
          <h5 className="fw-bold m-0 text-prolicit-azul">Preenchimento Automático com IA</h5>
          <p className="text-muted m-0 small">Faça upload do edital em PDF e a Inteligência Artificial preencherá os dados e lotes para você.</p>
        </div>
        <div>
          <input 
            type="file" 
            accept="application/pdf" 
            className="d-none" 
            ref={fileInputRef} 
            onChange={handleChange} 
          />
          <button
            type="button"
            className="btn rounded-pill px-4 fw-bold bg-prolicit-azul text-white"
            onClick={handleButtonClick}
            disabled={processandoPdf}
          >
            {processandoPdf ? "Lendo PDF..." : "Importar PDF do Edital"}
          </button>
        </div>
      </div>
    </>
  );
}

