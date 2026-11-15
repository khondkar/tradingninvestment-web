import { shareIndexes as indexes, downloadReturnCard } from './indexReturnShareCard'
import { useState } from 'react'
import { line, scaleLinear } from 'd3'
import monthly from '../../data/charts/indexComparisonMonthlyCloses.json'

const closes = monthly as [string, number, number, number][]
const last = closes.at(-1)![0]
const yearOf = (date: string) => Number(date.slice(0, 4))
const years = Array.from({ length: yearOf(last) - 1971 }, (_, i) => 1972 + i)
const percent = (n: number) => (n > 0 ? '+' : '') + n.toFixed(2) + '%'

export default function IndexCumulativeReturns() {
  const [exporting, setExporting] = useState(false)
  const [downloadError, setDownloadError] = useState(false)
  const [start, setStart] = useState(2020)
  const [end, setEnd] = useState(yearOf(last))
  const [inspect, setInspect] = useState('')
  const base = closes.find(row => row[0].startsWith((start - 1) + '-12'))!
  const rows = closes.filter(row => row === base || (yearOf(row[0]) >= start && yearOf(row[0]) <= end))
  const returns = rows.map(row => indexes.map((_, i) => (Number(row[i + 1]) / Number(base[i + 1]) - 1) * 100))
  const found = rows.findIndex(row => row[0] === inspect)
  const active = found < 0 ? rows.length - 1 : found
  const x = scaleLinear([0, rows.length - 1], [65, 695])
  const y = scaleLinear([Math.min(0, ...returns.flat()) - 1, Math.max(0, ...returns.flat()) + 1], [223, 15]).nice()
  function pointer(event: React.PointerEvent<SVGSVGElement>) {
    const svg = event.currentTarget
    const matrix = svg.getScreenCTM()
    if (!matrix) return
    const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    setInspect(rows[Math.round(x.copy().clamp(true).invert(local.x))][0])
  }
  return <section id="index-cumulative-comparison">
    <h2>Cumulative returns of the S&amp;P 500, Dow and Nasdaq</h2>
    <p>Each index starts at 0% at the final close before the selected start year. The lines track price gains and losses through each month’s last available close. They exclude dividends.</p>
    <div className="tni-index-values">
      <label>From <select value={start} onChange={e => { setStart(+e.target.value); setInspect('') }}>{years.filter(k => k <= end).map(k => <option key={k}>{k}</option>)}</select></label>
      <label>Through <select value={end} onChange={e => { setEnd(+e.target.value); setInspect('') }}>{years.filter(k => k >= start).map(k => <option key={k} value={k}>{k === yearOf(last) ? k + ' YTD' : k}</option>)}</select></label>
    </div>
    <p>Baseline <strong>{base[0]}</strong> · Latest close in range <strong>{rows.at(-1)![0]}</strong></p>
    <svg viewBox="0 0 720 255" role="img" aria-label="Cumulative index price returns by month" onPointerDown={pointer} onPointerMove={pointer} style={{touchAction:'pan-y'}}>
      {y.ticks(5).map(n => <g key={n}><line x1={65} x2={695} y1={y(n)} y2={y(n)} stroke={n === 0 ? '#465564' : '#cbd4dd'}/><text x={58} y={y(n)+4} textAnchor="end">{n.toLocaleString()}%</text></g>)}
      {Array.from({length:4}, (_,i) => Math.round(i * (rows.length-1)/3)).map((k,i) => <text key={k} x={x(k)} y={247} textAnchor={i === 0 ? 'start' : i === 3 ? 'end' : 'middle'}>{rows[k][0].slice(0,7)}</text>)}
      {indexes.map((s,i) => <path key={s.name} d={line<number[]>().x((_,k)=>x(k)).y(v=>y(v[i]))(returns) ?? ''} fill="none" stroke={s.color} strokeWidth={3}/>)}
      <line x1={x(active)} x2={x(active)} y1={15} y2={223} stroke="#485260" strokeDasharray="4 4"/>
      {indexes.map((s,i) => <circle key={s.name} cx={x(active)} cy={y(returns[active][i])} r={4} fill={s.color}/>)}
    </svg>
    <label>Inspect close <select value={rows[active][0]} onChange={e => setInspect(e.target.value)}>{rows.map(([date]) => <option key={date}>{date}</option>)}</select></label>
    <div className="tni-index-values" aria-live="polite">{indexes.map((s,i) => <strong key={s.name} style={{color:s.color}}>{s.name} {percent(returns[active][i])}</strong>)}</div>
    <div className="tni-index-legend">{base[0] === '2019-12-31' && rows.at(-1)![0] === '2026-11-13'
      ? <a className="tni-index-png-link" href="/images/social/index-cumulative-returns-2026-11-13.png" download="TNI-index-cumulative-returns-2019-12-31-to-2026-11-13.png">Download chart PNG</a>
      : <button type="button" disabled={exporting} onClick={async () => {
      setExporting(true)
      setDownloadError(false)
      try {
        await downloadReturnCard(rows.map(row => row[0]), returns)
      } catch {
        setDownloadError(true)
      } finally {
        setExporting(false)
      }
    }}>{exporting ? 'Preparing PNG…' : 'Download chart PNG'}</button>}</div>
    {downloadError && <p role="alert">The PNG could not be created. Please try again.</p>}
    <details><summary>Data and calculation</summary><p>Each value is the index close divided by its baseline close, minus one, expressed as a percentage. The chart uses the last common trading date in each month. The latest observation is {last}.</p>
    <p><a href="https://finance.yahoo.com/quote/%5EGSPC/history/">S&amp;P 500</a> · <a href="https://svmiller.com/stevedata/reference/DJIA.html">Historical Dow</a> · <a href="https://finance.yahoo.com/quote/%5EDJI/history/">Dow Jones</a> · <a href="https://fred.stlouisfed.org/series/NASDAQCOM">Nasdaq Composite via FRED</a></p></details>
  </section>
}
