import { lazy, Suspense, useMemo, useState } from 'react'
import candidates from './leveraged-etf-candidates.json'
import AllLeveragedEtfsTable from './AllLeveragedEtfsTable'
import fourEtfMetrics from './four-etf-metrics.json'
import './LeveragedEtfScannerPage.css'
import './ScannerFundDetails.css'
import ScannerFundDetails from './ScannerFundDetails'
import { scannerResearchProfiles as profiles } from './scannerResearchProfiles'
import snxxMonthly from '../data/charts/snxxSndkMonthlyComparison.json'

import './EtfComparison.css'
const EtfComparison = lazy(() => import('./EtfComparison'))

type Fund = { ticker: string; name: string; exposure: string; direction: string; leverage: number | null; category: string; verified: boolean }
const funds = candidates as Fund[]
const snxxResearchPath = '/snxx-etf/'
const snxxMonths = snxxMonthly.months
const snxxLatest = snxxMonths[snxxMonths.length - 1]
const snxxPct = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toFixed(2)}%`


type Metrics = { aumBillion: number | null; expenseRatioPct: number | null; avgVolumeMillion: number | null; avgVolumePeriod: string | null; lastVolumeMillion: number | null; lastVolumeDate: string | null; asOf: string; sources: string[] }
const metrics = fourEtfMetrics as Record<string, Metrics>
const metricText = (n: number | null, suffix: string, decimals = 2) => n == null ? '—' : `${n.toFixed(decimals)}${suffix}`
const ScannerMetrics = ({ ticker }: { ticker: string }) => {
  const m = metrics[ticker]
  if (!m) return null
  return <div className="tni-les-metrics" aria-label={`${ticker} ETF market metrics`}>
    <div><small>AUM</small><strong>{metricText(m.aumBillion, 'B')}</strong></div>
    <div><small>Expense ratio</small><strong>{metricText(m.expenseRatioPct, '%')}</strong></div>
    <div><small>Avg. volume{m.avgVolumePeriod ? ` (${m.avgVolumePeriod})` : ''}</small><strong>{metricText(m.avgVolumeMillion, 'M')}</strong></div>
    <div><small>Last-session volume</small><strong>{metricText(m.lastVolumeMillion, 'M')}</strong></div>
    <p>Snapshot {m.asOf}{m.lastVolumeDate ? ` · Volume ${m.lastVolumeDate}` : ''} · Not live · <a href={m.sources[0]} target="_blank" rel="noopener noreferrer">Sources ↗</a></p>
  </div>
}

export default function LeveragedEtfScannerPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [comparing, setComparing] = useState(false)
  const toggleCompare = (ticker: string) => setSelected(current => current.includes(ticker) ? current.filter(t => t !== ticker) : current.length < 4 ? [...current, ticker] : current)
  const [search, setSearch] = useState('')
  const [direction, setDirection] = useState('All')
  const [leverage, setLeverage] = useState('All')
  const [sort, setSort] = useState('coverage')
  const [category, setCategory] = useState('All')
  const [visibleCount, setVisibleCount] = useState(30)
  const [details, setDetails] = useState<string | null>(null)
  const [filters, setFilters] = useState(false)
  const results = useMemo(() => funds.filter(f => {
    const q = search.trim().toLowerCase()
    return (!q || `${f.ticker} ${f.name} ${f.exposure} ${f.category} ${profiles[f.ticker]?.name ?? ''} ${profiles[f.ticker]?.leveragedEtf?.issuer ?? ''}`.toLowerCase().includes(q)) &&
      (direction === 'All' || f.direction === direction) &&
      (leverage === 'All' || String(f.leverage) === leverage) &&
      (category === 'All' || f.category === category)
  }).sort((a,b) => sort === 'coverage' ? Number(Boolean(profiles[b.ticker]) || b.ticker === 'SNXX')-Number(Boolean(profiles[a.ticker]) || a.ticker === 'SNXX') || a.ticker.localeCompare(b.ticker) : sort === 'name' ? a.name.localeCompare(b.name) : sort === 'leverage' ? (b.leverage ?? -1)-(a.leverage ?? -1) || a.ticker.localeCompare(b.ticker) : a.ticker.localeCompare(b.ticker)), [search,direction,leverage,sort,category])
  const visible = results.slice(0,visibleCount)
  const reset = () => {setSearch('');setDirection('All');setLeverage('All');setCategory('All');setSort('coverage');setDetails(null);setVisibleCount(30)}
  return <main className="tni-les">
    <section className="tni-les-hero"><div className="tni-les-wrap"><p className="tni-les-kicker">TNI / RESEARCH / ETF SCANNERS</p><h1>Leverage <em>Decoded.</em></h1><p>Find your exposure. Understand the risk.</p><span className="tni-les-subline">Leveraged & inverse ETF explorer</span></div></section>
    <div className="tni-les-wrap tni-les-content">
      <div className="tni-les-intro"><div><p className="tni-les-kicker tni-les-ink">ETF INTELLIGENCE</p><h2>Explore leveraged ETFs</h2><p>Explore fund profiles and saved return history. Detailed research is available for TQQQ, SOXL, NVDL and TSLL.</p></div><span className="tni-les-count">{results.length} matches</span></div>
      <aside className="tni-compare-intro"><div><strong>Compare ETFs side by side</strong><p>Select 2–4 funds to explore costs, exposure and saved performance. Your filters stay in place.</p></div></aside>
      <label className="tni-les-search-label" htmlFor="tni-les-search">Search ETFs</label><input id="tni-les-search" className="tni-les-search" type="search" placeholder="Ticker, fund, index or sector…" value={search} onChange={e=>{setSearch(e.target.value);setVisibleCount(30)}} />
      <div className="tni-les-pills" role="group" aria-label="Direction filter">{['All','Long','Inverse'].map(d=><button key={d} type="button" aria-pressed={direction===d} className={direction===d?'selected':''} onClick={()=>{setDirection(d);setVisibleCount(30)}}>{d==='All'?'All ETFs':d==='Long'?'↗ Long':'↘ Inverse'}</button>)}</div>
      <div className="tni-les-toolbar"><button className="tni-les-filter-button" type="button" aria-expanded={filters} aria-controls="tni-les-filters" onClick={()=>setFilters(v=>!v)}>☷ Filters {filters?'−':'+'}</button><label>Sort <select value={sort} onChange={e=>{setSort(e.target.value);setVisibleCount(30)}}><option value="coverage">Research data first</option><option value="ticker">Ticker A–Z</option><option value="name">Fund name</option><option value="leverage">Leverage (high first)</option></select></label></div>
      {filters&&<div className="tni-les-filters" id="tni-les-filters"><label>Leverage factor<select value={leverage} onChange={e=>{setLeverage(e.target.value);setVisibleCount(30)}}><option value="All">All factors</option><option value="2">2×</option><option value="3">3×</option></select></label><label>Asset class<select value={category} onChange={e=>{setCategory(e.target.value);setVisibleCount(30)}}>{['All','Indexes','Sectors','Stocks','Bonds','Other'].map(c=><option key={c} value={c}>{c}</option>)}</select></label><button type="button" onClick={reset}>Clear filters</button><p className="tni-les-filter-note">Filters use preliminary labels. Candidates with unknown classifications only appear when their filters are set to All.</p></div>}
      <p className="tni-les-status" role="status">Showing {visible.length} of {results.length} candidates · 4 with saved research</p>
      <div className="tni-les-list">{visible.map(f=><article className="tni-les-card" key={f.ticker}><div className="tni-les-card-head"><div><h3>{f.ticker}</h3><p>{profiles[f.ticker]?.name ?? (f.name !== f.ticker ? f.name : 'Fund profile not yet available')}</p></div><span className={'tni-les-tag '+(f.direction==='Long'?'long':f.direction==='Inverse'?'inverse':'unknown')}>{profiles[f.ticker] ? 'Research data' : f.ticker === 'SNXX' ? 'Monthly research' : f.name !== f.ticker ? 'Preliminary' : 'Unverified'}</span></div><label className="tni-compare-select"><input type="checkbox" aria-label={`Compare ${f.ticker}`} checked={selected.includes(f.ticker)} disabled={selected.length===4&&!selected.includes(f.ticker)} onChange={()=>toggleCompare(f.ticker)} />Compare</label><ScannerMetrics ticker={f.ticker} /><div className="tni-les-card-bottom"><span>{profiles[f.ticker]?.leveragedEtf?.leverageLabel ?? (f.ticker === 'SNXX' ? '2× long · daily objective' : f.leverage ? `${f.leverage}× ${f.direction} · preliminary` : 'Ticker only')}</span><button type="button" aria-expanded={details===f.ticker} aria-controls={`fund-${f.ticker}`} onClick={()=>setDetails(details===f.ticker?null:f.ticker)}>{details===f.ticker?'Hide details ↑':'Details ↗'}</button></div>{details===f.ticker&&<div className="tni-les-detail" id={`fund-${f.ticker}`}>{profiles[f.ticker] ? <ScannerFundDetails key={f.ticker} ticker={f.ticker} /> : f.ticker === 'SNXX' ? <div className="tni-les-research-detail">
  <p className="tni-les-snapshot">Saved TNI monthly research · Not a live quote</p>
  <h4>Fund profile</h4>
  <dl>
    <div><dt>Fund</dt><dd>Tradr 2X Long SNDK Daily ETF</dd></div>
    <div><dt>Issuer</dt><dd>Tradr ETFs</dd></div>
    <div><dt>Daily objective</dt><dd>2× long</dd></div>
    <div><dt>Inception</dt><dd>2026-01-26</dd></div>
  </dl>
  <p>Seeks two times (200%) the daily percentage change of Sandisk Corporation (SNDK), before fees and expenses.</p>
  <p>The fund is actively managed and uses derivatives, including swaps and options, to pursue leveraged daily exposure to SNDK. Its exposure is reset daily, so performance over longer holding periods may differ materially from twice the underlying stock's return.</p>
  <details className="tni-les-nested">
    <summary>Structure &amp; leverage history</summary>
    <ul>
      <li>Underlying exposure: Sandisk Corporation (SNDK).</li>
      <li>Daily leverage objective: 200% of SNDK's daily performance, before fees and expenses.</li>
      <li>Derivative exposure may include swaps and listed options; direct equity holdings may also be used.</li>
      <li>Compounding, volatility and daily rebalancing affect multi-day returns.</li>
    </ul>
  </details>
  <h4>Monthly returns</h4>
  <p>Monthly performance compared with underlying SNDK. Leveraged daily objectives do not imply a fixed monthly return multiple.</p>
  <dl>
    <div><dt>Comparison</dt><dd>SNXX vs SNDK</dd></div>
    <div><dt>Monthly observations</dt><dd>{snxxMonths.length}</dd></div>
    {snxxLatest && <>
      <div><dt>Latest recorded month</dt><dd>{snxxLatest.month}</dd></div>
      <div><dt>SNXX return</dt><dd>{snxxPct(snxxLatest.snxx_return_pct)}</dd></div>
      <div><dt>SNDK return</dt><dd>{snxxPct(snxxLatest.sndk_return_pct)}</dd></div>
      <div><dt>Difference</dt><dd>{snxxPct(snxxLatest.difference_pp)} percentage points</dd></div>
    </>}
  </dl>
  <div className="tni-les-detail-links">
    <a href={snxxResearchPath}>Full monthly returns &amp; charts ↗</a>
    <a href="https://www.tradretfs.com/snxx" target="_blank" rel="noopener noreferrer">Issuer fund page ↗</a>
  </div>
</div> : <><dl><div><dt>Ticker</dt><dd>{f.ticker}</dd></div>{f.name !== f.ticker && <><div><dt>Preliminary name</dt><dd>{f.name}</dd></div><div><dt>Preliminary exposure</dt><dd>{f.exposure}</dd></div><div><dt>Preliminary classification</dt><dd>{f.category} · {f.direction}</dd></div><div><dt>Preliminary daily target</dt><dd>{f.leverage == null ? 'Not recorded' : `${f.direction === 'Inverse' ? '−' : '+'}${f.leverage}×`}</dd></div></>}</dl><p>{f.name !== f.ticker ? 'These are unverified directory labels, not a validated fund profile.' : 'Only this ticker is stored in the current directory.'} No historical performance or market metrics are stored for this candidate yet.</p></>}</div>}</article>)}</div>
      {results.length===0&&<div className="tni-les-empty"><strong>No matching ETFs</strong><p>Try another ticker or clear your filters.</p><button onClick={reset}>Reset filters</button></div>}
      {visibleCount<results.length&&<button type="button" className="tni-les-more" onClick={()=>setVisibleCount(n=>n+30)}>Show {Math.min(30,results.length-visibleCount)} more ↓</button>}
      <aside className="tni-les-featured-history">
        <span className="tni-les-featured-label">FEATURED HISTORICAL RESEARCH</span>
        <h2>100 Years of Dow Jones History</h2>
        <p>
          Explore a century of market cycles, crashes, recoveries,
          and the events that shaped the Dow Jones Industrial Average.
        </p>
        <a href="https://tradingninvestment.com/100-years-dow-jones-industrial-average-djia-events-history-chart/">
          Explore 100 Years of Market History
          <span aria-hidden="true"> ↗</span>
        </a>
      </aside>

      <AllLeveragedEtfsTable selected={selected} onToggleCompare={toggleCompare} />

      <section className="tni-les-seo-guide" aria-labelledby="tni-les-guide-title" style={{
        margin: "48px 0 56px",
        padding: "clamp(22px, 4vw, 44px)",
        border: "1px solid #e1e7ed",
        borderRadius: 18,
        background: "#fff",
        color: "#172033",
        fontFamily: "inherit"
      }}>
        <p className="tni-les-kicker tni-les-ink">TNI ETF RESEARCH GUIDE</p>
        <h2 id="tni-les-guide-title" style={{fontSize:"clamp(26px,4vw,36px)",lineHeight:1.2}}>
          Understanding Leveraged ETFs
        </h2>
        <p style={{fontSize:"clamp(17px,2vw,19px)",lineHeight:1.8}}>
          Learn how daily leverage, compounding, fund costs and research coverage
          affect the comparison of leveraged and inverse exchange-traded funds.
        </p>

        <div style={{display:"grid",gap:28,marginTop:32}}>
          <section>
            <h3>How does daily leverage reset work?</h3>
            <p>
              Most leveraged ETFs seek a stated multiple of a benchmark's daily
              return, before fees and expenses. The objective generally resets
              each trading day rather than guaranteeing that multiple over
              weeks, months or years.
            </p>
            <p>
              Daily compounding makes longer-term returns path-dependent.
              Volatile markets can create performance differences even when
              the benchmark eventually returns to its starting value.
            </p>
          </section>

          <section>
            <h3>How to search, filter and compare leveraged ETFs</h3>
            <p>
              Search by ticker, fund name, exposure or category. Filter
              available classifications by long or inverse direction,
              leverage factor and asset class. Sort by research coverage,
              ticker, fund name or leverage.
            </p>
            <p>
              Select two to four ETFs using Compare, then open the
              side-by-side comparison. Filters remain in place while
              funds are selected. Missing research metrics are not
              estimated or presented as live quotes.
            </p>
          </section>

          <section>
            <h3>Scanner data sources and methodology</h3>
            <p>
              TradingNInvestment combines an ETF candidate directory,
              saved research profiles and available market-data snapshots.
              Displayed fields can include leverage, assets under
              management, expense ratios and trading volume.
            </p>
            <p>
              Data coverage and observation periods differ by fund.
              Some directory entries have preliminary or unverified
              classifications, and some may be inactive or non-leveraged.
              Review each fund's source links and snapshot dates.
            </p>
          </section>

          <section>
            <h3>What risks should investors consider?</h3>
            <p>
              Leverage magnifies daily market movements and potential losses.
              Inverse ETFs seek opposite daily exposure. Compounding,
              volatility, tracking differences, financing costs and
              fund expenses can affect multi-day performance.
            </p>
            <p>
              Compare the underlying exposure, daily objective, liquidity,
              fees and available historical evidence before interpreting
              results. This scanner is for research, not personalized
              investment advice.
            </p>
          </section>
        </div>
      </section>


      <nav className="tni-les-related-bottom" aria-label="Related market research">
        <div className="tni-les-related-bottom-heading">
          <span>CONTINUE EXPLORING · TNI RESEARCH</span>
          <h2>Explore More Market Research</h2>
          <p>Go deeper into historical market returns and monthly performance.</p>
        </div>

        <div className="tni-les-related-bottom-grid">
          <a href="https://tradingninvestment.com/average-stock-market-return/">
            <span className="tni-les-related-bottom-category">LONG-TERM MARKET RETURNS</span>
            <strong>Average Stock Market Return <span aria-hidden="true">↗</span></strong>
            <small>Understand long-term stock market performance, dividends, and inflation.</small>
          </a>

          <a href="https://tradingninvestment.com/sp-500-monthly-returns/">
            <span className="tni-les-related-bottom-category">HISTORICAL MARKET DATA</span>
            <strong>S&amp;P 500 Monthly Returns <span aria-hidden="true">↗</span></strong>
            <small>Explore monthly S&amp;P 500 performance and historical market patterns.</small>
          </a>
        </div>
      </nav>
      <aside className="tni-les-risk"><strong>Know the risk</strong><p>Leveraged and inverse ETFs generally target a multiple of a benchmark's <strong>daily</strong> return. Longer-term performance can differ substantially because of compounding, volatility, fees and tracking effects.</p></aside>
      <p className="tni-les-disclaimer">Saved research is available for four funds. Other entries contain preliminary labels or ticker candidates that may be inactive or non-leveraged. Snapshot dates vary by fund; this is not live market data.</p>
    </div>
    {selected.length>0&&<aside className="tni-compare-tray" aria-label="Selected ETFs"><p role="status">{selected.length} of 4 selected · {selected.length<2?'Select one more fund':selected.length===4?'Maximum reached — remove a fund to replace it':'Ready to compare'}</p><div className="tni-compare-chips">{selected.map(t=><button key={t} onClick={()=>toggleCompare(t)} aria-label={`Remove ${t}`}>{t} ×</button>)}</div><button onClick={()=>setSelected([])}>Clear all</button><button className="tni-compare-go" disabled={selected.length<2} onClick={()=>setComparing(true)}>Compare ({selected.length}) →</button></aside>}
    {comparing&&<Suspense fallback={<div className="tni-compare-tray" role="status">Loading comparison…<button onClick={()=>setComparing(false)}>Cancel</button></div>}><EtfComparison tickers={selected} onClose={()=>setComparing(false)} /></Suspense>}
  </main>
}
