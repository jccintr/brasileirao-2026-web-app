import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getTodayMatches } from '../api/football.js'
import { filterLiveMatches } from '../utils/liveMatches.js'

// Ao abrir o app na tela inicial (Classificação), se já tem jogo rolando, leva direto para
// "Ao Vivo". Roda uma vez; se a pessoa já foi para outra tela enquanto a API respondia (ou
// abriu um link direto para outra página), não força a troca. Falha de rede é ignorada.
export function useLiveAutoNavigate() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const pathRef = useRef(pathname)
  const startedOnHome = useRef(pathname === '/')

  useEffect(() => {
    pathRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (!startedOnHome.current) return undefined
    let cancelled = false
    getTodayMatches()
      .then((data) => {
        if (cancelled) return
        if (filterLiveMatches(data.matches).length > 0 && pathRef.current === '/') {
          startedOnHome.current = false // só uma vez
          navigate('/ao-vivo')
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [navigate])
}
