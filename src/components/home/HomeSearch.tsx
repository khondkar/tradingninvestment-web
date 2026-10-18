import { useEffect, useRef, useState } from 'react'
import { researchItems } from '../../research/discovery'
import './HomeTop.css'

const tools = [
  {title: 'Stock Market Today', path: '/stock-market-today/'},
  {title: 'S&P 500 Heatmap', path: '/stock-market-today/heatmap/'},
  {title: 'Sector Health', path: '/stock-market-today/sector-health/'},
  {title: 'Earnings Calendar', path: '/stock-market-today/earnings-calendar/'},
  {title: 'Leveraged ETF Scanner', path: '/research/scanners/leveraged-etf/'},
]
const entries = [...tools, ...researchItems.map(item => ({title: item.title, path: item.path}))]
export default function HomeSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const normalized = query.trim().toLowerCase()
  const results = normalized ? entries.filter(item => `${item.title} ${item.path}`.toLowerCase().includes(normalized)).slice(0, 8) : tools
  useEffect(() => { if (open) input.current?.focus() }, [open])
  useEffect(() => {
    function close(event: MouseEvent) { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])
  return <div className="tni-home-search" ref={root} onKeyDown={event => {if(event.key === 'Escape') {setOpen(false);toggle.current?.focus()}}}>
    <button className="tni-home-search-toggle" ref={toggle} type="button" aria-label="Search TradingNInvestment" aria-expanded={open} aria-controls="tni-home-search-panel" onClick={() => {setOpen(!open);document.querySelector<HTMLDetailsElement>('.tni-home-site .tni-mobile-menu')?.removeAttribute('open')}}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/></svg>
    </button>
    {open && <section id="tni-home-search-panel" className="tni-home-search-panel" aria-label="Site search">
      <form role="search" onSubmit={event => {event.preventDefault(); if(results[0]) window.location.assign(results[0].path)}}><label htmlFor="tni-home-search-input">Search research and market tools</label><div><input ref={input} id="tni-home-search-input" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Articles, ETFs, market history…" autoComplete="off"/><button type="submit" disabled={!results.length}>Open first result →</button></div></form>
      <p className="tni-home-search-status" role="status">{normalized ? `${results.length}${results.length === 8 ? '+' : ''} matching results` : 'Popular market tools'}</p>
      <ul>{results.map((item, i) => <li key={`${item.path}-${i}`}><a href={item.path}>{item.title}<span aria-hidden="true">↗</span></a></li>)}</ul>
      {!results.length && <p>No matching pages. Try a ticker, “returns” or “earnings”.</p>}
    </section>}
  </div>
}
