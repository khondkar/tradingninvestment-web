import results from '../../../research/doji/spy-doji-results.json'

const pct = (value: number) => `${value.toFixed(1)}%`

export function DojiDecadeChart() {
  const data = results.stability

  return (
    <figure className="spy-doji-figure">
      <div className="spy-doji-chart-heading">
        <span>FIGURE 1</span>
        <h3>Does the Doji advantage persist across market periods?</h3>
        <p>10-day positive-return frequency following neutral-market sessions.</p>
      </div>

      <div className="spy-doji-chart-legend">
        <span><i className="spy-doji-key spy-doji-key-primary" /> Doji</span>
        <span><i className="spy-doji-key spy-doji-key-secondary" /> Non-Doji</span>
      </div>

      <div className="spy-doji-periods">
        {data.map(row => (
          <div className="spy-doji-period" key={row.Period}>
            <div className="spy-doji-period-heading">
              <strong>{row.Period}</strong>
              <span>+{row.Advantage_pp.toFixed(2)} pp</span>
            </div>

            <div className="spy-doji-bar-row">
              <span>Doji</span>
              <div className="spy-doji-bar-track">
                <div
                  className="spy-doji-bar spy-doji-bar-primary"
                  style={{ width: `${row.Doji_Positive_Rate}%` }}
                />
              </div>
              <strong>{pct(row.Doji_Positive_Rate)}</strong>
            </div>

            <div className="spy-doji-bar-row">
              <span>Non-Doji</span>
              <div className="spy-doji-bar-track">
                <div
                  className="spy-doji-bar spy-doji-bar-secondary"
                  style={{ width: `${row.Control_Positive_Rate}%` }}
                />
              </div>
              <strong>{pct(row.Control_Positive_Rate)}</strong>
            </div>

            <p className="spy-doji-chart-note">
              {row.Doji_N} Doji observations · {row.Control_N} non-Doji observations
            </p>
          </div>
        ))}
      </div>

      <figcaption>
        Source: TradingNInvestment analysis of SPY daily OHLC prices,
        January 2000–September 2026. Positive-return advantage weakened
        in the most recent period.
      </figcaption>
    </figure>
  )
}

export function DojiContextChart() {
  const data = results.trend.filter(row => row.Horizon === 10)

  const labels: Record<string, string> = {
    Downtrend: 'Prior 5-day decline >2%',
    Neutral: 'Prior 5-day move within ±2%',
    Uptrend: 'Prior 5-day advance >2%',
  }

  return (
    <figure className="spy-doji-figure">
      <div className="spy-doji-chart-heading">
        <span>FIGURE 2</span>
        <h3>Market context changes the Doji outcome</h3>
        <p>10-day positive-return frequency by preceding five-day SPY movement.</p>
      </div>

      <div className="spy-doji-chart-legend">
        <span><i className="spy-doji-key spy-doji-key-primary" /> Doji</span>
        <span><i className="spy-doji-key spy-doji-key-secondary" /> All sessions in category</span>
      </div>

      <div className="spy-doji-periods">
        {data.map(row => (
          <div className="spy-doji-period" key={row.Regime}>
            <div className="spy-doji-period-heading">
              <strong>{labels[row.Regime] ?? row.Regime}</strong>
            </div>

            <div className="spy-doji-bar-row">
              <span>Doji</span>
              <div className="spy-doji-bar-track">
                <div
                  className="spy-doji-bar spy-doji-bar-primary"
                  style={{ width: `${row.Doji_Win}%` }}
                />
              </div>
              <strong>{pct(row.Doji_Win)}</strong>
            </div>

            <div className="spy-doji-bar-row">
              <span>All</span>
              <div className="spy-doji-bar-track">
                <div
                  className="spy-doji-bar spy-doji-bar-secondary"
                  style={{ width: `${row.Baseline_Win}%` }}
                />
              </div>
              <strong>{pct(row.Baseline_Win)}</strong>
            </div>

            <p className="spy-doji-chart-note">
              {row.Doji_N} qualifying Dojis
            </p>
          </div>
        ))}
      </div>

      <figcaption>
        This chart uses all sessions in each market category as its baseline,
        including Doji observations. It is not the non-Doji control comparison
        used in the statistical validation.
      </figcaption>
    </figure>
  )
}

export function DojiBootstrapChart() {
  const data = results.bootstrap
  const min = 0
  const max = 14
  const left = 125
  const width = 540
  const x = (value: number) => left + ((value - min) / (max - min)) * width

  return (
    <figure className="spy-doji-figure">
      <div className="spy-doji-chart-heading">
        <span>FIGURE 3</span>
        <h3>How sensitive is the finding to bootstrap block length?</h3>
        <p>95% confidence intervals for the 10-day positive-return advantage.</p>
      </div>

      <svg
        className="spy-doji-bootstrap-svg"
        viewBox="0 0 720 250"
        role="img"
        aria-label="Bootstrap confidence intervals for 10, 20, and 40 session blocks; all intervals are above zero."
      >
        {[0, 2, 4, 6, 8, 10, 12, 14].map(tick => (
          <g key={tick}>
            <line
              x1={x(tick)}
              x2={x(tick)}
              y1="20"
              y2="205"
              stroke="currentColor"
              strokeOpacity={tick === 0 ? 0.4 : 0.09}
              strokeDasharray={tick === 0 ? '4 4' : undefined}
            />
            <text
              x={x(tick)}
              y="228"
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
            >
              {tick}
            </text>
          </g>
        ))}

        {data.map((row, index) => {
          const y = 55 + index * 62

          return (
            <g key={row.Block_Length}>
              <text x="0" y={y + 5} fontSize="14" fill="currentColor">
                {row.Block_Length}-day block
              </text>

              <line
                x1={x(row.CI_Low)}
                x2={x(row.CI_High)}
                y1={y}
                y2={y}
                stroke="#168b80"
                strokeWidth="6"
                strokeLinecap="round"
              />

              <circle
                cx={x(row.Observed_Advantage_pp)}
                cy={y}
                r="7"
                fill="#0b645e"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          )
        })}

        <text
          x="395"
          y="247"
          fontSize="12"
          textAnchor="middle"
          fill="currentColor"
        >
          Difference in positive-return frequency (percentage points)
        </text>
      </svg>

      <figcaption>
        Moving-block bootstrap, 3,000 replications per block length.
        The holding-period outcome remains 10 trading sessions for all
        three tests. Exploratory intervals are not adjusted for multiple testing.
      </figcaption>
    </figure>
  )
}

export function DojiUnconditionalChart() {
  const horizons = [1, 3, 5, 10]

  const doji = [54.29, 57.84, 57.69, 64.44]
  const baseline = [53.98, 56.94, 57.33, 59.90]

  return (
    <figure className="spy-doji-figure">
      <div className="spy-doji-chart-heading">
        <span>FIGURE 4</span>
        <h3>Does a Doji alone predict positive SPY returns?</h3>
        <p>Frequency of positive forward returns after Doji sessions versus all SPY sessions.</p>
      </div>

      <div className="spy-doji-chart-legend">
        <span><i className="spy-doji-key spy-doji-key-primary" /> Doji</span>
        <span><i className="spy-doji-key spy-doji-key-secondary" /> All SPY sessions</span>
      </div>

      <div className="spy-doji-periods">
        {horizons.map((horizon, index) => (
          <div className="spy-doji-period" key={horizon}>
            <div className="spy-doji-period-heading">
              <strong>{horizon}-day forward return</strong>
              <span>
                +{(doji[index] - baseline[index]).toFixed(2)} pp
              </span>
            </div>

            <div className="spy-doji-bar-row">
              <span>Doji</span>
              <div className="spy-doji-bar-track">
                <div
                  className="spy-doji-bar spy-doji-bar-primary"
                  style={{ width: `${doji[index]}%` }}
                />
              </div>
              <strong>{doji[index].toFixed(1)}%</strong>
            </div>

            <div className="spy-doji-bar-row">
              <span>All</span>
              <div className="spy-doji-bar-track">
                <div
                  className="spy-doji-bar spy-doji-bar-secondary"
                  style={{ width: `${baseline[index]}%` }}
                />
              </div>
              <strong>{baseline[index].toFixed(1)}%</strong>
            </div>
          </div>
        ))}
      </div>

      <figcaption>
        All-session baseline includes Doji sessions. Unadjusted SPY
        close-to-close price returns, excluding dividends.
        Differences are descriptive and do not establish trading profitability.
      </figcaption>
    </figure>
  )
}

export function DojiConfirmationChart() {
  const data = results.confirmation.filter(row => row.Horizon === 5)

  return (
    <figure className="spy-doji-figure">
      <div className="spy-doji-chart-heading">
        <span>FIGURE 5</span>
        <h3>Does confirmation improve directional accuracy?</h3>
        <p>Five-day directional success following a breakout from the preceding Doji range.</p>
      </div>

      <div className="spy-doji-chart-legend">
        <span><i className="spy-doji-key spy-doji-key-primary" /> Doji confirmation</span>
        <span><i className="spy-doji-key spy-doji-key-secondary" /> All comparable breakouts</span>
      </div>

      <div className="spy-doji-periods">
        {data.map(row => (
          <div className="spy-doji-period" key={row.Signal}>
            <div className="spy-doji-period-heading">
              <strong>{row.Signal}</strong>
              <span>
                {(row.Signal_Directional_Win_Rate -
                  row.Baseline_Directional_Win_Rate).toFixed(2)} pp
              </span>
            </div>

            <div className="spy-doji-bar-row">
              <span>Doji</span>
              <div className="spy-doji-bar-track">
                <div
                  className="spy-doji-bar spy-doji-bar-primary"
                  style={{
                    width: `${row.Signal_Directional_Win_Rate}%`,
                  }}
                />
              </div>
              <strong>
                {row.Signal_Directional_Win_Rate.toFixed(1)}%
              </strong>
            </div>

            <div className="spy-doji-bar-row">
              <span>All</span>
              <div className="spy-doji-bar-track">
                <div
                  className="spy-doji-bar spy-doji-bar-secondary"
                  style={{
                    width: `${row.Baseline_Directional_Win_Rate}%`,
                  }}
                />
              </div>
              <strong>
                {row.Baseline_Directional_Win_Rate.toFixed(1)}%
              </strong>
            </div>

            <p className="spy-doji-chart-note">
              {row.N} Doji confirmations. Bullish success means a positive
              return; bearish success means a negative return.
            </p>
          </div>
        ))}
      </div>

      <figcaption>
        Returns are measured from the confirmation-session close.
        The comparison includes all qualifying breakouts, including
        Doji confirmations. These are not independently matched controls.
      </figcaption>
    </figure>
  )
}

export function DojiStatisticalChart() {
  const data = results.statistics
  const min = -20
  const max = 20
  const left = 215
  const width = 435
  const x = (value: number) =>
    left + ((value - min) / (max - min)) * width

  const labels: Record<string, string> = {
    'Neutral Doji: 10d positive rate': 'Neutral Doji · 10d positive',
    'Bull confirmed: 1d positive rate': 'Bull confirmation · 1d positive',
    'Bear confirmed: 5d downside rate': 'Bear confirmation · 5d downside',
    'Bear confirmed: 5d average return': 'Bear confirmation · 5d return',
  }

  return (
    <figure className="spy-doji-figure">
      <div className="spy-doji-chart-heading">
        <span>FIGURE 6</span>
        <h3>Which effects are distinguishable from zero?</h3>
        <p>Observed differences and exploratory 95% moving-block bootstrap intervals.</p>
      </div>

      <svg
        className="spy-doji-bootstrap-svg"
        viewBox="0 0 720 340"
        role="img"
        aria-label="Four statistical comparisons with observed effects and 95 percent confidence intervals."
      >
        {[-20, -10, 0, 10, 20].map(tick => (
          <g key={tick}>
            <line
              x1={x(tick)}
              x2={x(tick)}
              y1="30"
              y2="285"
              stroke="currentColor"
              strokeOpacity={tick === 0 ? 0.45 : 0.1}
              strokeDasharray={tick === 0 ? '4 4' : undefined}
            />
            <text
              x={x(tick)}
              y="307"
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
            >
              {tick}
            </text>
          </g>
        ))}

        {data.map((row, index) => {
          const y = 60 + index * 67

          return (
            <g key={row.Test}>
              <text
                x="0"
                y={y + 5}
                fontSize="12"
                fill="currentColor"
              >
                {labels[row.Test] ?? row.Test.slice(0, 28)}
              </text>

              <line
                x1={x(row.CI_Low)}
                x2={x(row.CI_High)}
                y1={y}
                y2={y}
                stroke="#168b80"
                strokeWidth="5"
                strokeLinecap="round"
              />

              <circle
                cx={x(row.Difference_pp)}
                cy={y}
                r="6"
                fill="#0b645e"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          )
        })}

        <text
          x="435"
          y="334"
          textAnchor="middle"
          fontSize="12"
          fill="currentColor"
        >
          Difference (percentage points)
        </text>
      </svg>

      <figcaption>
        Moving-block bootstrap with 2,000 replications.
        Confidence intervals are exploratory and unadjusted
        for multiple comparisons. The zero line indicates
        no measured difference.
      </figcaption>
    </figure>
  )
}
