import { useEffect } from 'react'
import { useLiveAutoNavigate } from './hooks/useLiveAutoNavigate.js'
import { Link, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import LivePage from './pages/LivePage.jsx'
import RoundsPage from './pages/RoundsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import StandingsPage from './pages/StandingsPage.jsx'
import TeamDetailPage from './pages/TeamDetailPage.jsx'
import TeamsPage from './pages/TeamsPage.jsx'

function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-5xl font-extrabold">404</h1>
      <p className="mt-2 text-soft">Página não encontrada.</p>
      <Link to="/" className="mt-4 inline-block font-semibold text-primary-text hover:underline">
        Ir para a classificação
      </Link>
    </div>
  )
}

export default function App() {
  useLiveAutoNavigate()

  useEffect(() => {
    document.title = 'Brasileirão 2026'
  }, [])

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<StandingsPage />} />
        <Route path="rodadas" element={<RoundsPage />} />
        <Route path="equipes" element={<TeamsPage />} />
        <Route path="equipes/:teamId" element={<TeamDetailPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
        <Route path="ao-vivo" element={<LivePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
