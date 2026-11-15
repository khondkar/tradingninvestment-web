import IndexCumulativeReturns from './IndexCumulativeReturns'
import { useEffect, useRef, useState } from 'react'
import { line, scaleLinear } from 'd3'
import sp from '../../data/charts/sp500AnnualReturns.json'
import dow from '../../data/charts/dowAnnualReturns.json'
import nasdaq from '../../data/charts/nasdaqAnnualReturns.json'
import { renderDrawdownComparisonChart, type TNIDrawdownComparisonPoint } from '../../charts/tni/renderDrawdownComparisonChart'
import './Sp500IndexComparisons.css'

const series = [
  { name: 'S&P 500', color: '#ae2033', source: sp },
  { name: 'Dow Jones Industrial Average', color: '#596676', source: dow },
  { name: 'Nasdaq Composite', color: '#1457a1', source: nasdaq },
].map(s => ({
  name: s.name, color: s.color,
  values: new Map(s.source.data.filter(r => r.year <= s.source.summary.end_year && !r.label.includes('YTD')).map(r => [r.year, r.value])),
}))
const end = Math.min(...series.map(s => Math.max(...s.values.keys())))
const years = Array.from({ length: end - 1928 + 1 }, (_, i) => 1928 + i)
const pct = (v: number | undefined) => v == null ? 'Unavailable' : (v > 0 ? '+' : '') + v.toFixed(2) + '%'

function ReturnsChart() {
  const [period, setPeriod] = useState(0)
  const [selected, setSelected] = useState(end)
  const [hidden, setHidden] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(760)
  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([e]) => setWidth(Math.max(220, e.contentRect.width)))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  const visible = series.filter(s => !hidden.includes(s.name))
  const shown = period ? years.slice(-period) : years
  const start = shown[0]
  const year = Math.max(start, selected)
  const values = visible.flatMap(s => shown.flatMap(k => s.values.has(k) ? [s.values.get(k)!] : []))
  const x = scaleLinear([start, end], [53, width - 18])
  const y = scaleLinear([Math.min(0, ...values) - 2, Math.max(0,...values) + 2], [247, 14]).nice()
  const tickCount = width < 500 ? 4 : 7
  function inspectPointer(event: React.PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const pixel = (event.clientX - box.left) * width / box.width
    setSelected(Math.round(x.copy().clamp(true).invert(pixel)))
  }
  return <section id="index-annual-comparison">
    <h2>S&amp;P 500, Dow and Nasdaq returns by year</h2>
    <p>Compare calendar-year price returns from 1928 through {end}. The Nasdaq Composite joins in 1972, its first full calendar year in this dataset. Dividends are excluded.</p>
    <label>Period <select value={period} onChange={e => setPeriod(Number(e.target.value))}>
      <option value={0}>1928–{end}</option><option value={20}>Last 20 years</option><option value={10}>Last 10 years</option>
    </select></label>
    <div className="tni-index-legend">{series.map(s => <button key={s.name} type="button" aria-pressed={!hidden.includes(s.name)}
      disabled={visible.length === 1 && visible[0].name === s.name}
      onClick={() => setHidden(h => h.includes(s.name) ? h.filter(k => k !== s.name) : [...h, s.name])}>
      <i style={{background:s.color}}/>{s.name}</button>)}</div>
    <div ref={ref}><svg viewBox={`0 0 ${width} 283`} role="img" aria-label="Annual index price returns, plotted by calendar year" style={{touchAction:'pan-y'}}
      onPointerMove={inspectPointer} onPointerDown={inspectPointer}>
      {y.ticks(6).map(v => <g key={v}><line x1={53} x2={width-18} y1={y(v)} y2={y(v)} stroke={v===0?'#3c4c5e':'#d1d9e1'}/><text x={46} y={y(v)+4} textAnchor="end">{v}%</text></g>)}
      {Array.from({length:tickCount},(_,i)=>Math.round(start+(end-start)*i/(tickCount-1))).map((v,i)=><text key={v} x={x(v)} y={272} textAnchor={i===0?'start':i===tickCount-1?'end':'middle'}>{v}</text>)}
      {visible.map(s=><path key={s.name} d={line<number>().defined(k=>s.values.has(k)).x(k=>x(k)).y(k=>y(s.values.get(k)!))(shown) ?? ''} fill="none" stroke={s.color} strokeWidth="2.6"/>)}
      <line x1={x(year)} x2={x(year)} y1={14} y2={247} stroke="#455469" strokeDasharray="4 4"/>
      {visible.map(s=>s.values.has(year) && <circle key={s.name} cx={x(year)} cy={y(s.values.get(year)!)} r={4} fill={s.color}/>)}
    </svg></div>
    <label>Inspect year <select value={year} onChange={e=>setSelected(Number(e.target.value))}>{shown.map(k=><option key={k}>{k}</option>)}</select></label>
    <p aria-live="polite" className="tni-index-values">{visible.map(s=><span key={s.name}>{s.name} <strong>{pct(s.values.get(year))}</strong></span>)}</p>
    <details><summary>Year-by-year comparison table</summary><table><thead><tr><th>Year</th>{series.map(s=><th key={s.name}>{s.name}</th>)}</tr></thead><tbody>
      {shown.slice().reverse().map(k=><tr key={k}><th scope="row">{k}</th>{series.map(s=><td key={s.name}>{pct(s.values.get(k))}</td>)}</tr>)}
    </tbody></table></details>
  </section>
}

function DrawdownChart() {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const controller = new AbortController()
    let resize: ResizeObserver | undefined
    let clear: (()=>void) | undefined
    async function load(container: HTMLDivElement) {
      try {
        const res = await fetch('/data/sp500-dow-closing-drawdowns.json', {signal:controller.signal})
        if (!res.ok) throw new Error('Price history unavailable')
        const rows: [string,number,number][] = await res.json()
        if (controller.signal.aborted) return
        const data: TNIDrawdownComparisonPoint[] = rows.map(([date,asset_drawdown_pct,benchmark_drawdown_pct]) => ({date,asset_drawdown_pct,benchmark_drawdown_pct}))
        let width = -1
        function render() {
          if (width === container.clientWidth) return
          width = container.clientWidth
          clear?.()
          clear = renderDrawdownComparisonChart(container,{assetName:'S&P 500',benchmarkName:'Dow Jones',data})
        }
        render()
        resize = new ResizeObserver(render)
        resize.observe(container)
      } catch {
        if (!controller.signal.aborted) setError(true)
      }
    }
    const observer = new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){ observer.disconnect(); void load(node) }
    }, {rootMargin:'500px'})
    observer.observe(node)
    return ()=>{controller.abort();observer.disconnect();resize?.disconnect();clear?.()}
  },[])
  return <section id="sp500-dow-drawdown"><h2>S&amp;P 500 vs. Dow Jones drawdowns</h2>
    <p>Each line measures the percentage below its own highest daily close since January 3, 1928. A return to zero means the index has regained its prior closing high. Both series run through November 13, 2026.</p>
    {error && <p role="status">Daily drawdown history could not be loaded. <a href="/data/sp500-dow-closing-drawdowns.json">Open the chart data</a>.</p>}
    <div ref={ref} className="tni-index-drawdown"/>
    <h3>2020: the same trough, two recovery dates</h3>
    <p>Both indexes bottomed on March 23. The S&amp;P 500 fell 33.92% from its February 19 closing high and recovered it on August 18. The Dow fell 37.09% from its February 12 high and regained it on November 16. Both finished 2020 higher: the S&amp;P gained 16.26% and the Dow gained 7.25%.</p>
    <details><summary>Daily data and methodology</summary><p>Drawdown is calculated from each index’s own daily closes before aligning dates. The chart plots dates available for both. Price returns exclude dividends. Early S&amp;P history includes the predecessor index.</p>
    <p><a href="https://finance.yahoo.com/quote/%5EGSPC/history/">S&amp;P index history</a> · <a href="https://svmiller.com/stevedata/reference/DJIA.html">Dow daily history before 1992</a> · <a href="https://finance.yahoo.com/quote/%5EDJI/history/">Dow history from 1992</a></p></details>
  </section>
}
export default function Sp500IndexComparisons() {
  return <div className="tni-sp-index-study"><IndexCumulativeReturns/><ReturnsChart/><DrawdownChart/></div>
}
