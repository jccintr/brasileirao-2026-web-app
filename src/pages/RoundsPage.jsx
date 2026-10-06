import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { getAllMatches, getCompetitionInfo } from '../api/football.js'
import MatchCard from '../components/MatchCard.jsx'
import PageHeading from '../components/PageHeading.jsx'
import RoundPicker from '../components/RoundPicker.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx'
import { TOTAL_MATCHDAYS } from '../config/env.js'
import { useAsync } from '../hooks/useAsync.js'
import { computeCurrentMatchday, groupMatchesByRound } from '../utils/matchday.js'

const loadRounds = async (options) => {
  // A info da competição só ajuda a achar a rodada atual; se falhar, calcula pelas datas.
  const [competition, matchesData] = await Promise.all([
    getCompetitionInfo(options).catch(() => null),
    getAllMatches(options),
  ])
  const matches = matchesData.matches ?? []
  const apiMatchday = competition?.currentSeason?.currentMatchday
  const currentRound =
    typeof apiMatchday === 'number' && apiMatchday > 0 ? apiMatchday : computeCurrentMatchday(matches, 1)
  return { matches, currentRound }
}

const SWIPE_MIN_DISTANCE = 60

export default function RoundsPage() {
  const { data, error, loading, reload } = useAsync(loadRounds)
  const [searchParams, setSearchParams] = useSearchParams()
  const [pickerOpen, setPickerOpen] = useState(false)
  const touchStart = useRef(null)

  const byRound = useMemo(() => (data ? groupMatchesByRound(data.matches) : new Map()), [data])
  const totalRounds = useMemo(
    () => Math.max(TOTAL_MATCHDAYS, byRound.size > 0 ? Math.max(...byRound.keys()) : 0),
    [byRound],
  )

  // A rodada vive na URL (?rodada=12): dá para compartilhar e o "voltar" funciona.
  const fromUrl = Number.parseInt(searchParams.get('rodada') ?? '', 10)
  const selectedRound =
    Number.isInteger(fromUrl) && fromUrl >= 1 && fromUrl <= totalRounds ? fromUrl : (data?.currentRound ?? 1)

  const goTo = useCallback(
    (round) => {
      const next = Math.min(totalRounds, Math.max(1, round))
      setSearchParams({ rodada: String(next) }, { replace: true })
    },
    [totalRounds, setSearchParams],
  )

  // Setas do teclado trocam de rodada (exceto quando há janela aberta ou foco em campo de texto).
  useEffect(() => {
    if (!data || pickerOpen) return undefined
    const onKeyDown = (event) => {
      if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return
      if (event.key === 'ArrowLeft') goTo(selectedRound - 1)
      if (event.key === 'ArrowRight') goTo(selectedRound + 1)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [data, pickerOpen, selectedRound, goTo])

  const onTouchStart = (event) => {
    const touch = event.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }
  const onTouchEnd = (event) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) >= SWIPE_MIN_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) {
      goTo(selectedRound + (dx < 0 ? 1 : -1))
    }
  }

  const matches = byRound.get(selectedRound) ?? []
  const navButton =
    'flex size-10 cursor-pointer items-center justify-center rounded-full text-primary-text hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent'

  return (
    <>
      <PageHeading title="Rodadas" subtitle="Partidas de cada rodada" onRefresh={data ? reload : undefined} refreshing={loading} />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState label="Carregando rodadas…" />
      ) : (
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-line bg-surface px-2 py-1.5">
            <button type="button" className={navButton} onClick={() => goTo(selectedRound - 1)} disabled={selectedRound <= 1} aria-label="Rodada anterior">
              <FiChevronLeft className="size-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 font-heading text-2xl font-bold uppercase tracking-wide hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
              aria-haspopup="dialog"
            >
              <span aria-live="polite">Rodada {selectedRound}</span>
              <FiChevronDown className="size-4 text-muted" aria-hidden="true" />
            </button>
            <button type="button" className={navButton} onClick={() => goTo(selectedRound + 1)} disabled={selectedRound >= totalRounds} aria-label="Próxima rodada">
              <FiChevronRight className="size-6" aria-hidden="true" />
            </button>
          </div>

          {matches.length === 0 ? (
            <EmptyState>Nenhuma partida encontrada para essa rodada.</EmptyState>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {matches.map((match) => (
                <li key={match.id}>
                  <MatchCard match={match} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {pickerOpen && (
        <RoundPicker
          totalRounds={totalRounds}
          selectedRound={selectedRound}
          onSelect={(round) => {
            setPickerOpen(false)
            goTo(round)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}
