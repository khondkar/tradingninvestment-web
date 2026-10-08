import { useId, useState } from 'react'
import type { MarketTodaySnapshot, SectorRecord } from '../../hooks/useMarketTodaySnapshot'
import './MarketBreadthDonut.css'

type Props = { snapshot: MarketTodaySnapshot }
type Category = 'advancing' | 'declining' | 'unchanged'
const categories: { key: Category; label: string; description: string }[] = [
  { key: 'advancing', label: 'Advancing', description: 'Above their previous closing price.' },
  { key: 'declining', label: 'Declining', description: 'Below their previous closing price.' },
  { key: 'unchanged', label: 'Unchanged', description: 'At their previous closing price.' },
]
const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}%`
const countText = (n: number) => n.toLocaleString('en-US')

function updatedLabel(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Snapshot time unavailable' : new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(date)
}

export default function MarketBreadthDonut({ snapshot }: Props) {
  const id = useId()
  const [hovered, setHovered] = useState<Category | null>(null)
  const [focused, setFocused] = useState<Category | null>(null)
  const [pinned, setPinned] = useState<Category | null>(null)
  const active = hovered ?? focused ?? pinned
  const counts = categories.map(({ key }) => snapshot.breadth?.[key])
  const valid = counts.every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && Number.isInteger(n))
  const total = valid ? counts.reduce((sum, n) => sum + n, 0) : 0
  const available = valid && total > 0
  const data = categories.map((category, i) => ({ ...category, count: valid ? counts[i] : 0 }))
  const selected = data.find(item => item.key === active)
  const percent = available ? ((selected?.count ?? counts[0]) / total * 100).toFixed(1) : '—'
  const sectors = (snapshot.sectors ?? []).filter(sector =>
    sector.sector && Number.isFinite(sector.average_change_pct) && sector.stocks > 0,
  ).slice().sort((a, b) => b.average_change_pct - a.average_change_pct)
  const strongest = sectors[0]
  const weakest = sectors[sectors.length - 1]
  const sectorDetail = (sector: SectorRecord | undefined, label: string) => sector
    ? `${label}: ${sector.sector} ${signed(sector.average_change_pct)}.`
    : `${label}: unavailable.`
  const selectedSector = active === 'advancing' ? sectorDetail(strongest, 'Strongest sector')
    : active === 'declining' ? sectorDetail(weakest, 'Weakest sector') : ''
  const advancing = valid ? counts[0] : 0
  const declining = valid ? counts[1] : 0
  let headline = 'Breadth is balanced.'
  let summary = 'Advancing and declining stocks are evenly matched.'
  if (!available) {
    headline = 'Market breadth is unavailable.'
    summary = 'Waiting for a valid breadth snapshot.'
  } else if (advancing === 0 && declining === 0) {
    headline = 'Tracked stocks are unchanged.'
    summary = 'No advancing or declining stocks in this snapshot.'
  } else if (advancing !== declining) {
    const down = declining > advancing
    const lead = down ? declining : advancing
    const trail = down ? advancing : declining
    headline = `Breadth is leaning ${down ? 'negative' : 'positive'}.`
    summary = trail > 0
      ? `${down ? 'Decliners' : 'Advancers'} outnumber ${down ? 'advancers' : 'decliners'} by ${(lead / trail).toFixed(1)} to 1.`
      : `${countText(lead)} stocks ${down ? 'declining' : 'advancing'}; none ${down ? 'advancing' : 'declining'}.`
  }
  const toggle = (key: Category) => setPinned(previous => previous === key ? null : key)
  const radius = 140
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <section className="tni-breadth" id="market-breadth" aria-labelledby={`${id}-heading`}
      onKeyDown={event => {
        if (event.key === 'Escape') { setPinned(null); setHovered(null); setFocused(null) }
      }}>
      <header className="tni-breadth__header">
        <span className="tni-breadth__eyebrow">THE MARKET AT A GLANCE</span>
        <h2 id={`${id}-heading`}>One glance. The whole picture.</h2>
        <p>S&amp;P 500 market breadth · {available ? `${countText(total)} stocks with available data` : 'Data unavailable'}</p>
        <time dateTime={snapshot.generated_at_utc || undefined}>Snapshot: {updatedLabel(snapshot.generated_at_utc)}</time>
      </header>
      <div className="tni-breadth__dial">
        <svg viewBox="0 0 356 356" role="img" aria-labelledby={`${id}-chart-title`}>
          <title id={`${id}-chart-title`}>{available
            ? `S&P 500 breadth: ${advancing} advancing, ${declining} declining, ${counts[2]} unchanged.`
            : 'Market breadth unavailable'}</title>
          <circle cx="178" cy="178" r={radius} fill="none" strokeWidth="32" className="tni-breadth__track" />
          {available && data.map(item => {
            const length = item.count / total * circumference
            const start = offset
            offset += length
            if (item.count === 0) return null
            return <circle key={item.key} cx="178" cy="178" r={radius} fill="none" strokeWidth="32"
              transform="rotate(-90 178 178)" strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-start} className={`tni-breadth__arc tni-breadth__arc--${item.key}`}
              style={{ opacity: active && active !== item.key ? 0.5 : 1 }}
              onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(item.key) }}
              onPointerLeave={() => setHovered(null)} onClick={() => toggle(item.key)}>
              <title>{item.label}: {countText(item.count)} stocks ({(item.count / total * 100).toFixed(1)}%). {item.description} {item.key === 'advancing' ? sectorDetail(strongest, 'Strongest sector') : item.key === 'declining' ? sectorDetail(weakest, 'Weakest sector') : ''}</title>
            </circle>
          })}
        </svg>
        <div className="tni-breadth__center" aria-hidden="true">
          <span className="tni-breadth__center-label">{selected?.label ?? 'Advancing'}</span>
          <div className="tni-breadth__value">{percent}{available && <span>%</span>}</div>
          <span className="tni-breadth__center-note">{selected && available ? `${countText(selected.count)} of ${countText(total)} stocks` : 'of tracked stocks'}</span>
        </div>
      </div>
      <div className="tni-breadth__legend" aria-label="Explore market breadth">
        {data.map(item => <button type="button" key={item.key} disabled={!available}
          aria-pressed={pinned === item.key} aria-controls={`${id}-detail`}
          aria-label={`${item.label}: ${available ? `${countText(item.count)} stocks, ${(item.count / total * 100).toFixed(1)} percent` : 'unavailable'}. Show details.`}
          onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(item.key) }}
          onPointerLeave={() => setHovered(null)} onFocus={() => setFocused(item.key)}
          onBlur={() => setFocused(null)} onClick={() => toggle(item.key)}>
          <span className="tni-breadth__legend-label"><i className={`tni-breadth__dot tni-breadth__dot--${item.key}`} />{item.label}</span>
          <strong>{available ? countText(item.count) : '—'}</strong>
        </button>)}
      </div>
      <div className="tni-breadth__insight" id={`${id}-detail`}>
        <strong>{selected && available ? `${selected.label} · ${countText(selected.count)} stocks` : headline}</strong>
        <p>{selected && available ? `${selected.description} ${selectedSector}` : summary}</p>
      </div>
      <div className="tni-breadth__sectors">
        {([{ label: 'Strongest sector', sector: strongest }, { label: 'Weakest sector', sector: weakest }]).map(({ label, sector }) =>
          <div className="tni-breadth__sector" key={label}>
            <span>{label}</span>
            <div><strong>{sector?.sector ?? 'Unavailable'}</strong><b className={sector && sector.average_change_pct > 0 ? 'tni-breadth__gain' : sector && sector.average_change_pct < 0 ? 'tni-breadth__loss' : ''}>{sector ? signed(sector.average_change_pct) : '—'}</b></div>
          </div>,
        )}
      </div>
      <p className="tni-breadth__method">Daily sector returns · Equal-weight constituents</p>
    </section>
  )
}
