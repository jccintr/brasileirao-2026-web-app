import { act, render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext.jsx'

function mockSystem(dark) {
  const listeners = new Set()
  const media = {
    matches: dark,
    addEventListener: (_type, fn) => listeners.add(fn),
    removeEventListener: (_type, fn) => listeners.delete(fn),
  }
  vi.stubGlobal('matchMedia', () => media)
  return (next) => {
    media.matches = next
    listeners.forEach((fn) => fn({ matches: next }))
  }
}

function Probe() {
  const { preference, resolved, setPreference } = useTheme()
  return (
    <div>
      <span data-testid="state">{`${preference}/${resolved}`}</span>
      <button onClick={() => setPreference('light')}>light</button>
      <button onClick={() => setPreference('dark')}>dark</button>
      <button onClick={() => setPreference('system')}>system</button>
    </div>
  )
}

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )

afterEach(() => {
  vi.unstubAllGlobals()
  document.documentElement.classList.remove('dark')
})

describe('ThemeProvider', () => {
  it('segue o sistema por padrão (escuro)', () => {
    mockSystem(true)
    renderProbe()
    expect(screen.getByTestId('state')).toHaveTextContent('system/dark')
    expect(document.documentElement).toHaveClass('dark')
  })

  it('segue o sistema por padrão (claro)', () => {
    mockSystem(false)
    renderProbe()
    expect(screen.getByTestId('state')).toHaveTextContent('system/light')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('escolha manual vence o sistema e é lembrada', () => {
    mockSystem(true)
    renderProbe()
    act(() => screen.getByText('light').click())
    expect(screen.getByTestId('state')).toHaveTextContent('light/light')
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('brasileirao2026:theme')).toBe('light')
  })

  it('voltar para "sistema" limpa a escolha salva', () => {
    mockSystem(false)
    localStorage.setItem('brasileirao2026:theme', 'dark')
    renderProbe()
    expect(screen.getByTestId('state')).toHaveTextContent('dark/dark')
    act(() => screen.getByText('system').click())
    expect(screen.getByTestId('state')).toHaveTextContent('system/light')
    expect(localStorage.getItem('brasileirao2026:theme')).toBeNull()
  })

  it('reage à mudança do sistema só no modo "sistema"', () => {
    const setSystem = mockSystem(false)
    renderProbe()
    act(() => setSystem(true))
    expect(screen.getByTestId('state')).toHaveTextContent('system/dark')

    act(() => screen.getByText('light').click())
    act(() => setSystem(false))
    act(() => setSystem(true))
    expect(screen.getByTestId('state')).toHaveTextContent('light/light')
  })
})
