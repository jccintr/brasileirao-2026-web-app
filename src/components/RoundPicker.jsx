import { useEffect, useRef } from 'react'
import { FiX } from 'react-icons/fi'

// Janela "Selecionar rodada": grade 1..N. Fecha com Esc, clique fora ou no X.
export default function RoundPicker({ totalRounds, selectedRound, onSelect, onClose }) {
  const selectedRef = useRef(null)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    selectedRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Selecionar rodada"
        className="relative w-full max-w-md rounded-t-3xl border border-line bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-float sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Selecionar rodada</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-soft hover:bg-elevated hover:text-fg focus-visible:outline-2 focus-visible:outline-primary"
          >
            <FiX className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="grid max-h-[60vh] grid-cols-5 gap-2 overflow-y-auto p-0.5">
          {Array.from({ length: totalRounds }, (_, index) => index + 1).map((round) => {
            const selected = round === selectedRound
            return (
              <button
                key={round}
                ref={selected ? selectedRef : undefined}
                type="button"
                onClick={() => onSelect(round)}
                aria-pressed={selected}
                aria-label={`Rodada ${round}`}
                className={`h-11 cursor-pointer rounded-xl border text-base font-bold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                  selected
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-line bg-elevated text-fg hover:border-primary/60'
                }`}
              >
                {round}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
