import { useState } from 'react'
import { FiShield } from 'react-icons/fi'

// Escudo da equipe; se a URL vier vazia ou falhar, mostra um escudo genérico.
export default function TeamCrest({ uri, size = 32, className = '' }) {
  const [failedUri, setFailedUri] = useState(null)
  const style = { width: size, height: size }

  if (!uri || failedUri === uri) {
    return (
      <span style={style} className={`inline-flex shrink-0 items-center justify-center text-muted ${className}`}>
        <FiShield style={{ width: size * 0.8, height: size * 0.8 }} aria-hidden="true" />
      </span>
    )
  }

  return (
    <img
      src={uri}
      alt=""
      loading="lazy"
      style={style}
      onError={() => setFailedUri(uri)}
      className={`shrink-0 object-contain ${className}`}
    />
  )
}
