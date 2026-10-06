export const STATUS_LABELS = {
  SCHEDULED: 'Agendado',
  TIMED: 'Agendado',
  IN_PLAY: 'Ao vivo',
  PAUSED: 'Intervalo',
  FINISHED: 'Encerrado',
  POSTPONED: 'Adiado',
  SUSPENDED: 'Suspenso',
  CANCELLED: 'Cancelado',
  AWARDED: 'Decidido em gabinete',
}

// "07/10 · 16:00", no fuso do navegador.
export function formatDateTime(iso) {
  const date = new Date(iso)
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${time}`
}
