import { useState } from 'react'
import dataset from '../../data/charts/uproVsTqqqComparison.json'
import { pairRanges, selectPairRange, pairStats, type PairRange } from '../../research/leveraged-etf/uproTqqqComparison'
import './UproTqqqComparison.css'

const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const pct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`
const label = (r: PairRange) => r === 'ALL' ? 'Common history' : r
const W=960, H=380, L=90, R=24, T=24, B=48
export default function UproTqqqComparison() {
  const [range, setRange] = useState<PairRange>('5Y')
  const [hover, setHover] = useState<number | null>(null)
  const rows = selectPairRange(dataset.data, range)
  const upro = pairStats(rows, 'upro'), tqqq = pairStats(rows, 'tqqq')
  if (!upro || !tqqq) return null
  const start = rows[0], end = rows[rows.length-1]
  const dates = rows.map(r => Date.parse(r.date))
  const values = rows.map(r => ({upro:10000*r.upro/start.upro,tqqq:10000*r.tqqq/start.tqqq}))
  const maximum = Math.max(10000, ...values.flatMap(v => [v.upro,v.tqqq]))*1.08
  const x = (i: number) => L+(dates[i]-dates[0])/(dates[dates.length-1]-dates[0])*(W-L-R)
  const y = (v: number) => T+(1-v/maximum)*(H-T-B)
  const active = Math.min(hover ?? rows.length-1, rows.length-1)
  return <section className="upro-pair" aria-labelledby="upro-tqqq-heading">
    <p className="upro-pair-eyebrow">COMPARE TWO LEVERAGED ETFs</p>
    <h2 id="upro-tqqq-heading">UPRO vs TQQQ: Returns, Drawdowns and Recovery</h2>
    <p>Compare actual fund performance over matching trading dates. Select a holding period to update the growth chart and risk figures. Adjusted closing prices account for distributions; results exclude personal taxes and trading costs.</p>
    <div className="upro-pair-downloads" aria-label="Download comparison research">
      <a href="/data/upro-tqqq-spy-comparison.csv" download="TNI-UPRO-TQQQ-SPY-comparison.csv">Download comparison data (CSV)</a>
      <a href="/images/social/upro-tqqq-spy-drawdown-og.png" download="TNI-UPRO-TQQQ-SPY-drawdowns.png">Download OG image (PNG)</a>
    </div>
    <p className="upro-pair-note">Downloads cover the full common history through {dataset.through}, independently of the selected chart period. The CSV contains UPRO, TQQQ and SPY adjusted closes, growth of $10,000 and drawdowns. The PNG is the same three-fund card used for social previews.</p>
    <div className="upro-pair-buttons" aria-label="Comparison period">{pairRanges.map(r => <button key={r} type="button" aria-pressed={range===r} disabled={selectPairRange(dataset.data,r).length<2} onClick={()=>{setRange(r);setHover(null)}}>{label(r)}</button>)}</div>
    <p><strong>{start.date} through {end.date}</strong> · $10,000 invested in each fund at the selected starting close.</p>
    <div className="upro-pair-legend"><span>UPRO <b>{money(values[active].upro)}</b></span><span>TQQQ <b>{money(values[active].tqqq)}</b></span><strong>{rows[active].date}</strong></div>
    <div className="upro-pair-chart"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Growth of $10,000: UPRO versus TQQQ from ${start.date} through ${end.date}`} onPointerMove={e=>{
      const rect=e.currentTarget.getBoundingClientRect();const px=(e.clientX-rect.left)/rect.width*W
      const ratio=Math.max(0,Math.min(1,(px-L)/(W-L-R)))
      const stamp=dates[0]+ratio*(dates[dates.length-1]-dates[0])
      let nearest=0;for(let i=1;i<dates.length;i++)if(Math.abs(dates[i]-stamp)<Math.abs(dates[nearest]-stamp))nearest=i
      setHover(nearest)
    }} onPointerLeave={()=>setHover(null)}>
      {[0,1,2,3,4].map(i=><g key={i}><line x1={L} x2={W-R} y1={y(maximum*i/4)} y2={y(maximum*i/4)} stroke="#c5d0df"/><text x={L-10} y={y(maximum*i/4)+5} textAnchor="end">{money(maximum*i/4)}</text></g>)}
      {[0,1,2,3,4].map(t=>{const i=Math.round(t*(rows.length-1)/4);return <text key={t} x={x(i)} y={H-14} textAnchor={t===0?'start':t===4?'end':'middle'}>{rows[i].date.slice(0,7)}</text>})}
      {(['upro','tqqq'] as const).map((key)=><polyline key={key} points={values.map((v,i)=>`${x(i).toFixed(2)},${y(v[key]).toFixed(2)}`).join(' ')} fill="none" stroke={key==='upro'?'#075ac8':'#a82538'} strokeWidth={3} strokeLinejoin="round"/>)}
      <line x1={x(active)} x2={x(active)} y1={T} y2={H-B} stroke="#10233f" strokeDasharray="5 4"/>
    </svg></div>
    <label className="upro-pair-slider">Explore date: {rows[active].date}<input type="range" min={0} max={rows.length-1} value={active} onChange={e=>setHover(Number(e.target.value))}/></label>
    <h3>Returns across holding periods</h3>
    <div className="upro-pair-scroll"><table><caption>Total return and annualized return over matching dates. Select a period above to explore its risks.</caption><thead><tr><th>Period</th><th>Start date</th><th>UPRO total</th><th>TQQQ total</th><th>UPRO annualized</th><th>TQQQ annualized</th></tr></thead><tbody>{pairRanges.map(r=>{
      const selected=selectPairRange(dataset.data,r),a=pairStats(selected,'upro'),b=pairStats(selected,'tqqq')
      return a&&b?<tr key={r} className={r===range?'upro-pair-selected':''}><th>{label(r)}</th><td>{selected[0].date}</td><td>{pct(a.total)}</td><td>{pct(b.total)}</td><td>{r==='YTD'?'—':pct(a.cagr)}</td><td>{r==='YTD'?'—':pct(b.cagr)}</td></tr>:null
    })}</tbody></table></div>
    <h3>{label(range)}: drawdown and recovery</h3>
    <div className="upro-pair-scroll"><table><thead><tr><th>Metric</th><th>UPRO</th><th>TQQQ</th></tr></thead><tbody>
      <tr><th>Ending value of $10,000</th><td>{money(upro.ending)}</td><td>{money(tqqq.ending)}</td></tr>
      <tr><th>Maximum drawdown</th><td>{pct(upro.drawdown)}</td><td>{pct(tqqq.drawdown)}</td></tr>
      <tr><th>Peak before deepest decline</th><td>{upro.peakDate}</td><td>{tqqq.peakDate}</td></tr>
      <tr><th>Drawdown low</th><td>{upro.troughDate}</td><td>{tqqq.troughDate}</td></tr>
      <tr><th>Recovery date</th><td>{upro.recoveryDate??'Not recovered within period'}</td><td>{tqqq.recoveryDate??'Not recovered within period'}</td></tr>
      <tr><th>Low to recovery (calendar days)</th><td>{upro.lowToRecovery??'Not recovered'}</td><td>{tqqq.lowToRecovery??'Not recovered'}</td></tr>
      <tr><th>Peak to recovery (calendar days)</th><td>{upro.underwater??'Not recovered'}</td><td>{tqqq.underwater??'Not recovered'}</td></tr>
    </tbody></table></div>
    <p className="upro-pair-note">Drawdowns reset at the selected starting date. Recovery follows each fund’s deepest decline within that window and may involve different peaks and lows. “Not recovered” means the prior peak was not regained by {dataset.through}. Common history starts {dataset.first_date}; no pre-inception returns are simulated. Calendar-period cutoffs use the last available common trading close on or before the cutoff. Annualized returns use elapsed calendar days; YTD is not annualized.</p>
    <p className="upro-pair-note">Source: Yahoo Finance adjusted closes. Historical returns are not forecasts.</p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Dataset',
      name: 'UPRO, TQQQ and SPY historical comparison data',
      description: 'Common-date adjusted closing prices, growth of $10,000 and drawdowns from previous peaks. Source: Yahoo Finance. Historical returns are not forecasts.',
      url: 'https://tradingninvestment.com/upro-etf/',
      temporalCoverage: `${dataset.first_date}/${dataset.through}`,
      creator: { '@type': 'Organization', name: 'TradingNInvestment', url: 'https://tradingninvestment.com/' },
      distribution: { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: 'https://tradingninvestment.com/data/upro-tqqq-spy-comparison.csv' }
    }) }} />
  </section>
}
