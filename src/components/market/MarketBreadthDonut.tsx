import { useEffect, useId, useRef, useState } from 'react'
import type { MarketRecord, MarketTodaySnapshot, SectorRecord } from '../../hooks/useMarketTodaySnapshot'
import './MarketBreadthDonut.css'

type Direction = 'advancing' | 'declining' | 'unchanged'
type View = { direction: Direction; sector?: string; tab: 'stocks' | 'sectors'; all: boolean }
const signed = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`
const shortSector = (s: string) => s === 'Information Technology' ? 'Technology' : s
const tone = (n: number) => n > 0 ? 'orbit-positive' : n < 0 ? 'orbit-negative' : 'orbit-neutral'
const links = [
  ['Overview', '/stock-market-today/', 'overview'],
  ['Heat Map', '/stock-market-today/heatmap/', 'grid'],
  ['Sectors', '/stock-market-today/sector-health/', 'sectors'],
  ['Earnings', '/stock-market-today/earnings-calendar/', 'calendar'],
]
export function OrbitIcon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    {name === 'grid' ? <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>
      : name === 'calendar' ? <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-13 4h3m2 0h3m-8 3h3"/></>
      : name === 'search' ? <><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></>
      : name === 'menu' ? <path d="M3 5h18M3 12h18M3 19h18"/>
      : name === 'sectors' ? <><path d="M12 3v9h9M9 4a9 9 0 1 0 11 11"/><path d="M15 2a9 9 0 0 1 7 7h-7Z"/></>
      : <><path d="M4 20V13h3v7Zm7 0V8h3v12Zm7 0V3h3v17Z" fill="currentColor" stroke="none"/></>}
  </svg>
}
export function MarketOrbitNavigation() {
  const [menu, setMenu] = useState(false)
  return <>
    <header className="orbit-nav">
      <a className="orbit-brand" href="/" aria-label="TNI home"><b>TNI</b><span>MARKET INTELLIGENCE</span></a>
      <nav className="orbit-nav-links" aria-label="Market tools">{links.map(([label, href, icon], i) => <a key={href} href={href} aria-current={i === 0 ? 'page' : undefined}><OrbitIcon name={icon}/>{label}</a>)}</nav>
      <a className="orbit-home-link" href="https://tradingninvestment.com/" aria-label="TradingNInvestment homepage">⌂ <span>Home</span></a>
       <button className="orbit-search-shortcut" onClick={() => document.getElementById('orbit-search')?.click()}><OrbitIcon name="search"/><span>Search stocks or sectors…</span></button>
      <button className="orbit-menu-button" aria-label="Toggle navigation" aria-expanded={menu} aria-controls="orbit-menu" onClick={() => setMenu(!menu)}><OrbitIcon name="menu"/></button>
      {menu && <nav id="orbit-menu" className="orbit-menu" aria-label="Site navigation"><a href="/">Home</a><a href="/research/">Research</a><a href="/about/">About TNI</a>{links.slice(1).map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>}
    </header>
    <nav className="orbit-bottom-nav" aria-label="Mobile market tools">{links.map(([label, href, icon], i) => <a href={href} key={href} aria-current={i === 0 ? 'page' : undefined}><OrbitIcon name={icon}/><span>{label}</span></a>)}</nav>
  </>
}
function StockTable({ stocks }: { stocks: MarketRecord[] }) {
  return stocks.length ? <div className="orbit-table-wrap"><table className="orbit-stocks"><thead><tr><th scope="col">#</th><th scope="col">Symbol</th><th scope="col">Company</th><th scope="col">Change</th></tr></thead><tbody>{stocks.map((stock, index) => <tr key={stock.ticker}>
    <td>{index + 1}</td><th scope="row"><span className="orbit-monogram" aria-hidden="true">{stock.ticker.slice(0, 1)}</span>{stock.ticker}</th><td title={stock.company}>{stock.company}</td><td className={tone(stock.change_pct)}>{signed(stock.change_pct)}</td>
  </tr>)}</tbody></table></div> : <p className="orbit-empty">No matching stocks in this snapshot.</p>
}
function SectorRows({ sectors, metric, onSelect }: { sectors: SectorRecord[]; metric: 'positive_pct' | 'negative_pct' | 'average_change_pct'; onSelect: (s: string) => void }) {
  const max = Math.max(1, ...sectors.map(s => Math.abs(s[metric])))
  return <ol className="orbit-sector-list">{sectors.map((s, i) => <li key={s.sector}><button onClick={() => onSelect(s.sector)}>
    <span>{i + 1}</span><span>{shortSector(s.sector)}</span><span className={`orbit-bar ${metric === 'negative_pct' || (metric === 'average_change_pct' && s[metric] < 0) ? 'orbit-bar-red' : ''}`}><i style={{ width: `${Math.min(100, Math.abs(s[metric]) / (metric === 'average_change_pct' ? max : 100) * 100)}%` }}/></span><b className={metric === 'average_change_pct' ? tone(s[metric]) : metric === 'negative_pct' ? 'orbit-negative' : 'orbit-positive'}>{metric === 'average_change_pct' ? signed(s[metric]) : `${s[metric].toFixed(0)}%`}</b>
  </button></li>)}</ol>
}
export default function MarketBreadthDonut({ snapshot }: { snapshot: MarketTodaySnapshot }) {
  const id = useId().replace(/:/g, '')
  const [view, setView] = useState<View | null>(null)
  const [search, setSearch] = useState<string | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const open = view !== null || search !== null
  useEffect(() => {
    const node = dialog.current
    if (!open || !node) return
    previousFocus.current = document.activeElement as HTMLElement
    node.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { node.close(); document.body.style.overflow = overflow; previousFocus.current?.focus() }
  }, [open])
  useEffect(() => { if (open) dialog.current?.querySelector('.orbit-dialog-scroll')?.scrollTo(0, 0) }, [view, open])
  const close = () => { setView(null); setSearch(null) }
  const show = (direction: Direction, all = false, sector?: string) => setView({ direction, all, sector, tab: 'stocks' })
  const counts = snapshot.breadth
  const valid = ['advancing', 'declining', 'unchanged'].every(k => Number.isInteger(counts?.[k as Direction]) && counts[k as Direction] >= 0)
  const total = valid ? counts.advancing + counts.declining + counts.unchanged : 0
  const pct = (n: number) => total ? `${(n / total * 100).toFixed(1)}%` : '—'
  const constituents = (snapshot.constituents ?? []).filter(s => Number.isFinite(s.change_pct))
  const stocksFor = (direction: Direction, sector?: string) => constituents.filter(s => (!sector || s.sector === sector) && (direction === 'advancing' ? s.change_pct > 0 : direction === 'declining' ? s.change_pct < 0 : s.change_pct === 0)).sort((a,b) => direction === 'declining' ? a.change_pct - b.change_pct : b.change_pct - a.change_pct)
  const sectors = (snapshot.sectors ?? []).filter(s => s.stocks > 0 && Number.isFinite(s.average_change_pct)).slice().sort((a,b) => b.average_change_pct - a.average_change_pct)
  const byBreadth = (direction: Direction) => sectors.slice().sort((a,b) => direction === 'declining' ? b.negative_pct - a.negative_pct : b.positive_pct - a.positive_pct)
  const strongest = sectors[0], weakest = sectors.at(-1)
  const lead = total ? Math.max(counts.advancing, counts.declining) : 0
  const trail = total ? Math.min(counts.advancing, counts.declining) : 0
  const headline = !total ? 'Market breadth is unavailable.' : counts.advancing === counts.declining ? 'Breadth is balanced.' : `Breadth is leaning ${counts.advancing > counts.declining ? 'positive' : 'negative'}.`
  const insight = !total ? 'Waiting for a valid snapshot.' : lead === 0 ? 'All tracked stocks are unchanged.' : lead === trail ? 'Advancing and declining stocks are evenly matched.' : trail ? `${counts.advancing > counts.declining ? 'Advancers outnumber decliners' : 'Decliners outnumber advancers'} by ${(lead / trail).toFixed(1)} to 1.` : `${lead} stocks ${counts.advancing > counts.declining ? 'advancing; none declining' : 'declining; none advancing'}.`
  const names = (d: Direction) => d === 'advancing' ? 'Gainers' : d === 'declining' ? 'Decliners' : 'Unchanged'
  const title = (d: Direction) => d === 'advancing' ? 'Advancing Stocks' : d === 'declining' ? 'Declining Stocks' : 'Unchanged Stocks'
  const directionClass = (d: Direction) => d === 'advancing' ? 'orbit-up' : d === 'declining' ? 'orbit-down' : 'orbit-flat'
  function Movers({ direction }: { direction: Direction }) {
    const stocks = stocksFor(direction)
    return <section className={`orbit-movers ${directionClass(direction)}`} aria-label={`Top 10 ${names(direction)}`}>
      <div className="orbit-mover-heading"><span className="orbit-arrow">{direction === 'advancing' ? '↗' : '↘'}</span><div><div className="orbit-mover-label"><span className="orbit-badge">TOP 10 {names(direction).toUpperCase()}</span><h2>{title(direction)}</h2></div><strong>{valid ? counts[direction] : '—'} <small>({pct(counts?.[direction])})</small></strong></div></div>
      <p>Stocks trading {direction === 'advancing' ? 'above' : 'below'} their previous close.</p>
      <StockTable stocks={stocks.slice(0,10)}/>
      <button className="orbit-outline" onClick={() => show(direction, true)}>View All {valid ? counts[direction] : ''} {title(direction)} <span>→</span></button>
    </section>
  }
  function SectorCard({ sector, label, direction }: { sector?: SectorRecord; label: string; direction: Direction }) {
    const leaders = sector ? stocksFor(direction, sector.sector).slice(0,3).map(s => s.ticker) : []
    return <button className="orbit-sector-card" disabled={!sector} onClick={() => show(direction, false, sector?.sector)}>
      <span className={direction === 'advancing' ? 'orbit-positive' : 'orbit-negative'}><OrbitIcon name="overview"/></span><span><small>{label}</small><strong>{sector ? shortSector(sector.sector) : 'Unavailable'}</strong><b className={sector ? tone(sector.average_change_pct) : ''}>{sector ? signed(sector.average_change_pct) : '—'}</b>{leaders.length > 0 && <em>Led by {leaders.join(', ')}</em>}</span>
    </button>
  }
  let offset = 0
  const circumference = 2 * Math.PI * 112
  const currentStocks = view ? stocksFor(view.direction, view.sector) : []
  const currentSector = view?.sector ? sectors.find(s => s.sector === view.sector) : undefined
  const searchStocks = search !== null ? constituents.filter(s => `${s.ticker} ${s.company} ${s.sector}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b) => a.ticker.localeCompare(b.ticker)) : []
  return <div className="market-orbit">
    <button id="orbit-search" hidden onClick={() => setSearch('')}>Search stocks</button>
    <div className="orbit-main-grid">
      <Movers direction="advancing"/>
      <section className="orbit-breadth" aria-labelledby={`${id}-heading`}>
        <header><span className="orbit-eyebrow">TNI MARKET ORBIT</span><h2 id={`${id}-heading`}>S&amp;P 500 Market Breadth</h2><p>{total ? `${total} STOCKS WITH DATA` : 'DATA UNAVAILABLE'}</p></header>
        <button className="orbit-unchanged" disabled={!total} onClick={() => show('unchanged', true)}>UNCHANGED<strong>{valid ? counts.unchanged : '—'} ({pct(counts?.unchanged)})</strong></button>
        <div className="orbit-dial">
          <svg viewBox="0 0 356 356" aria-label={total ? `${counts.advancing} advancing, ${counts.declining} declining, ${counts.unchanged} unchanged` : 'Breadth unavailable'}>
            <defs><linearGradient id={`${id}-green`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#08db73"/><stop offset="1" stopColor="#00ad51"/></linearGradient><linearGradient id={`${id}-red`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ff2448"/><stop offset="1" stopColor="#f0444a"/></linearGradient></defs>
            <circle cx="178" cy="178" r="161" fill="none" stroke="#e8eef8" strokeWidth="1"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => <circle key={a} cx={178 + 161 * Math.cos(a*Math.PI/180)} cy={178 + 161*Math.sin(a*Math.PI/180)} r="1.5" fill="#d0ddec"/>)}
            <circle cx="178" cy="178" r="112" fill="none" stroke="#edf1f6" strokeWidth="40"/>
            {total > 0 && (['declining','advancing','unchanged'] as Direction[]).map(direction => {
              const length = counts[direction] / total * circumference
              const start = offset; offset += length
              if (!length) return null
              return <circle key={direction} cx="178" cy="178" r="112" fill="none" stroke={direction === 'unchanged' ? '#b9c5d8' : `url(#${id}-${direction === 'advancing' ? 'green' : 'red'})`} strokeWidth="40" transform="rotate(-90 178 178)" strokeDasharray={`${Math.max(.1,length - (length < circumference ? 3 : 0))} ${circumference - Math.max(.1,length - (length < circumference ? 3 : 0))}`} strokeDashoffset={-start} className="orbit-arc" role="button" tabIndex={0} aria-label={direction === 'unchanged' ? 'View unchanged stocks' : `View top 10 ${names(direction).toLowerCase()}`} onClick={() => show(direction, direction === 'unchanged')} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(direction, direction === 'unchanged') } }}><title>{title(direction)}: {counts[direction]} ({pct(counts[direction])})</title></circle>
            })}
          </svg>
          <div className="orbit-dial-center"><strong>{total || '—'}</strong><span>S&amp;P 500 STOCKS</span></div>
          {(['advancing','declining'] as Direction[]).map(direction => <button disabled={!total} key={direction} className={`orbit-callout ${directionClass(direction)}`} onClick={() => show(direction)}><span>{direction === 'advancing' ? '↗' : '↘'} TAP FOR<br/>TOP 10<br/>{names(direction).toUpperCase()}</span><strong>{valid ? counts[direction] : '—'}<small>({pct(counts?.[direction])})</small></strong></button>)}
        </div>
        <p className="orbit-tap-hint">Tap a side to see the top 10 stocks <span>→</span></p>
        <div className="orbit-insight"><span aria-hidden="true">☼</span><div><strong>{headline}</strong><p>{insight}</p></div></div>
      </section>
      <Movers direction="declining"/>
    </div>
    <div className="orbit-sector-highlights"><SectorCard sector={strongest} label="Strongest Sector" direction="advancing"/><a className="orbit-heatmap" href="/stock-market-today/heatmap/"><OrbitIcon name="grid"/><span><strong>View Full Heat Map</strong><small>See S&amp;P 500 stocks by sector</small></span><span>→</span></a><SectorCard sector={weakest} label="Weakest Sector" direction="declining"/></div>
    <section className="orbit-benchmarks" aria-labelledby={`${id}-benchmarks`}><h2 id={`${id}-benchmarks`}>MAJOR MARKET BENCHMARKS</h2><div>{snapshot.benchmarks.map(b => <article key={b.symbol}><span>{b.name}</span><strong>{b.available && Number.isFinite(b.price) ? b.price!.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—'}</strong><div className={tone(b.change_pct ?? 0)}>{b.available && Number.isFinite(b.change_pct) ? <><b>{signed(b.change_pct!)}</b><small>{b.symbol}</small></> : <small>Unavailable</small>}</div></article>)}</div></section>
    <div className="orbit-sector-analytics"><section><h2>Top Sectors by Advancing Stocks</h2><SectorRows sectors={byBreadth('advancing').slice(0,5)} metric="positive_pct" onSelect={s => show('advancing', false, s)}/></section><section><h2>Sector Performance (Today)</h2><SectorRows sectors={sectors.slice(0,5)} metric="average_change_pct" onSelect={s => show('advancing', false, s)}/></section><section><h2>Top Sectors by Declining Stocks</h2><SectorRows sectors={byBreadth('declining').slice(0,5)} metric="negative_pct" onSelect={s => show('declining', false, s)}/></section></div>
    <p className="orbit-method">Breadth uses stocks with available quotes. Sector returns are equal-weight averages. Benchmark quotes are labeled by their source instrument.</p>
    <dialog ref={dialog} className={`orbit-dialog ${view ? directionClass(view.direction) : ''}`} aria-labelledby={`${id}-dialog-title`} onCancel={close} onKeyDownCapture={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close() } }} onClick={e => { if(e.target === e.currentTarget) close() }}>
      <div className="orbit-dialog-scroll"><div className="orbit-dialog-toolbar"><button onClick={() => { if(view?.sector) setView({...view, sector:undefined, tab:'sectors', all:false}); else if(view?.tab === 'sectors' || view?.all) setView({...view, tab:'stocks', all:false}); else close() }}>← {view?.sector ? 'Back to Sectors' : view?.tab === 'sectors' || view?.all ? 'Back to Top 10' : 'Back to Market Overview'}</button><button className="orbit-close" aria-label="Close details" onClick={close}>×</button></div>
      {search !== null ? <><h2 id={`${id}-dialog-title`}>Search the S&amp;P 500</h2><label className="orbit-search-label">Symbol, company, or sector<input autoFocus type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stocks or sectors…"/></label><p>{searchStocks.length} matching stocks</p><StockTable stocks={searchStocks}/></> : view && <>
        <div className="orbit-detail-heading"><span className="orbit-arrow">{view.direction === 'advancing' ? '↗' : view.direction === 'declining' ? '↘' : '–'}</span><div><h2 id={`${id}-dialog-title`}>{view.sector ? `${shortSector(view.sector)} Sector` : title(view.direction)}</h2><strong>{currentSector ? `${(view.direction === 'declining' ? currentSector.negative_pct : currentSector.positive_pct).toFixed(0)}% ${view.direction}` : `${valid ? counts[view.direction] : '—'} (${pct(counts?.[view.direction])})`}</strong></div></div>
        <p className="orbit-detail-description">Stocks {view.sector ? `in ${view.sector} ` : ''}trading {view.direction === 'advancing' ? 'above' : view.direction === 'declining' ? 'below' : 'at'} their previous close.</p>
        {view.direction !== 'unchanged' && <div className="orbit-tabs" aria-label="Stock views">{view.sector ? <><button aria-pressed={view.direction === 'advancing'} onClick={() => setView({...view, direction:'advancing', all:false})}>Top 10 Gainers</button><button aria-pressed={view.direction === 'declining'} onClick={() => setView({...view, direction:'declining', all:false})}>Top 10 Decliners</button></> : <><button aria-pressed={view.tab === 'stocks'} onClick={() => setView({...view, tab:'stocks', all:false})}>Top 10 {names(view.direction)}</button><button aria-pressed={view.tab === 'sectors'} onClick={() => setView({...view, tab:'sectors', all:false})}>By Sector</button></>}</div>}
        {view.tab === 'sectors' && !view.sector ? <><div className="orbit-sector-caption"><span>Sector</span><span>% {view.direction}</span></div><SectorRows sectors={byBreadth(view.direction)} metric={view.direction === 'declining' ? 'negative_pct' : 'positive_pct'} onSelect={s => show(view.direction,false,s)}/><a className="orbit-outline" href="/stock-market-today/heatmap/">View Full Heat Map by Sector →</a></> : <>
          {view.all && <h3 className="orbit-all-label">All {currentStocks.length} {view.sector ? shortSector(view.sector) + ' ' : ''}{title(view.direction)}</h3>}
          <StockTable stocks={view.all ? currentStocks : currentStocks.slice(0,10)}/>
          {!view.all && <button className="orbit-outline" onClick={() => setView({...view, all:true})}>View All {currentStocks.length} {view.sector ? shortSector(view.sector) + ' ' : ''}{title(view.direction)} →</button>}
          {view.direction !== 'unchanged' && !view.sector && <section className="orbit-detail-sectors"><h3>Top {view.direction === 'advancing' ? 'Advancing' : 'Declining'} Sectors (Today)</h3><SectorRows sectors={(view.direction === 'declining' ? sectors.slice().reverse() : sectors).slice(0,3)} metric="average_change_pct" onSelect={s => show(view.direction,false,s)}/></section>}
        </>}
      </>}
      </div>
    </dialog>
  </div>
}
