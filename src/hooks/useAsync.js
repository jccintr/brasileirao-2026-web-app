import { useCallback, useEffect, useState } from 'react'

// Carrega dados assíncronos. `fn` deve ser estável (useCallback) e receber { skipCache }.
// Para refazer a busca quando algo muda (ex.: id na URL), remonte o componente com `key`.
export function useAsync(fn) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    fn({ skipCache: nonce > 0 })
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, error: error.message, loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [fn, nonce])

  // Mantém os dados antigos na tela enquanto atualiza (loading + data).
  const reload = useCallback(() => {
    setState((current) => ({ ...current, error: null, loading: true }))
    setNonce((n) => n + 1)
  }, [])

  return { ...state, reload }
}
