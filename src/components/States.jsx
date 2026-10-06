import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

export function LoadingState({ label = 'Carregando…' }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-20 text-soft">
      <span className="size-9 animate-spin rounded-full border-[3px] border-line border-t-primary" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-14 text-center">
      <FiAlertCircle className="size-10 text-danger" aria-hidden="true" />
      <h2 className="text-xl font-bold text-danger">Não foi possível carregar</h2>
      <p className="max-w-md text-soft">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <FiRefreshCw className="size-4" aria-hidden="true" />
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function EmptyState({ children }) {
  return <p className="rounded-2xl border border-line bg-surface px-6 py-12 text-center text-muted">{children}</p>
}
