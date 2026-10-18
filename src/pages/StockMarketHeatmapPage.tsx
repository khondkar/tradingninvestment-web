import MarketBenchmarkStrip from '../components/market/MarketBenchmarkStrip'
import MarketSectionNavigation from '../components/market/MarketSectionNavigation'
import { useMemo, useRef, useState, useEffect } from 'react'
import SP500DailyHeatmap, { StockDetails, formatReturn } from '../components/market/SP500DailyHeatmap'
import { useMarketTodaySnapshot, type MarketRecord } from '../hooks/useMarketTodaySnapshot'
import './StockMarketHeatmapPage.css'

export default function StockMarketHeatmapPage() {
  const snapshot = useMarketTodaySnapshot()
  const [sector, setSector] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<MarketRecord | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const stocks = useMemo(() => snapshot.constituents.filter(s => Number.isFinite(s.change_pct) && Number.isFinite(s.price)), [snapshot.constituents])
  const sectors = useMemo(() => [...new Set(stocks.map(s => s.sector))].sort(), [stocks])
  const gainers = useMemo(() => stocks.filter(s => s.change_pct > 0).sort((a, b) => b.change_pct - a.change_pct).slice(0, 5), [stocks])
  const losers = useMemo(() => stocks.filter(s => s.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct).slice(0, 5), [stocks])
  useEffect(() => { if (selected && !dialog.current?.open) dialog.current?.showModal() }, [selected])
  useEffect(() => {
    function onKey(event: KeyboardEvent) { if (event.key === 'Escape') setExpanded(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  function movers(title: string, rows: MarketRecord[], loss = false) {
    const maximum = Math.max(1, ...rows.map(s => Math.abs(s.change_pct)))
    return <section className={`tni-hm-mover${loss ? ' is-loss' : ''}`}>
      <h2><i />{title} <small>· S&amp;P 500</small></h2>
      <div className="tni-hm-stocks">{rows.map(s => <button type="button" className="tni-hm-stock" key={s.ticker} onClick={() => setSelected(s)} aria-label={`${s.company}, ${formatReturn(s.change_pct)}, view details`}>
        <strong>{s.ticker}</strong><span className="tni-hm-bar"><span style={{width: `${Math.abs(s.change_pct) / maximum * 100}%`}} /></span><b>{formatReturn(s.change_pct)}</b>
      </button>)}{!rows.length && <p>No {loss ? 'declining' : 'advancing'} stocks in this snapshot.</p>}</div>
    </section>
  }
  return <div className={`tni-hm-layout${expanded ? ' is-expanded' : ''}`}>
    <MarketSectionNavigation active="/stock-market-today/heatmap/" />
    <main className="tni-hm-main">
      <div className="tni-hm-crumb"><a href="/stock-market-today/">Stock Market Today</a> › S&amp;P 500 Heatmap</div>
      <MarketBenchmarkStrip benchmarks={snapshot.benchmarks} />
      <h1>S&amp;P 500 Heatmap</h1>
      <p className="tni-hm-subtitle">Find the market’s biggest winners and losers in 10 seconds, then explore stocks by sector.</p>
      <p className="tni-hm-status">Snapshot: {snapshot.generated_at_et ? new Date(snapshot.generated_at_et).toLocaleString('en-US', {timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'}) + ' ET' : 'Unavailable'} · {stocks.length} stocks · Data may be delayed</p>
      <div className="tni-hm-movers">{movers('Top 5 Gainers', gainers)}{movers('Top 5 Losers', losers, true)}</div>
      <section className="tni-hm-promotion tni-hm-tradingview-cta" aria-labelledby="tni-tradingview-title">
        <div className="tni-tv-copy"><span className="tni-tv-eyebrow">GO DEEPER WITH ADVANCED CHARTS</span><h2 id="tni-tradingview-title">See the move. Explore the chart.</h2><p>Explore technical indicators and advanced charts on TradingView.</p></div>
        <a href="https://www.tradingview.com/?aff_id=1172820" target="_blank" rel="sponsored noopener noreferrer">Analyze on TradingView <span aria-hidden="true">↗</span></a>
        <small className="tni-tv-disclosure">Affiliate link—we may earn a commission if you purchase.</small>
      </section>
      <div className="tni-hm-section-head"><h2>Explore the Heatmap</h2><span>Daily performance</span></div>
      <div className="tni-hm-controls"><label>Sector<select value={sector} onChange={e => setSector(e.target.value)}><option value="all">All {sectors.length} sectors</option>{sectors.map(s => <option key={s}>{s}</option>)}</select></label><span className="tni-hm-period" aria-label="Timeframe: one day">1D</span><button type="button" aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? '↙ Exit expanded view' : '⛶ Expand heatmap'}</button></div>
      <SP500DailyHeatmap stocks={stocks} sector={sector} onSelect={setSelected} />
      <section className="tni-hm-guide"><h2>How to Read the S&amp;P 500 Heatmap</h2><p>Green indicates a gain versus the previous close; red indicates a decline. Stronger colors represent larger moves. Tile size reflects absolute daily price movement within each sector, not company market value.</p><p>Choose a sector to inspect its stocks. Hover on desktop or tap a tile to view the latest available price, daily change, sector and industry. Sector percentages are equal-weight averages of available stock returns.</p><p>Market data may be delayed. Price movements do not constitute investment recommendations.</p></section>
    </main>
    <dialog ref={dialog} className="tni-hm-dialog" aria-labelledby="tni-hm-detail-title" onClose={() => setSelected(null)} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close() }}>
      <button type="button" className="tni-hm-close" onClick={() => dialog.current?.close()} aria-label="Close stock details">✕</button>
      {selected && <StockDetails stock={stocks.find(s => s.ticker === selected.ticker) ?? selected} titleId="tni-hm-detail-title" />}
    </dialog>
  </div>
}
