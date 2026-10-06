// Faixas da tabela do Brasileirão Série A e o que cada uma classifica/rebaixa.
// Segue o formato mais comum dos últimos anos (G4 + pré-Libertadores, Sul-Americana,
// Z4 numa liga de 20 clubes). A CBF pode mudar as vagas de uma temporada para outra:
// ajuste os números aqui, sem mexer nas telas. As cores são tokens CSS (ver index.css).
export const QUALIFICATION_ZONES = [
  { key: 'libertadores-groups', label: 'Libertadores (fase de grupos)', shortLabel: 'Libertadores', from: 1, to: 4, color: 'var(--zone-libertadores)' },
  { key: 'libertadores-pre', label: 'Libertadores (pré-fase)', shortLabel: 'Pré-Libertadores', from: 5, to: 5, color: 'var(--zone-pre)' },
  { key: 'sudamericana', label: 'Sul-Americana', shortLabel: 'Sul-Americana', from: 6, to: 11, color: 'var(--zone-sula)' },
  { key: 'relegation', label: 'Rebaixamento', shortLabel: 'Rebaixamento', from: 17, to: 20, color: 'var(--zone-relegation)' },
]

export function getZoneForPosition(position, zones = QUALIFICATION_ZONES) {
  return zones.find((zone) => position >= zone.from && position <= zone.to) ?? null
}
