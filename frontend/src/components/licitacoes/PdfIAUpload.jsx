import React, { useRef } from 'react';

export default function PdfIAUpload({ processandoPdf, onPdfUpload }) {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    onPdfUpload(e);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {processandoPdf && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 9999 }}
        >
          <div className="spinner-border text-light mb-3" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Analisando PDF...</span>
          </div>
          <h3 className="text-white fw-bold">Analisando o Edital com IA...</h3>
          <p className="text-white-50 fs-5 mt-2">Por favor, aguarde. Isso pode levar alguns segundos.</p>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded border border-primary">
        <div>
          <h5 className="fw-bold m-0 text-primary">Preenchimento Automático com IA</h5>
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
            className="btn btn-primary rounded-pill px-4 fw-bold"
            onClick={() => fileInputRef.current?.click()}
            disabled={processandoPdf}
          >
            {processandoPdf ? "Lendo PDF..." : "Importar PDF do Edital"}
          </button>
        </div>
      </div>
    </>
  );
}
