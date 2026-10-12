import data from '../../../research/doji/reversal-continuation-results.json'
import './DojiReversalContinuation.css'

const scenarios = [
  'Bullish reversal',
  'Bearish reversal',
  'Bullish continuation',
  'Bearish continuation',
]

const horizons = [
  { days: 1, label: '1 day', color: '#168b80' },
  { days: 5, label: '5 days', color: '#4c7ed9' },
  { days: 10, label: '10 days', color: '#e5a04b' },
]

const format = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(2)}`

export default function DojiReversalContinuation() {
  const maxAbs = 5

  return (
    <div className="doji-rc">
      <figure className="doji-rc-figure">
        <div className="doji-rc-eyebrow">FIGURE 7 · ORIGINAL RESEARCH</div>
        <h3>Reversal or continuation?</h3>
        <p className="doji-rc-subtitle">
          Doji advantage over non-Doji sessions in the same prior-trend regime.
          Positive values favor Doji.
        </p>

        <div className="doji-rc-legend">
          {horizons.map(h => (
            <span key={h.days}>
              <i style={{ background: h.color }} />
              {h.label}
            </span>
          ))}
        </div>

        <div className="doji-rc-chart">
          {scenarios.map(scenario => (
            <div className="doji-rc-group" key={scenario}>
              <strong className="doji-rc-group-title">{scenario}</strong>

              {horizons.map(h => {
                const row = data.performance.find(
                  item =>
                    item.Scenario === scenario &&
                    item.Horizon === h.days
                )

                if (!row) return null

                const value = row.Advantage_pp
                const magnitude = Math.min(
                  Math.abs(value) / maxAbs * 50,
                  50
                )

                return (
                  <div className="doji-rc-bar-row" key={h.days}>
                    <span className="doji-rc-horizon">{h.label}</span>
                    <div className="doji-rc-track">
                      <span className="doji-rc-zero" />
                      <span
                        className="doji-rc-bar"
                        style={{
                          background: h.color,
                          width: `${magnitude}%`,
                          left: value >= 0
                            ? '50%'
                            : `${50 - magnitude}%`,
                        }}
                      />
                    </div>
                    <span className="doji-rc-value">
                      {format(value)} pp
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <figcaption>
          Prior trend: five-session SPY return above +2% or below −2%.
          Doji body is at most 10% of the candle range.
          Results are descriptive and exclude trading costs.
        </figcaption>
      </figure>

      <div className="doji-rc-table-section">
        <div className="doji-rc-eyebrow">
          TABLE 7 · STATISTICAL VALIDATION
        </div>
        <h3>How reliable are the differences?</h3>
        <p className="doji-rc-subtitle">
          Ten-day directional success-rate advantage and exploratory
          95% moving-block bootstrap confidence intervals.
        </p>

        <div className="doji-rc-table-scroll">
          <table className="doji-rc-table">
            <thead>
              <tr>
                <th scope="col">Signal classification</th>
                <th scope="col">Advantage</th>
                <th scope="col">95% CI (pp)</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map(scenario => {
                const row = data.bootstrap.find(
                  item => item.Scenario === scenario
                )

                if (!row) return null

                return (
                  <tr key={scenario}>
                    <th scope="row">{scenario}</th>
                    <td>{format(row.Observed_pp)} pp</td>
                    <td>
                      {format(row.CI_Low)} to {format(row.CI_High)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="doji-rc-interpretation">
          <strong>No statistically distinguishable advantage</strong>
          <p>
            All four 95% confidence intervals include zero.
            These results do not establish a reliable reversal
            or continuation advantage at the ten-day horizon.
          </p>
        </div>

        <p className="doji-rc-method">
          Source: TNI analysis of SPY daily prices, 2000–2026.
          Twenty-session moving-block bootstrap, 2,000 replications.
          Intervals are exploratory and unadjusted for multiple testing.
        </p>
      </div>
    </div>
  )
}
