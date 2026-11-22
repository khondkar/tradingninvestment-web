import SoxlHoldings from "./SoxlHoldings"
import { useState } from "react"
import study from "../../data/charts/soxlThreeWayRecovery.json"
import "./SoxlRecoveryComparison.css"

const ranges = [
  { key: "history", label: "Full history" },
  { key: "recovery", label: "Since Nov 2021" },
  { key: "latest", label: study.end.slice(0, 4) },
]

const formatDate = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString(
  "en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }
)
const duration = (days: number | null) => days === null ? "Ongoing" : days.toLocaleString("en-US")
const loss = (pct: number) => pct.toFixed(2).replace("-", "−") + "%"

export default function SoxlRecoveryComparison() {
  const [range, setRange] = useState("history")
  return (
    <section className="soxl-recovery" id="soxl-drawdown-recovery" aria-labelledby="soxl-recovery-title">
      <h2 id="soxl-recovery-title">How long did SOXL, SMH and the Nasdaq take to recover?</h2>

      <figure>
        <figcaption><strong>Distance below each investment’s own high</strong><br />At 0%, it has reached or regained a high. At −50%, it has lost half its peak value.</figcaption>
        <div className="soxl-recovery-controls" role="group" aria-label="Chart date range">
          {ranges.map(r => <button key={r.key} type="button" aria-pressed={range === r.key} onClick={() => setRange(r.key)}>{r.label}</button>)}
        </div>
        <div className="soxl-recovery-legend">{study.assets.map(a => <span key={a.name} style={{color:a.color}}>━ {a.name}</span>)}</div>
        <img width="554" height="259" src={'/images/research/soxl-three-way-' + range + '.svg'} alt={'SOXL, SMH and Nasdaq Composite drawdown lines. ' + ranges.find(r => r.key === range)?.label + '. Exact depths and recovery dates follow.'} />
      </figure>
      <SoxlHoldings />
      <h3>Deepest drawdown during the common history</h3>
      <div className="soxl-recovery-scroll" tabIndex={0} role="region" aria-label="Worst drawdown and recovery table">
        <table><thead><tr>{["Investment", "Peak", "Low", "Drawdown", "Peak regained", "Days from low", "Days from peak"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
          <tbody>{study.assets.map(a => <tr key={a.name}><th scope="row">{a.name}</th><td>{formatDate(a.peak)}</td><td>{formatDate(a.trough)}</td><td>{loss(a.loss)}</td><td>{a.recovery ? formatDate(a.recovery) : "Ongoing"}</td><td>{duration(a.fromLow)}</td><td>{duration(a.fromPeak)}</td></tr>)}</tbody>
        </table>
      </div>
      <h3>Where each stood on {formatDate(study.end)}</h3>
      <div className="soxl-recovery-scroll" tabIndex={0} role="region" aria-label="Current drawdowns">
        <table><thead><tr><th scope="col">Investment</th><th scope="col">Most recent peak</th><th scope="col">Distance from peak</th><th scope="col">Days since peak</th></tr></thead>
          <tbody>{study.assets.map(a => <tr key={a.name}><th scope="row">{a.name}</th><td>{formatDate(a.latestPeak)}</td><td>{loss(a.current)}</td><td>{duration(a.elapsed)}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="soxl-recovery-method">The study starts on {formatDate(study.start)}, when SOXL began trading, and covers {study.sessions.toLocaleString("en-US")} common sessions. Each line measures the percentage below its own highest close since that start. Zooming preserves the earlier peaks. Recovery is the first close back at or above the previous peak. Durations are calendar days. The ETFs use distribution-adjusted closes. The Nasdaq Composite is a price index and excludes dividends.</p>
      <p className="soxl-recovery-method">Daily histories · <a href="https://finance.yahoo.com/quote/SOXL/history/">SOXL</a> · <a href="https://finance.yahoo.com/quote/SMH/history/">SMH</a> · <a href="https://finance.yahoo.com/quote/%5EIXIC/history/">Nasdaq Composite</a></p>
      <p><a href="/images/social/soxl-vs-smh-drawdown.png" download>Download SOXL vs SMH drawdown chart (PNG)</a></p>
    </section>
  )
}
