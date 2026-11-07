import { useState } from 'react'
import data from '../../data/charts/brkbMarketEvents.json'
import './BerkshireMarketDrawdowns.css'

const percent = (value: number) => `${value.toFixed(2)}%`
const displayDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${value}T00:00:00Z`))

export default function BerkshireMarketDrawdowns() {
  const [mode, setMode] = useState<'corrections' | 'recessions'>('corrections')
  const events = mode === 'corrections' ? data.corrections : data.recessions
  const all = [...data.corrections, ...data.recessions]
  const axisMax = Math.ceil(Math.max(...all.flatMap(event => [
    Math.abs(event.asset.drawdown_pct), Math.abs(event.benchmark.drawdown_pct),
  ])) / 10) * 10

  return (
    <section className="tni-leveraged-drawdown tni-brkb-events" aria-labelledby="brkb-events-title">
      <div className="tni-leveraged-drawdown__header">
        <span className="tni-leveraged-drawdown__eyebrow">DRAWDOWN &amp; RECOVERY</span>
        <h2 id="brkb-events-title">BRK.B vs S&amp;P 500: Corrections &amp; Recessions</h2>
        <p className="tni-leveraged-drawdown__lede">
          Compare the deepest closing loss within identical event windows.
          Both series start a new running peak at the beginning of each window.
          This measures the decline experienced along the way, not just the return between two dates.
        </p>
      </div>
      <figure className="tni-brkb-events__social">
        <img src={`/images/social/brkb-stock-intelligence-og.png?v=${data.through_date}`}
          width="1200" height="630" loading="lazy"
          alt={`BRK.B and S&P 500 maximum drawdowns within the four deepest S&P 500 peak-to-trough windows, through ${data.through_date}.`} />
        <figcaption>Four episodes selected by the largest S&amp;P 500 declines, not Berkshire&apos;s relative performance.</figcaption>
        <a href="/images/social/brkb-stock-intelligence-og.png" download="TNI-BRK-B-vs-SP500-Drawdowns.png">Download comparison chart</a>
      </figure>
      <div className="tni-leveraged-drawdown__cards">
        <article className="tni-leveraged-drawdown__card is-asset">
          <span>BRK.B HAD A SHALLOWER DRAWDOWN</span>
          <strong>{data.asset_shallower_count} / {data.corrections.length}</strong>
          <small>S&amp;P 500 peak-to-trough event windows</small>
        </article>
        <article className="tni-leveraged-drawdown__card">
          <span>BRK.B HAD A DEEPER DRAWDOWN</span>
          <strong>{data.asset_deeper_count} / {data.corrections.length}</strong>
          <small>{data.ties ? `${data.ties} tied windows. ` : ''}Historical observations, not a forecast</small>
        </article>
      </div>
      <div className="tni-brkb-events__controls" role="group" aria-label="Choose event definition">
        <button type="button" aria-pressed={mode === 'corrections'} onClick={() => setMode('corrections')}>
          Market declines ({data.corrections.length})
        </button>
        <button type="button" aria-pressed={mode === 'recessions'} onClick={() => setMode('recessions')}>
          NBER recessions ({data.recessions.length})
        </button>
      </div>
      <p className="tni-brkb-events__definition">
        {mode === 'corrections'
          ? 'All distinct S&P 500 declines of at least 10% from a running peak in this dataset. Each comparison ends at the market trough; a new episode is counted only after the previous peak is regained. Smaller selloffs inside an unrecovered episode are not counted again.'
          : 'Official NBER recession windows: last close of the economic peak month through last close of the trough month. These are different dates from stock-market peaks and troughs. The peak month is the final expansion month.'}
      </p>
      <div className="tni-brkb-events__legend">
        <span><i className="tni-brkb-events__key--asset" />BRK.B</span>
        <span><i className="tni-brkb-events__key--benchmark" />S&amp;P 500</span>
        <span>Longer bar = deeper loss · Scale: 0–{axisMax}%</span>
      </div>
      <div aria-live="polite">
        {events.map(event => (
          <article className="tni-brkb-events__event" key={event.id}>
            <div className="tni-brkb-events__event-heading">
              <h3>{event.label} <span>{event.kind}</span></h3>
              <p>{displayDate(event.start)} → {displayDate(event.end)}</p>
            </div>
            <div className="tni-brkb-events__bars">
              {(['asset', 'benchmark'] as const).map(key => (
                <div className="tni-brkb-events__bar-row" key={key}>
                  <span>{key === 'asset' ? 'BRK.B' : 'S&P 500'}</span>
                  <div className="tni-brkb-events__track" aria-hidden="true">
                    <div className={`tni-brkb-events__fill--${key}`}
                      style={{ width: `${Math.abs(event[key].drawdown_pct) / axisMax * 100}%` }} />
                  </div>
                  <strong>{percent(event[key].drawdown_pct)}</strong>
                </div>
              ))}
            </div>
            <p className="tni-brkb-events__difference">
              {Math.abs(event.difference_pp) < 0.0001 ? 'Equal maximum drawdowns in this window.' :
                `BRK.B drawdown was ${Math.abs(event.difference_pp).toFixed(2)} percentage points ${event.difference_pp > 0 ? 'shallower' : 'deeper'}.`}
            </p>
            <details>
              <summary>Inspect dates and endpoint returns</summary>
              <div className="tni-brkb-events__table-scroll">
                <table>
                  <caption>{event.label}: maximum drawdown within the shared window</caption>
                  <thead><tr><th scope="col">Series</th><th scope="col">Own peak</th><th scope="col">Own trough</th><th scope="col">Window return</th></tr></thead>
                  <tbody>{(['asset', 'benchmark'] as const).map(key => (
                    <tr key={key}><th scope="row">{key === 'asset' ? 'BRK.B' : 'S&P 500'}</th>
                      <td>{displayDate(event[key].peak_date)}</td><td>{displayDate(event[key].trough_date)}</td>
                      <td>{percent(event[key].window_return_pct)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              {mode === 'corrections' && <p>S&amp;P 500 previous peak regained: {event.sp500_recovery ? displayDate(event.sp500_recovery) : 'Not yet recovered by the data cutoff'}.</p>}
            </details>
          </article>
        ))}
      </div>
      <p className="tni-leveraged-drawdown__methodology">
        Data: {displayDate(data.first_date)}–{displayDate(data.through_date)}. Source: {data.source}.
        {' '}{data.methodology.benchmark} Berkshire uses adjusted closes.
        {' '}A window&apos;s maximum drawdown may differ from the full-history maximum and from its endpoint return.
        {' '}Recession dates: <a href={data.nber_source}>NBER chronology</a>, checked {data.recession_chronology_checked}.
        {' '}Market events, metrics and this image refresh with the BRK.B annual-return update.
        New official recession dates require a chronology update. Past performance does not guarantee future results.
      </p>
    </section>
  )
}
