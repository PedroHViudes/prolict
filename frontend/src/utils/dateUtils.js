/**
 * Converte a data vinda da API ("2026-03-10" ou "2026-03-10T03:00:00.000Z") em uma data local,
 * usando só a parte AAAA-MM-DD. Assim o dia não "volta" um dia quando o servidor está em outro fuso.
 *
 * @param {string|Date} valor - Data vinda da API
 * @returns {Date|null}
 */
export function paraDataLocal(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  const m = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return new Date(valor);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/**
 * Formata a data da API no padrão brasileiro (dd/mm/aaaa).
 *
 * @param {string|Date} valor - Data vinda da API
 * @param {string} vazio - Texto exibido quando não há data
 * @returns {string}
 */
export function formatarData(valor, vazio = '-') {
  const d = paraDataLocal(valor);
  return d && !isNaN(d) ? d.toLocaleDateString('pt-BR') : vazio;
}

/**
 * Utilitário para cálculo de vigência de licitações.
 * Recebe a data de expiração e calcula a diferença em dias em relação à data atual.
 * 
 * @param {string|Date} dataVigencia - Data limite de vigência da licitação
 * @returns {string} Texto formatado com o status do prazo (ex: "Vigência: 5 dias", "Vence hoje", "Prazo vencido")
 */
export function calcularPrazoRestante(dataVigencia) {
  if (!dataVigencia) {
    return 'Sem vigência';
  }

  const hoje = new Date();
  const vigencia = paraDataLocal(dataVigencia);
  hoje.setHours(0, 0, 0, 0);
  vigencia.setHours(0, 0, 0, 0);

  const diasRestantes = Math.ceil((vigencia - hoje) / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) {
    return 'Prazo vencido';
  }
  if (diasRestantes === 0) {
    return 'Vence hoje';
  }

  return `Vigência: ${diasRestantes} dia${diasRestantes === 1 ? '' : 's'}`;
}
