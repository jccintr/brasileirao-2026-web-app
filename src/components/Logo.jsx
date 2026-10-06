export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" className="size-8 shrink-0 sm:size-9" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#FEDD00" />
        <path d="M32 11l6 13.5 14.6 1.4-11 9.7 3.2 14.3L32 42l-12.8 7.9 3.2-14.3-11-9.7L25.6 24.5z" fill="#007a2e" />
      </svg>
      <span className="whitespace-nowrap font-heading text-xl font-extrabold uppercase leading-none tracking-wide sm:text-[26px]">
        Brasileirão <span className="text-gold">2026</span>
      </span>
    </div>
  )
}
