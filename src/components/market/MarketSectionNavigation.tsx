import type { ReactNode } from 'react'
import './MarketSectionNavigation.css'

const destinations = [
  ['Overview', '/stock-market-today/'],
  ['S&P 500 Heatmap', '/stock-market-today/heatmap/'],
  ['Sector Health', '/stock-market-today/sector-health/'],
  ['Earnings Calendar', '/stock-market-today/earnings-calendar/'],
]
export default function MarketSectionNavigation({active}: {active: string}) {
  return <aside className="tni-market-sidebar"><p>STOCK MARKET TODAY</p><nav aria-label="Stock Market Today sections">{destinations.map(([label, href]) => href === '/stock-market-today/heatmap/' ? <details key={href} className="tni-scanner-group" open={active === href || undefined}><summary>Heatmap + Scanner <span aria-hidden="true">⌄</span></summary><a href={href} aria-current={href === active ? 'page' : undefined}>S&amp;P 500</a></details> : <a key={href} href={href} aria-current={href === active ? 'page' : undefined}>{label}</a>)}<details className="tni-scanner-group" open={active === '/research/scanners/leveraged-etf/' || undefined}><summary>Scanner <span aria-hidden="true">⌄</span></summary><a href="/research/scanners/leveraged-etf/" aria-current={active === '/research/scanners/leveraged-etf/' ? 'page' : undefined}>Leveraged ETF</a></details></nav></aside>
}
export function MarketPageLayout({active, children}: {active: string; children: ReactNode}) {
  return <div className="tni-market-layout"><MarketSectionNavigation active={active} /><div className="tni-market-content">{children}</div></div>
}
