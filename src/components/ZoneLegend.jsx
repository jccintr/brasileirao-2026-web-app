export default function ZoneLegend({ zones }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-soft" aria-label="Legenda da classificação">
      {zones.map((zone) => (
        <li key={zone.key} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: zone.color }} aria-hidden="true" />
          {zone.shortLabel}
        </li>
      ))}
    </ul>
  )
}
