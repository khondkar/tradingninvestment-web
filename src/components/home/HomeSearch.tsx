import { useEffect, useRef, useState } from 'react'
import { researchHubs, researchItems } from '../../research/discovery'
import './SiteSearch.css'
import trading from '../trading/routes.json'
import funded from '../trading/funded-routes.json'
import { equityScanners } from '../market/ScannerLinks'

const tools = [
  {title: 'Prediction Lab', path: 'https://app.tradingninvestment.com/prediction-lab', keywords: 'predction lab predictionlab QQQ SPY IWM forecast'},
  {title: 'TNI News Agent', path: 'https://app.tradingninvestment.com/live/news', keywords: 'live market news'},
  {title: 'Nasdaq Research', path: '/research/indexes/nasdaq/'},

  {title: 'Trading — Strategies, Patterns & Tools', path: '/trading/'},
  {title: 'Stock Market Today', path: '/stock-market-today/'},
  {title: 'S&P 500 Heatmap', path: '/stock-market-today/heatmap/'},
  {title: 'Sector Health', path: '/stock-market-today/sector-health/'},
  {title: 'Earnings Calendar', path: '/stock-market-today/earnings-calendar/'},
  {title: 'Leveraged ETF Scanner', path: '/research/scanners/leveraged-etf/'},
]
type Destination = {title: string; path: string; keywords?: string}
const catalog: Destination[] = [...tools, ...equityScanners, ...trading, ...funded,
  {title: 'Home', path: '/'}, {title: 'Research Library', path: '/research/'},
  {title: 'About TradingNInvestment', path: '/about/'},
  {title: 'Research Licensing', path: '/research-license/'},
  ...researchItems.map(item => ({title: item.title, path: item.path, keywords: item.symbol + ' ' + item.name})),
  ...researchHubs]
const entries = catalog.filter((entry, index) => catalog.findIndex(item => item.path === entry.path) === index)
function findMatches(query: string) {
  const terms = query.split(/\s+/)
  return entries.filter(item => {
    const text = (item.title + ' ' + item.path + ' ' + (item.keywords ?? '')).toLowerCase().replaceAll('-', ' ')
    return terms.every(term => text.includes(term))
  }).sort((a,b) => Number(b.title.toLowerCase().startsWith(query)) - Number(a.title.toLowerCase().startsWith(query)))
}
export default function HomeSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)
  const normalized = query.trim().toLowerCase()
  const results = normalized ? findMatches(normalized) : tools.slice(0,6)
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown',close)
    return () => document.removeEventListener('pointerdown',close)
  }, [])
  useEffect(() => {
    if (active >= 0) document.getElementById('tni-match-'+active)?.scrollIntoView({block:'nearest'})
  }, [active])
  return <div ref={root} className="tni-global-search" onBlur={e => {if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)}}>
    <form role="search" aria-label="Search TradingNInvestment" onSubmit={e => {
      e.preventDefault()
      const hit = results[active < 0 ? 0 : active]
      if (normalized && hit) window.location.assign(hit.path)
      else {input.current?.focus();setOpen(true)}
    }}>
      <label htmlFor="tni-site-query">Search TNI</label>
      <div className="tni-query-wrap">
        <input id="tni-site-query" ref={input} type="search" role="combobox" aria-autocomplete="list"
          aria-expanded={open} aria-controls="tni-site-results" aria-activedescendant={open && active>=0 ? 'tni-match-'+active : undefined}
          placeholder="Search Prediction Lab, Nasdaq, stocks…" value={query} autoComplete="off"
          onFocus={()=>setOpen(true)} onClick={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setActive(-1);setOpen(true)}}
          onKeyDown={e=>{
            if(e.key==='Escape'){e.preventDefault();setOpen(false);setActive(-1)}
            if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);setActive(i=>results.length ? (e.key==='ArrowDown' ? Math.min(i+1,results.length-1) : Math.max(0,i-1)) : -1)}
          }}/>
        <button type="submit" aria-label="Search"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg></button>
      </div>
    </form>
    <div className="tni-matches" hidden={!open}>
      <div role="status">{normalized ? results.length+' matching destinations' : 'Popular destinations'}</div>
      <ul id="tni-site-results" role="listbox" aria-label="Destinations">
        {results.map((item,i)=><li key={item.path} role="option" aria-selected={i===active} id={'tni-match-'+i}><a href={item.path}>{item.title}</a></li>)}
      </ul>
      {!results.length && <p>Try a ticker, “returns” or “news”.</p>}
    </div>
  </div>
}
