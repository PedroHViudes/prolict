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
