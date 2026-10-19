import { useEffect, useMemo, useState } from 'react'
import './AppleIphoneResearchPage.css'

type EventRow = { date: string; model: string; description?: string; close?: number; returns?: Record<string, number | null>; benchmark?: Record<string, number | null>; source?: string }
type SalesRow = { quarter: string; reportDate: string; revenueBillion?: number; priorYearBillion?: number; consensusBillion?: number; reaction?: number; source?: string }
const horizons = [['1D','1 trading day'],['5D','5 trading days'],['10D','10 trading days'],['20D','20 trading days'],['3M','3 months'],['6M','6 months'],['1Y','1 year']] as const
const fmt = (value?: number | null) => value == null || !Number.isFinite(value) ? 'Not available' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
type ChartMetric = 'AAPL' | 'S&P 500' | 'Excess'
const chartMetrics: ChartMetric[] = ['AAPL','S&P 500','Excess']
const chartColors: Record<ChartMetric,string> = {'AAPL':'#147d75','S&P 500':'#577aab','Excess':'#c17a32'}
function AnnouncementChart({ rows, horizon }: { rows: EventRow[]; horizon: string }) {
  const [selected, setSelected] = useState<ChartMetric[]>(['AAPL','S&P 500','Excess'])
  const values = rows.map(row => {
    const a = row.returns?.[horizon]
    const b = row.benchmark?.[horizon]
    return {row, values: { 'AAPL': typeof a === 'number' ? a : null, 'S&P 500': typeof b === 'number' ? b : null, 'Excess': typeof a === 'number' && typeof b === 'number' ? a-b : null } as Record<ChartMetric,number|null>}
  })
  const observed = values.flatMap(item => selected.map(metric => item.values[metric]).filter((v):v is number => v !== null && Number.isFinite(v)))
  const maxAbs = Math.max(5, ...observed.map(Math.abs)) * 1.12
  const height = 340, top = 24, bottom = 285, mid = (top + bottom)/2, scale = (bottom-top)/2/maxAbs
  const left = 80, right = 950, groupWidth = (right-left)/Math.max(1,values.length), barWidth = Math.min(22,groupWidth/4)
  return <div className="tni-iphone-chart-card">
    <div className="tni-iphone-chart-heading"><h3>Return comparison · {horizon}</h3><span>Percent change from pre-announcement close</span></div>
    <div className="tni-iphone-chart-legend" aria-label="Toggle chart series">{chartMetrics.map(metric => <button type="button" key={metric} aria-pressed={selected.includes(metric)} onClick={() => setSelected(current => current.includes(metric) ? current.filter(v => v !== metric) : [...current,metric])}><span className="tni-iphone-legend-dot" style={{background:chartColors[metric]}} />{metric}</button>)}</div>
    <div className="tni-iphone-chart-scroll" role="region" aria-label={`iPhone announcement ${horizon} return comparison chart`} tabIndex={0}>
      <svg viewBox={`0 0 1000 ${height}`} role="img" aria-label={`Grouped bar chart showing AAPL, S&P 500 and excess returns for ${horizon}. Exact figures appear in the accessible table below.`}>
        {[-1,-.5,0,.5,1].map(t => {const y=mid-t*maxAbs*scale;return <g key={t}><line x1={left} x2={right} y1={y} y2={y} stroke={t===0?'#6a7a88':'#e4e9ee'} strokeWidth={t===0?1.6:1}/><text x={left-12} y={y+4} fontSize="13" textAnchor="end" fill="#64748b">{(t*maxAbs).toFixed(0)}%</text></g>})}
        {values.map((item,i)=>{const x=left+groupWidth*(i+.5);return <g key={item.row.date}>
          {selected.map((metric,j)=>{const v=item.values[metric];if(v===null)return null;const y=mid-v*scale;const bw=barWidth;const bx=x+(j-(selected.length-1)/2)*(bw+3)-bw/2;return <rect key={metric} x={bx} y={Math.min(mid,y)} width={bw} height={Math.max(1,Math.abs(y-mid))} rx="2" fill={chartColors[metric]}><title>{`${item.row.model} (${item.row.date}) · ${metric}: ${fmt(v)}`}</title></rect>})}
          <text x={x} y={bottom+23} fontSize="13" textAnchor="middle" fill="#475569">{item.row.date.slice(0,4)}</text>
        </g>})}
      </svg>
    </div>
    <p className="tni-iphone-chart-caption">Tap a legend item to show or hide a series. Hover or tap a bar for its value. Scroll the table below for exact observations. Missing horizons are excluded, not treated as zero.</p>
  </div>
}
export default function AppleIphoneResearchPage() {
  const [horizon,setHorizon] = useState<string>('5D')
  const [announcements,setAnnouncements] = useState<EventRow[]>([])
  const [sales,setSales] = useState<SalesRow[]>([])
  const [errors,setErrors] = useState<string[]>([])
  const [originalHtml,setOriginalHtml] = useState<string>('')
  useEffect(() => {
    document.title = 'iPhone Releases, Apple Stock Returns & Sales Impact | TradingNInvestment'
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = 'https://tradingninvestment.com/new-iphone-release-apple-stock-price-history/'
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!description) { description = document.createElement('meta'); description.name = 'description'; document.head.appendChild(description) }
    description.content = 'Historical research on Apple iPhone announcements, AAPL returns, iPhone sales and market reactions.'
    let active = true
    const load = async <T,>(url:string, set:(v:T)=>void) => {
      try { const r = await fetch(url); if (!r.ok) throw Error(`${r.status}`); const data = await r.json(); if (!Array.isArray(data)) throw Error('Expected array'); if (active) set(data as T) }
      catch (e) { if (active) setErrors(v => [...v, `${url}: ${String(e)}`]) }
    }
    void load<EventRow[]>('/data/iphone/announcement-events.json',setAnnouncements)
    void load<SalesRow[]>('/data/iphone/sales-history.json',setSales)
    fetch('/data/iphone/original-2017.html').then(r => { if (!r.ok) throw Error(String(r.status)); return r.text() }).then(html => { if (active) setOriginalHtml(html) }).catch(() => { if (active) setErrors(v => [...v, 'Original article could not load']) })
    return () => { active = false }
  },[])
  const valid = useMemo(() => announcements.filter(row => typeof row.returns?.[horizon] === 'number'),[announcements,horizon])
  const mean = valid.length ? valid.reduce((a,r)=>a+(r.returns?.[horizon] ?? 0),0)/valid.length : null
  const paired = valid.filter(row => typeof row.benchmark?.[horizon] === 'number')
  const meanBenchmark = paired.length ? paired.reduce((a,r)=>a+(r.benchmark?.[horizon] ?? 0),0)/paired.length : null
  const meanExcess = paired.length ? paired.reduce((a,r)=>a+(r.returns?.[horizon] ?? 0)-(r.benchmark?.[horizon] ?? 0),0)/paired.length : null
  return <main className="tni-iphone">
    <nav className="tni-iphone-crumb"><a href="/">Home</a> / <a href="/research/">Research</a> / Apple iPhone</nav>
    <header className="tni-iphone-hero"><p className="tni-iphone-eyebrow">TRADINGNINVESTMENT · HISTORICAL STOCK RESEARCH</p><h1>iPhone Releases & Apple Stock Performance</h1>
<div className="tni-iphone-introduction">
  <p>
    The iPhone brought the world into people's hands, transforming how
    humanity communicates, works, accesses information, and connects.
    Nearly two decades after its introduction in 2007, its influence
    extends far beyond technology, reshaping everyday life and creating
    an entirely new digital economy.
  </p>
  <p>
    The iPhone also transformed Apple into a global financial powerhouse.
    Apple became the first publicly traded U.S. company to reach a $1
    trillion market capitalization and held the position of the world's
    most valuable company for extended periods. We now examine how this
    revolutionary product reshaped Apple's revenue, profitability, and
    long-term market value.
  </p>
</div>
<p>How has AAPL performed after iPhone announcements? What happens when reported iPhone sales exceed or miss expectations? Explore the evidence without confusing correlation with causation.</p><div className="tni-iphone-links"><a href="#timeline">2018–2026 timeline ↓</a><a href="#announcements">Announcement study ↓</a><a href="#sales">Sales impact ↓</a><a href="#original">Original research ↓</a></div></header>
    <section id="timeline"><p className="tni-iphone-eyebrow">01 / VERIFIED APPLE ANNOUNCEMENTS</p><h2>iPhone generations, 2018–2026</h2><p>Announcement dates and product changes below are sourced directly from Apple Newsroom. These are product milestones, not evidence of a positive or negative stock-market reaction.</p><div className="tni-iphone-timeline">{announcements.filter(row => row.description).map(row => <article className="tni-iphone-milestone" key={row.date}><time dateTime={row.date}>{row.date}</time><div><h3>{row.model}</h3><p>{row.description}</p><a href={row.source} target="_blank" rel="noopener noreferrer">Apple announcement ↗</a></div></article>)}</div></section>
    <section id="announcements"><p className="tni-iphone-eyebrow">02 / EVENT STUDY</p><h2>After the announcement</h2><p>Returns are measured from the last closing price before the announcement to the closing price at each horizon. The 3-, 6- and 12-month horizons use 63, 126 and 252 trading sessions.</p><div className="tni-iphone-tabs" aria-label="Return horizon">{horizons.map(([key,label])=><button key={key} aria-pressed={horizon===key} onClick={()=>setHorizon(key)} title={label}>{key}</button>)}</div><div className="tni-iphone-stat"><span>Average AAPL return · {horizon}</span><strong>{fmt(mean)}</strong><small>{valid.length} verified observations in selected window</small></div><div className="tni-iphone-summary-grid"><div><span>Average AAPL</span><strong>{fmt(mean)}</strong></div><div><span>Average S&amp;P 500</span><strong>{fmt(meanBenchmark)}</strong></div><div><span>Average excess</span><strong>{fmt(meanExcess)}</strong></div><div><span>Paired observations</span><strong>{paired.length}</strong></div></div><AnnouncementChart rows={announcements} horizon={horizon} /><h3 className="tni-iphone-table-heading">Detailed announcement-return table · {horizon}</h3><div className="tni-iphone-table"><table data-tni-readable-table="data"><thead><tr><th>iPhone</th><th>Announcement</th><th>AAPL</th><th>S&P 500</th><th>Excess</th><th>Source</th></tr></thead><tbody>{announcements.length ? announcements.map(row=>{const a=row.returns?.[horizon];const b=row.benchmark?.[horizon];return <tr key={row.date+row.model}><td>{row.model}</td><td>{row.date}</td><td>{fmt(a)}</td><td>{fmt(b)}</td><td>{fmt(a != null && b != null ? a-b : null)}</td><td>{row.source ? <a href={row.source} rel="noopener noreferrer" target="_blank">Reference ↗</a> : 'Pending'}</td></tr>}) : <tr><td colSpan={6}>Historical announcement returns will appear after source verification and price-data processing.</td></tr>}{paired.length > 0 && <tr className="tni-iphone-average-row"><th scope="row">Sample average</th><td>N = {paired.length}</td><td>{fmt(paired.reduce((sum,r)=>sum+(r.returns?.[horizon] ?? 0),0)/paired.length)}</td><td>{fmt(meanBenchmark)}</td><td>{fmt(meanExcess)}</td><td>Calculated</td></tr>}</tbody></table></div></section>
    <section id="sales"><p className="tni-iphone-eyebrow">03 / SALES & EARNINGS</p><h2>Did iPhone sales move Apple shares?</h2><p>Quarterly iPhone revenue growth and the surprise relative to analyst consensus are different metrics. Stock reactions are measured around the earnings publication, not assigned to iPhone sales alone.</p><div className="tni-iphone-table"><table data-tni-readable-table="data"><thead><tr><th>Quarter</th><th>Reported</th><th>iPhone revenue</th><th>YoY growth</th><th>Sales surprise</th><th>AAPL reaction</th><th>Source</th></tr></thead><tbody>{sales.length ? sales.map(row=><tr key={row.quarter}><td>{row.quarter}</td><td>{row.reportDate}</td><td>{row.revenueBillion == null ? 'Not available' : `$${row.revenueBillion.toFixed(3)}B`}</td><td>{fmt(row.revenueBillion != null && row.priorYearBillion ? (row.revenueBillion/row.priorYearBillion-1)*100 : null)}</td><td>{fmt(row.revenueBillion != null && row.consensusBillion ? (row.revenueBillion/row.consensusBillion-1)*100 : null)}</td><td>{fmt(row.reaction)}</td><td>{row.source ? <a href={row.source} rel="noopener noreferrer" target="_blank">Filing ↗</a> : 'Pending'}</td></tr>) : <tr><td colSpan={7}>No verified sales observations loaded.</td></tr>}</tbody></table></div><p className="tni-iphone-note">Apple's earnings releases also contain services revenue, margins, guidance and other information. These can affect AAPL simultaneously; observed returns are not a causal estimate of iPhone sales alone.</p></section>
    <section id="original"><p className="tni-iphone-eyebrow">04 / ORIGINAL 2017 RESEARCH</p><h2>New iPhone Release and Apple Stock Performance Year Over Year</h2><p className="tni-iphone-note">Originally published September 18, 2017 · Last updated September 25, 2017. The following is the historical article, preserved as originally written. Its interpretations and calendar-year figures reflect the original publication, not newly verified event-study results.</p>{originalHtml ? <div onErrorCapture={event => { const target = event.target; if (target instanceof HTMLImageElement) { const fallback = target.dataset.archiveFallback; if (fallback && !target.dataset.triedArchive) { target.dataset.triedArchive = 'yes'; target.removeAttribute('srcset'); target.src = fallback; } else { target.hidden = true; const note = target.parentElement?.parentElement?.querySelector<HTMLElement>('.tni-iphone-chart-missing'); if (note) note.hidden = false; } } }} dangerouslySetInnerHTML={{__html:originalHtml}} /> : <p>Loading original historical article…</p>}</section>
    {errors.length > 0 && <p className="tni-iphone-note" role="status">Some research data could not load. Verify the data files are deployed.</p>}
    <footer className="tni-iphone-footer">Methodology: price returns, not proof of announcement-driven causality. Missing data is shown as unavailable. Historical outcomes do not predict future performance.</footer>
  </main>
}
