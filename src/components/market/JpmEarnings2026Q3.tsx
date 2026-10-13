import { useState } from 'react'
import './JpmEarnings2026Q3.css'

const source = 'https://www.jpmorganchase.com/content/dam/jpmc/jpmorgan-chase-and-co/investor-relations/documents/quarterly-earnings/2026/3rd-quarter/2b5b9a7e-a968-4985-94ad-5fa949a08d1c.pdf'
const periods = ['3Q25', '2Q26', '3Q26']
const metrics = [
  { name: 'Reported diluted EPS', unit: '$', values: [5.07, 7.70, 5.57], note: 'GAAP earnings per diluted share. Significant items can affect comparisons.' },
  { name: 'Net interest income', unit: '$B', values: [24.0, 25.6, 27.1], note: 'Managed basis. Interest earned less interest expense; shown using rounded presentation figures.' },
  { name: 'Credit costs', unit: '$B', values: [3.4, 2.5, 2.7], note: 'Provision expense, including net charge-offs and changes in reserves.' },
  { name: 'Average deposits', unit: '$B', values: [2525, 2686, 2734], note: 'Average balances, rather than period-end balances.' },
  { name: 'Standardized CET1', unit: '%', values: [14.8, 14.2, 13.9], note: 'Regulatory common equity capital relative to risk-weighted assets. Current-quarter value is estimated.' },
  { name: 'ROTCE', unit: '%', values: [20, 29, 20], note: 'Return on tangible common equity; a non-GAAP profitability measure.' },
]
function format(value: number, unit: string) {
  return unit === '$' ? `$${value.toFixed(2)}` : unit === '%' ? `${value}%` : `$${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}B`
}
export default function JpmEarnings2026Q3() {
  const [tab, setTab] = useState('What matters')
  const [metricIndex, setMetricIndex] = useState(1)
  const metric = metrics[metricIndex]
  return <section className="jpm-earnings">
    <div className="jpm-meta">REPORTED · OCTOBER 13, 2026 · Q3 2026</div>
    <nav className="jpm-tabs" aria-label="JPM earnings sections">{['What matters', 'Results', 'History'].map(label => <button type="button" key={label} aria-pressed={tab === label} onClick={() => setTab(label)}>{label}</button>)}</nav>
    {tab === 'What matters' && <><h3>Income growth. Credit and capital in focus.</h3><p>TNI interpretation: assess the earnings result alongside funding, credit costs, and capital. Select a metric to compare the prior quarter and prior year.</p><div className="jpm-tiles">{metrics.slice(1).map((m, i) => <button type="button" key={m.name} onClick={() => { setMetricIndex(i + 1); setTab('History') }}><span>{m.name}</span><strong>{format(m.values[2], m.unit)}</strong><small>Explore comparisons ↗</small></button>)}</div></>}
    {tab === 'Results' && <><h3>Separate reported and adjusted results.</h3><div className="jpm-tiles"><article><span>Reported EPS · GAAP</span><strong>$5.57</strong></article><article><span>EPS excluding securities losses</span><strong>$5.75</strong><small>Non-GAAP</small></article><article><span>Managed revenue · non-GAAP</span><strong>$50.9B</strong></article><article><span>Net income</span><strong>$15.3B</strong></article></div><p>Securities losses reduced EPS by $0.18. Managed revenue uses fully taxable-equivalent adjustments.</p><div className="jpm-note"><h4>Outlook</h4><p>2026 implied NII: approximately $106.2B. Preliminary 2027 NII excluding Markets: approximately $107B. These are different measures and should not be compared as a growth rate.</p></div><div className="jpm-note"><h4>Expectations & market reaction</h4><p>A comparable, timestamped consensus and verified price series are not included in this release. No surprise score or stock-return chart is displayed.</p></div></>}
    {tab === 'History' && <><h3>The evidence behind the metric.</h3><label className="jpm-select">Explore metric<select value={metricIndex} onChange={e => setMetricIndex(Number(e.target.value))}>{metrics.map((m,i) => <option key={m.name} value={i}>{m.name}</option>)}</select></label><p>{metric.note}</p><div className="jpm-bars" role="img" aria-label={`${metric.name}: ${periods.map((q,i)=>`${q} ${format(metric.values[i],metric.unit)}`).join(', ')}`}>{metric.values.map((value,i) => <div key={periods[i]}><strong>{format(value,metric.unit)}</strong><div className="jpm-bar-track"><span style={{height:`${value / Math.max(...metric.values) * 100}%`}} /></div><small>{periods[i]}</small></div>)}</div><p className="jpm-small">Selected comparison periods, not consecutive quarters. EPS and NII comparatives use the rounded values and changes in the presentation.</p><details><summary>View comparison table</summary><table><thead><tr><th>Period</th><th>{metric.name}</th></tr></thead><tbody>{periods.map((q,i)=><tr key={q}><td>{q}</td><td>{format(metric.values[i],metric.unit)}</td></tr>)}</tbody></table></details></>}
    <footer className="jpm-source"><a href={source} target="_blank" rel="noreferrer">Source: JPMorganChase 3Q26 presentation ↗</a><span>Slides 1–3, 8–9 · Reviewed October 13, 2026 · Static sourced snapshot</span></footer>
  </section>
}
