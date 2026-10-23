import { formatarData } from './dateUtils';

/**
 * Gera e baixa um arquivo CSV pronto para abrir no Excel em português:
 * - separador ";" (o Excel brasileiro usa a vírgula como decimal);
 * - BOM UTF-8 no início, para os acentos aparecerem certos;
 * - campos entre aspas, para vírgulas, ponto e vírgula e quebras de linha no texto não "quebrarem" as colunas.
 *
 * @param {string} nomeArquivo - Nome do arquivo baixado
 * @param {string[]} cabecalho - Títulos das colunas
 * @param {Array<Array<any>>} linhas - Valores de cada linha
 */
export function baixarCSV(nomeArquivo, cabecalho, linhas) {
  const celula = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const conteudo = [cabecalho, ...linhas].map(l => l.map(celula).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(link.href);
}

/** Número no formato brasileiro (1500.5 → "1500,50"), para o Excel reconhecer como número. */
export const numeroCSV = (v) => (parseFloat(v || 0)).toFixed(2).replace('.', ',');

/** Data no formato dd/mm/aaaa (ou "-"). */
export const dataCSV = (v) => formatarData(v);
