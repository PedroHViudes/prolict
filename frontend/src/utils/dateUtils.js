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
  const vigencia = new Date(dataVigencia);
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
