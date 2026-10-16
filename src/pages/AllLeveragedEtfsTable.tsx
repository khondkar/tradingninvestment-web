import { useMemo, useState } from 'react'
import candidates from './leveraged-etf-candidates.json'
import fourEtfMetrics from './four-etf-metrics.json'
import dailyMetrics from './leveraged-etf-daily-metrics.json'
import { scannerResearchProfiles as profiles } from './scannerResearchProfiles'
import './AllLeveragedEtfsTable.css'

type Fund = { ticker: string; name: string; exposure: string; direction: string; leverage: number | null; category: string; verified: boolean }
type Metric = { aumBillion: number | null; expenseRatioPct: number | null; lastVolumeMillion: number | null; lastVolumeDate: string | null; asOf: string; sources: string[] }
const funds = candidates as Fund[]
const metrics = fourEtfMetrics as Record<string, Metric>
type Daily = { price: number | null; changePct: number | null; volume: number | null; sessionDate: string | null; aum: number | null; expenseRatioPct: number | null; fundAsOf: string | null }
const daily = dailyMetrics.funds as Record<string, Daily>
const market = (ticker: string) => daily[ticker]
const fmtAum = (v: number | null | undefined) => v == null ? '—' : v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${Math.round(v).toLocaleString()}`
const fmtVol = (v: number | null | undefined) => v == null ? '—' : v >= 1e6 ? `${(v/1e6).toFixed(2)}M` : v >= 1e3 ? `${(v/1e3).toFixed(1)}K` : v.toLocaleString()

const issuerFor = (f: Fund) => {
  const fromProfile = profiles[f.ticker]?.leveragedEtf?.issuer
  if (fromProfile) return fromProfile
  const name = f.name.toLowerCase()
  if (name.includes('proshares')) return 'ProShares'
  if (name.includes('direxion')) return 'Direxion'
  if (name.includes('graniteshares')) return 'GraniteShares'
  if (name.includes('defiance')) return 'Defiance'
  if (name.includes('rex shares') || name.includes('rexshares')) return 'REX Shares'
  return '—'
}
const display = (v: number | null | undefined, unit: string) => v == null || !Number.isFinite(v) ? '—' : `${v.toFixed(2)}${unit}`
const sortValue = (f: Fund, key: string) => {
  const m = metrics[f.ticker]
  if (key === 'aum') return market(f.ticker)?.aum ?? (m?.aumBillion != null ? m.aumBillion * 1e9 : -1)
  if (key === 'volume') return market(f.ticker)?.volume ?? (m?.lastVolumeMillion != null ? m.lastVolumeMillion * 1e6 : -1)
  if (key === 'expense') return market(f.ticker)?.expenseRatioPct ?? m?.expenseRatioPct ?? -1
  if (key === 'leverage') return f.leverage ?? -1
  return 0
}
export default function AllLeveragedEtfsTable({selected = [], onToggleCompare}:{selected?:string[];onToggleCompare?:(ticker:string)=>void}) {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('All')
  const [sort, setSort] = useState('ticker')
  const [ascending, setAscending] = useState(true)
  const [limit, setLimit] = useState(30)
  const rows = useMemo(() => funds.filter(f => {
    const q = query.trim().toLowerCase()
    return (!q || `${f.ticker} ${f.name} ${f.exposure} ${issuerFor(f)}`.toLowerCase().includes(q)) && (kind === 'All' || f.direction === kind)
  }).sort((a, b) => {
    const cmp = sort === 'ticker' ? a.ticker.localeCompare(b.ticker) : sort === 'name' ? a.name.localeCompare(b.name) : sort === 'issuer' ? issuerFor(a).localeCompare(issuerFor(b)) : sortValue(a,sort)-sortValue(b,sort)
    return (ascending ? 1 : -1) * cmp || a.ticker.localeCompare(b.ticker)
  }), [query, kind, sort, ascending])
  const changeSort = (key: string) => { setAscending(sort === key ? !ascending : key === 'ticker' || key === 'name' || key === 'issuer'); setSort(key); setLimit(30) }
  return <section className="tni-etf-directory" aria-labelledby="tni-etf-directory-title">
    <div className="tni-etf-directory-heading"><div><p className="tni-etf-directory-kicker">TNI / ETF DIRECTORY</p><h2 id="tni-etf-directory-title">All Leveraged ETFs <span>{funds.length} candidates</span></h2><p>Search and compare the leveraged and inverse ETF tickers currently in TNI's directory.</p></div><span className="tni-etf-directory-dated">Saved snapshots · Not live</span></div>
    <div className="tni-etf-directory-tools"><label className="tni-etf-directory-search"><span className="sr-only">Search ETF directory</span><input type="search" placeholder="Search ticker, fund or issuer…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(30)}} /></label><label className="tni-etf-directory-select">Direction <select value={kind} onChange={e=>{setKind(e.target.value);setLimit(30)}}><option>All</option><option>Long</option><option>Inverse</option></select></label><label className="tni-etf-directory-select">Sort <select value={sort} onChange={e=>changeSort(e.target.value)}><option value="ticker">Ticker</option><option value="name">Fund name</option><option value="issuer">Issuer</option><option value="aum">AUM</option><option value="volume">Volume</option><option value="expense">Expense ratio</option><option value="leverage">Leverage</option></select></label></div>
    <div className="tni-etf-directory-scroll" role="region" aria-label="Leveraged ETF comparison table" tabIndex={0}><table><thead><tr>{onToggleCompare&&<th scope="col">Compare</th>}{[['ticker','Ticker'],['name','Fund name'],['issuer','Issuer'],['leverage','Leverage'],['aum','AUM'],['volume','Last volume'],['expense','Expense ratio']].map(([key,label])=><th key={key} scope="col"><button type="button" onClick={()=>changeSort(key)} aria-label={`Sort by ${label}`}>{label} {sort===key ? (ascending?'↑':'↓'):'↕'}</button></th>)}<th scope="col">Price</th><th scope="col">1D %</th></tr></thead><tbody>{rows.slice(0,limit).map(f=>{const m=metrics[f.ticker];const d=market(f.ticker);const issuer=issuerFor(f);return <tr key={f.ticker}>{onToggleCompare&&<td><label className="tni-compare-select"><input type="checkbox" aria-label={`Compare ${f.ticker} in directory`} checked={selected.includes(f.ticker)} disabled={selected.length===4&&!selected.includes(f.ticker)} onChange={()=>onToggleCompare(f.ticker)} /></label></td>}<th scope="row"><a href={profiles[f.ticker]?.canonicalPath || (f.ticker === 'SNXX' ? '/snxx-etf/' : `#fund-${f.ticker}`)} onClick={e=>{if(!profiles[f.ticker] && f.ticker !== 'SNXX') e.preventDefault()}}>{f.ticker}</a></th><td><span className="tni-etf-directory-name">{profiles[f.ticker]?.name || f.name}</span></td><td>{issuer}</td><td><span className={'tni-etf-directory-leverage '+(f.direction==='Inverse'?'inverse':'')}>{f.leverage ? `${f.direction==='Inverse'?'−':'+'}${f.leverage}×` : '—'}</span></td><td>{fmtAum(d?.aum ?? (m?.aumBillion != null ? m.aumBillion * 1e9 : null))}</td><td title={m?.lastVolumeDate ? `Session: ${m.lastVolumeDate}` : 'No verified session volume'}>{fmtVol(d?.volume ?? (m?.lastVolumeMillion != null ? m.lastVolumeMillion * 1e6 : null))}</td><td>{display(d?.expenseRatioPct ?? m?.expenseRatioPct,'%')}</td><td>{d?.price != null ? `$${d.price.toFixed(2)}` : '—'}</td><td style={{color:d?.changePct == null ? undefined : d.changePct >= 0 ? '#16835a' : '#c54b51'}}>{d?.changePct != null ? `${d.changePct >= 0 ? '+' : ''}${d.changePct.toFixed(2)}%` : '—'}</td></tr>})}</tbody></table></div>
    <div className="tni-etf-directory-footer"><p>Showing {Math.min(limit,rows.length)} of {rows.length} tickers · Blank metrics are unavailable, not zero.</p>{limit<rows.length&&<button type="button" onClick={()=>setLimit(n=>n+30)}>Show 30 more ↓</button>}</div>
    <p className="tni-etf-directory-note">Directory entries include preliminary and potentially inactive tickers. AUM, volume and fees currently appear only for the four-fund pilot where available; their snapshot dates and sources are in the cards above. Price and 1D change use the last available completed-session Yahoo research snapshot when available. Verify data licensing before public redistribution. Issuer is shown only when identifiable from existing profile/name data.</p>
  </section>
}
