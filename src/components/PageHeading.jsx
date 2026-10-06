import { FiRefreshCw } from 'react-icons/fi'

// Título da página com botão opcional de atualizar.
export default function PageHeading({ title, subtitle, onRefresh, refreshing, className = 'mb-5' }) {
  return (
    <div className={`flex flex-1 items-end justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-4xl font-extrabold leading-none">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-soft">{subtitle}</p>}
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Atualizar"
          title="Atualizar"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-soft hover:text-fg focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-wait"
        >
          <FiRefreshCw className={`size-[18px] ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
