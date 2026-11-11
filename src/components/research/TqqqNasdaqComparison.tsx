import { useMemo, useState } from 'react'
import dataset from '../../data/charts/tqqqQldQqqComparison.json'
import { pairRanges, pairStats, selectPairRange, type PairRange } from '../../research/leveraged-etf/uproTqqqComparison'
import { comparisonPeriods, nasdaqFunds, type ComparisonFrequency, type NasdaqPoint } from '../../research/leveraged-etf/tqqqQldQqqComparison'
import './TqqqNasdaqComparison.css'

const money = (value: number) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
}).format(value)
const percent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
const rangeLabel = (range: PairRange) => range === 'ALL' ? 'Common history' : range
const frequencies: ComparisonFrequency[] = ['Yearly', 'Monthly', 'Weekly', 'Daily']
const width = 960, height = 390, left = 145, right = 24, top = 24, bottom = 52

function ComparisonChart({ rows, mode }: { rows: NasdaqPoint[]; mode: 'drawdown' | 'growth' }) {
  const [selected, setSelected] = useState<number | null>(null)
  const points = useMemo(() => {
    const peaks = { qqq: rows[0].qqq, qld: rows[0].qld, tqqq: rows[0].tqqq }
    return rows.map(row => {
      const values = nasdaqFunds.map(fund => {
        peaks[fund.key] = Math.max(peaks[fund.key], row[fund.key])
        return mode === 'drawdown'
          ? 100 * (row[fund.key] / peaks[fund.key] - 1)
          : 10000 * row[fund.key] / rows[0][fund.key]
      })
      return { date: row.date, values }
    })
  }, [rows, mode])
  const start = rows[0], end = rows[rows.length - 1]
  const active = Math.min(selected ?? rows.length - 1, rows.length - 1)
  const firstStamp = Date.parse(start.date), lastStamp = Date.parse(end.date)
  const x = (index: number) => left + (Date.parse(rows[index].date) - firstStamp) / (lastStamp - firstStamp) * (width - left - right)
  const allValues = points.flatMap(point => point.values)
  const floor = mode === 'drawdown' ? Math.min(-10, Math.floor(Math.min(...allValues) / 10) * 10) : Math.floor(Math.log10(Math.min(...allValues)))
  const ceiling = mode === 'drawdown' ? 0 : Math.ceil(Math.log10(Math.max(...allValues)))
  const y = (value: number) => top + (ceiling - (mode === 'growth' ? Math.log10(value) : value)) / (ceiling - floor) * (height - top - bottom)
  const ticks = mode === 'drawdown'
    ? Array.from({ length: 6 }, (_, index) => floor * index / 5)
    : Array.from({ length: ceiling - floor + 1 }, (_, index) => 10 ** (floor + index))

  return <>
    <div className="tni-nasdaq-legend">
      {nasdaqFunds.map((fund, index) => <span key={fund.key} style={{ color: fund.color }}>
        {fund.ticker} <strong>{mode === 'growth' ? money(points[active].values[index]) : percent(points[active].values[index])}</strong>
      </span>)}
      <strong>{points[active].date}</strong>
    </div>
    <p className="tni-nasdaq-note">{mode === 'growth' ? 'Logarithmic price scale. Equal vertical distances represent equal proportional changes.' : 'Each line measures the decline from that fund’s own prior peak within the selected period.'}</p>
    <div className="tni-nasdaq-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label={`${mode === 'growth' ? 'Growth of $10,000' : 'Running-peak drawdowns'} for QQQ, QLD and TQQQ from ${start.date} to ${end.date}`}
        onPointerMove={event => {
          const bounds = event.currentTarget.getBoundingClientRect()
          const position = (event.clientX - bounds.left) / bounds.width * width
          const ratio = Math.max(0, Math.min(1, (position - left) / (width - left - right)))
          const stamp = firstStamp + ratio * (lastStamp - firstStamp)
          let nearest = 0
          for (let index = 1; index < rows.length; index++) {
            if (Math.abs(Date.parse(rows[index].date) - stamp) < Math.abs(Date.parse(rows[nearest].date) - stamp)) nearest = index
          }
          setSelected(nearest)
        }} onPointerLeave={() => setSelected(null)}>
        {ticks.map(value => <g key={value}>
          <line x1={left} x2={width - right} y1={y(value)} y2={y(value)} stroke="#b5c5d6" />
          <text x={left - 12} y={y(value) + 6} textAnchor="end">{mode === 'growth' ? money(value) : `${value.toFixed(0)}%`}</text>
        </g>)}
        {[0, 1, 2, 3, 4].map(value => {
          const index = Math.round(value * (rows.length - 1) / 4)
          return <text key={value} x={x(index)} y={height - 16} textAnchor={value === 0 ? 'start' : value === 4 ? 'end' : 'middle'}>{rows[index].date.slice(0, 7)}</text>
        })}
        {nasdaqFunds.map((fund, index) => <polyline key={fund.key}
          points={points.map((point, i) => `${x(i).toFixed(2)},${y(point.values[index]).toFixed(2)}`).join(' ')}
          fill="none" stroke={fund.color} strokeWidth={3.2} strokeLinejoin="round" />)}
        <line x1={x(active)} x2={x(active)} y1={top} y2={height - bottom} stroke="#10233f" strokeDasharray="5 4" />
      </svg>
    </div>
    <label className="tni-nasdaq-slider">Explore date — {points[active].date}
      <input type="range" min={0} max={rows.length - 1} value={active} onChange={event => setSelected(Number(event.target.value))} />
    </label>

  </>
}

export default function TqqqNasdaqComparison() {
  const [range, setRange] = useState<PairRange>('ALL')
  const [frequency, setFrequency] = useState<ComparisonFrequency>('Yearly')
  const [visiblePeriods, setVisiblePeriods] = useState(20)
  const rows = useMemo(() => selectPairRange(dataset.data, range), [range])
  const stats = useMemo(() => nasdaqFunds.map(fund => ({
    ...fund, ...pairStats(rows, fund.key)!,
  })), [rows])
  const periods = useMemo(() => comparisonPeriods(dataset.data, frequency), [frequency])
  const start = rows[0], end = rows[rows.length - 1]

  return <div className="tni-nasdaq-comparison" id="tqqq-qld-qqq" aria-labelledby="tqqq-qld-qqq-heading">
    <h2 id="tqqq-qld-qqq-heading">TQQQ vs. QLD vs. QQQ — Drawdowns, Recovery &amp; Returns</h2>
    <p>Compare Nasdaq-100 exposure through QQQ, QLD’s 2× daily objective and TQQQ’s 3× daily objective.
      The data covers <strong>{dataset.first_date} through {dataset.through}</strong> on {dataset.daily_observations.toLocaleString()} matching trading dates.</p>
    <nav className="tni-nasdaq-sections" aria-label="TQQQ, QLD and QQQ comparison sections">
      <a href="#nasdaq-drawdown-recovery">Drawdown &amp; recovery</a>
      <a href="#nasdaq-growth">Growth &amp; total returns</a>
      <a href="#nasdaq-period-returns">Yearly, monthly, weekly &amp; daily</a>
    </nav>
    <div className="tni-nasdaq-controls" aria-label="Comparison period">
      {pairRanges.map(value => <button type="button" key={value} aria-pressed={range === value}
        onClick={() => setRange(value)}>{rangeLabel(value)}</button>)}
    </div>
    <p className="tni-nasdaq-note">Selected chart and recovery period — <strong>{start.date} through {end.date}</strong>.</p>

    <section className="tni-nasdaq-section" id="nasdaq-drawdown-recovery" aria-labelledby="nasdaq-drawdown-heading">
      <h3 id="nasdaq-drawdown-heading">Drawdown &amp; recovery</h3>
      <p>How deep did losses become, and how long did each fund take to regain its previous peak?</p>
      <div className="tni-nasdaq-summary">
        {stats.map(fund => <article key={fund.key}>
          <h4 style={{ color: fund.color }}>{fund.ticker}</h4>
          <strong style={{ color: fund.color }}>{percent(fund.drawdown)}</strong>
          <span>Maximum drawdown</span>
          <p>{fund.peakDate} → {fund.troughDate}</p>
          <p>Low to recovery <b>{fund.lowToRecovery === null ? 'Ongoing' : `${fund.lowToRecovery.toLocaleString()} calendar days`}</b></p>
        </article>)}
      </div>
      <ComparisonChart key={`drawdown-${range}`} rows={rows} mode="drawdown" />
      <h4 className="tni-nasdaq-table-heading">{rangeLabel(range)} recovery comparison</h4>
    <div className="tni-nasdaq-table"><table>
      <caption>Each maximum drawdown uses the fund’s own peak and trough. Recovery dates may differ.</caption>
      <thead><tr><th scope="col">Metric</th>{stats.map(fund => <th scope="col" key={fund.key}>{fund.ticker}<br />{fund.label}</th>)}</tr></thead>
      <tbody>
        <tr><th scope="row">Maximum drawdown</th>{stats.map(fund => <td key={fund.key}>{percent(fund.drawdown)}</td>)}</tr>
        <tr><th scope="row">Drawdown at latest close</th>{stats.map(fund => <td key={fund.key}>{percent(fund.currentDrawdown)}</td>)}</tr>
        <tr><th scope="row">Peak before deepest decline</th>{stats.map(fund => <td key={fund.key}>{fund.peakDate}</td>)}</tr>
        <tr><th scope="row">Deepest drawdown low</th>{stats.map(fund => <td key={fund.key}>{fund.troughDate}</td>)}</tr>
        <tr><th scope="row">Previous peak regained</th>{stats.map(fund => <td key={fund.key}>{fund.recoveryDate ?? 'Still below peak'}</td>)}</tr>
        <tr><th scope="row">Peak to low · calendar days</th>{stats.map(fund => <td key={fund.key}>{fund.peakToTrough.toLocaleString()}</td>)}</tr>
        <tr><th scope="row">Low to recovery · calendar days</th>{stats.map(fund => <td key={fund.key}>{fund.lowToRecovery?.toLocaleString() ?? 'Ongoing'}</td>)}</tr>
        <tr><th scope="row">Peak to recovery · calendar days</th>{stats.map(fund => <td key={fund.key}>{fund.underwater?.toLocaleString() ?? 'Ongoing'}</td>)}</tr>
        <tr><th scope="row">Gain required from deepest low</th>{stats.map(fund => <td key={fund.key}>{percent(100 * (1 / (1 + fund.drawdown / 100) - 1))}</td>)}</tr>
      </tbody>
    </table></div>
    <p className="tni-nasdaq-note">Recovery is the first subsequent adjusted close at or above the prior peak. Calendar days include weekends and holidays. Changing the period resets each running peak at the selected starting close. Total return uses adjusted closes as a distribution-reinvested return proxy. YTD is unannualized.</p>

    </section>

    <section className="tni-nasdaq-section" id="nasdaq-growth" aria-labelledby="nasdaq-growth-heading">
      <h3 id="nasdaq-growth-heading">Growth of $10,000 &amp; total returns</h3>
      <p>Each fund starts with $10,000 at the selected starting close. QLD and TQQQ reset their leverage daily. Compounding, volatility, fund expenses and financing affect longer-period results.</p>
      <ComparisonChart key={`growth-${range}`} rows={rows} mode="growth" />
      <div className="tni-nasdaq-table"><table>
        <caption>Distribution-adjusted returns over {start.date} through {end.date}.</caption>
        <thead><tr><th scope="col">Metric</th>{stats.map(fund => <th scope="col" key={fund.key}>{fund.ticker}</th>)}</tr></thead>
        <tbody>
        <tr><th scope="row">Total return</th>{stats.map(fund => <td key={fund.key}>{percent(fund.total)}</td>)}</tr>
        <tr><th scope="row">Annualized return</th>{stats.map(fund => <td key={fund.key}>{range === 'YTD' ? '—' : percent(fund.cagr)}</td>)}</tr>
        <tr><th scope="row">Ending value of $10,000</th>{stats.map(fund => <td key={fund.key}>{money(fund.ending)}</td>)}</tr>
        </tbody>
      </table></div>
    </section>

    <section className="tni-nasdaq-section" id="nasdaq-period-returns" aria-labelledby="nasdaq-period-heading">
    <h3 id="nasdaq-period-heading">Yearly, monthly, weekly and daily returns</h3>
    <div className="tni-nasdaq-controls" aria-label="Return frequency">
      {frequencies.map(value => <button type="button" key={value} aria-pressed={frequency === value}
        onClick={() => { setFrequency(value); setVisiblePeriods(20) }}>{value}</button>)}
    </div>
    <div className="tni-nasdaq-table"><table>
      <caption>{frequency} total returns over the full common history. Most recent periods first.</caption>
      <thead><tr><th scope="col">Period ending</th>{nasdaqFunds.map(fund => <th scope="col" key={fund.key}>{fund.ticker}</th>)}<th scope="col">Period</th></tr></thead>
      <tbody>{periods.slice(0, visiblePeriods).map(period => <tr key={period.date}>
        <th scope="row">{period.date}</th>{nasdaqFunds.map(fund => <td key={fund.key}>{percent(period[fund.key])}</td>)}
        <td>{period.partial ? 'In progress' : 'Complete'}</td>
      </tr>)}</tbody>
    </table></div>
    {visiblePeriods < periods.length && <button type="button" className="tni-nasdaq-more" onClick={() => setVisiblePeriods(value => value + 20)}>Show 20 more periods</button>}
    <p className="tni-nasdaq-note">Daily returns compare consecutive closes. Other frequencies compare the last available closes of adjacent calendar years, months or Friday-ending weeks. The first bucket is used as the return baseline. The current unfinished period is labeled “In progress”.</p>
    </section>
    <div className="tni-nasdaq-downloads">
      <a className="tni-nasdaq-download" href="/data/tqqq-qld-qqq-comparison.csv" download="TNI-TQQQ-QLD-QQQ-comparison.csv">Download comparison data (CSV)</a>
      <a className="tni-nasdaq-download" href="/images/social/tqqq-qld-qqq-drawdown-recovery-og.png" download="TNI-TQQQ-QLD-QQQ-Drawdown-Recovery.png">Download research card (PNG)</a>
    </div>
    <p className="tni-nasdaq-note">Source — Yahoo Finance adjusted daily closes. QQQ and TQQQ use the article’s saved snapshot. QLD is matched to exactly those dates. Data through {dataset.through}. Historical results depend on the selected period.</p>
    <p className="tni-nasdaq-note">Fund objectives and documents — <a href="https://www.invesco.com/qqq-etf/en/home.html">Invesco QQQ</a>, <a href="https://www.proshares.com/our-etfs/leveraged-and-inverse/qld">ProShares QLD</a>, <a href="https://www.proshares.com/our-etfs/leveraged-and-inverse/tqqq">ProShares TQQQ</a>.</p>
  </div>
}
