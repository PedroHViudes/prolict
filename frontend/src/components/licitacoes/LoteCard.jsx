import React from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import '../../estilos/LoteCard.css';

/**
 * Componente Card de Lote e seus Itens.
 * Renderiza os campos de um lote específico e a tabela dinâmica de seus itens correspondentes.
 * 
 * @param {Object} lote - Dados do lote (numero_lote, valor_total_arrematado, descricao, itens)
 * @param {number} loteIndice - Índice do lote na lista da licitação
 * @param {Array} errosLotes - Lista de índices de lotes com erros de validação
 * @param {Function} onAtualizarLote - Callback para atualizar campos do lote
 * @param {Function} onRemoverLote - Callback para excluir o lote
 * @param {Function} onAdicionarItem - Callback para inserir novo item no lote
 * @param {Function} onAtualizarItem - Callback para atualizar valores do item
 * @param {Function} onRemoverItem - Callback para remover item do lote
 */
export default function LoteCard({ 
  lote, 
  loteIndice, 
  errosLotes, 
  onAtualizarLote, 
  onRemoverLote, 
  onAdicionarItem, 
  onAtualizarItem, 
  onRemoverItem 
}) {
  return (
    <div className="border rounded p-3 mb-4 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0">Lote {loteIndice + 1}</h5>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onRemoverLote(loteIndice)}
        >
          <FaTrash /> Remover Lote
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label fw-bold small">Nº do Lote</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={lote.numero_lote}
            onChange={(e) => onAtualizarLote(loteIndice, 'numero_lote', e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-bold small">Valor Arrematado (R$)</label>
          <input
            type="number"
            className={`form-control form-control-sm ${errosLotes.includes(loteIndice) ? 'is-invalid border-danger border-2' : ''}`}
            value={lote.valor_total_arrematado}
            onChange={(e) => onAtualizarLote(loteIndice, 'valor_total_arrematado', e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-bold small">Descrição</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={lote.descricao}
            onChange={(e) => onAtualizarLote(loteIndice, 'descricao', e.target.value)}
          />
        </div>
      </div>

      {/* Itens do Lote */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-bold small">Itens do Lote</span>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => onAdicionarItem(loteIndice)}
        >
          <FaPlus /> Adicionar Item
        </button>
      </div>

      <table className="table table-sm align-middle text-center mb-0 p-4">
        <thead className="table-light">
          <tr>
            <th className="text-start">Descrição do Item</th>
            <th>Quantidade.</th>
            <th>Valor Unit. (R$)</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {lote.itens.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-muted py-3">
                Nenhum item neste lote.
              </td>
            </tr>
          ) : (
            lote.itens.map((item, itemIndice) => (
              <tr key={itemIndice}>
                <td className="text-start">
                  <input
                    type="text"
                    className="form-control form-control-sm w-100 m-0"
                    value={item.descricao}
                    onChange={(e) => onAtualizarItem(loteIndice, itemIndice, 'descricao', e.target.value)}
                    placeholder="Descrição do item"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm lote-input-quantidade"
                    value={item.quantidade_ganha}
                    onChange={(e) => onAtualizarItem(loteIndice, itemIndice, 'quantidade_ganha', e.target.value)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="number"
                    className="form-control form-control-sm lote-input-quantidade"
                    value={item.valor_unitario}
                    onChange={(e) => onAtualizarItem(loteIndice, itemIndice, 'valor_unitario', e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onRemoverItem(loteIndice, itemIndice)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
