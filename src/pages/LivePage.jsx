import { useCallback, useEffect, useRef, useState } from 'react'
import { getTodayMatches } from '../api/football.js'
import MatchCard from '../components/MatchCard.jsx'
import PageHeading from '../components/PageHeading.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx'
import { filterLiveMatches } from '../utils/liveMatches.js'

// Plano gratuito da football-data.org: 10 requisições por minuto. Com 45 s de intervalo
// sobra folga para as outras telas também usarem a API.
export const POLL_INTERVAL_MS = 45 * 1000

const timeFormat = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export default function LivePage() {
  const [state, setState] = useState({ matches: null, error: null, updatedAt: null })
  const [refreshing, setRefreshing] = useState(false)
  const hasData = useRef(false)

  const load = useCallback(async () => {
    try {
      const data = await getTodayMatches()
      hasData.current = true
      setState({ matches: filterLiveMatches(data.matches), error: null, updatedAt: new Date() })
    } catch (error) {
      // Erro durante o polling (ex.: internet caiu um instante) não derruba a lista que já está
      // na tela; só mostra o erro se ainda não havia nada.
      if (!hasData.current) setState((current) => ({ ...current, error: error.message }))
    }
  }, [])

  // Busca ao abrir e repete a cada 45 s. Pausa com a aba do navegador em segundo plano e
  // retoma com uma busca imediata ao voltar. Ao sair da tela o componente desmonta e para tudo.
  useEffect(() => {
    let timer = null
    const stop = () => {
      clearInterval(timer)
      timer = null
    }
    const start = () => {
      stop()
      load()
      timer = setInterval(load, POLL_INTERVAL_MS)
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') start()
      else stop()
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [load])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const { matches, error, updatedAt } = state
  const count = matches?.length ?? 0

  return (
    <>
      <PageHeading
        title="Ao Vivo"
        subtitle={
          updatedAt
            ? `${count === 1 ? '1 jogo' : `${count} jogos`} agora · atualizado às ${timeFormat.format(updatedAt)} (a cada 45 s)`
            : 'Jogos em andamento'
        }
        onRefresh={matches ? refresh : undefined}
        refreshing={refreshing}
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !matches ? (
        <LoadingState label="Procurando jogos ao vivo…" />
      ) : matches.length === 0 ? (
        <EmptyState>Nenhum jogo ao vivo no momento.</EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2" aria-live="polite">
          {matches.map((match) => (
            <li key={match.id}>
              <MatchCard match={match} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
