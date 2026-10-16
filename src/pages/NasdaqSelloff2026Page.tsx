import chipDrawdowns from '../data/articles/chip-stock-drawdowns-2026.json'
import { useEffect } from 'react'
import data from '../data/articles/nasdaq-selloff-2026.json'
import './NasdaqSelloff2026Page.css'

const labels: Record<string, string> = {
  nasdaq: 'Nasdaq Composite',
  nasdaq100: 'Nasdaq-100',
  sox: 'PHLX Semiconductor Index',
  smh: 'SMH',
  soxl: 'SOXL',
}

const order = ['nasdaq', 'nasdaq100', 'sox', 'smh', 'soxl'] as const


function PerformanceBars({
  field,
  title,
}: {
  field: 'daily_return_pct' | 'oct13_to_latest_pct' | 'drawdown_from_2026_peak_pct'
  title: string
}) {
  const maximum = Math.max(
    ...order.map((key) => Math.abs(data.summary[key][field])),
  )

  return (
    <figure className="ns26-chart">
      <figcaption>{title}</figcaption>
      <div className="ns26-bars">
        {order.map((key) => {
          const value = data.summary[key][field]
          return (
            <div className="ns26-bar-row" key={key}>
              <div className="ns26-bar-label">
                <span>{labels[key]}</span>
                <strong>{value.toFixed(2)}%</strong>
              </div>
              <div className="ns26-track">
                <div
                  className={`ns26-fill ${key === 'soxl' ? 'ns26-fill-soxl' : ''}`}
                  style={{ width: `${Math.abs(value) / maximum * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </figure>
  )
}

function NasdaqDrawdownChart() {
  const points = data.nasdaq_drawdown
  const width = 760
  const height = 260
  const padding = 24
  const values = points.map((point) => point.drawdown_pct)
  const minimum = Math.min(...values, -1)
  const maximum = Math.max(...values, 0)
  const range = maximum - minimum || 1

  const coordinates = points.map((point, index) => {
    const x = padding + index / Math.max(points.length - 1, 1) * (width - padding * 2)
    const y = padding + (maximum - point.drawdown_pct) / range * (height - padding * 2)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  return (
    <figure className="ns26-chart">
      <figcaption>Nasdaq Composite drawdown from its previous all-time closing high</figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Nasdaq Composite drawdown, September through October 16, 2026"
      >
        <line x1={padding} y1={padding} x2={width - padding} y2={padding}
          stroke="#d8e4e1" strokeDasharray="5 5" />
        <line x1={padding} y1={height - padding} x2={width - padding}
          y2={height - padding} stroke="#d8e4e1" />
        <polyline
          points={coordinates.join(' ')}
          fill="none"
          stroke="#087965"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <p className="ns26-chart-note">
        September 1–October 16, 2026. Daily closing-price drawdowns;
        reference high is calculated from the full available Nasdaq series.
      </p>
    </figure>
  )
}

function HistoricalChart() {
  const items = data.historical_drawdowns

  return (
    <figure className="ns26-chart">
      <figcaption>Historical Nasdaq Composite drawdowns</figcaption>
      <div className="ns26-bars">
        {items.map((item) => (
          <div className="ns26-bar-row" key={item.label}>
            <div className="ns26-bar-label">
              <span>{item.label}</span>
              <strong>{item.max_drawdown_pct.toFixed(2)}%</strong>
            </div>
            <div className="ns26-track">
              <div
                className="ns26-fill"
                style={{ width: `${Math.abs(item.max_drawdown_pct) / 80 * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="ns26-chart-note">
        Historical comparison is provisional. Drawdowns use the running
        all-time closing high; the 2008–2009 episode therefore retains
        the earlier dot-com peak as its reference. The 2026 historical
        value is the worst year-to-date drawdown, not the October decline.
      </p>
    </figure>
  )
}


function ChipStockDrawdowns() {
  const stocks = [...chipDrawdowns].sort(
    (a, b) => a.drawdown_pct - b.drawdown_pct
  )

  return (
    <section className="tni-chip-drawdowns" aria-labelledby="chip-drawdown-title">
      <div className="tni-chip-drawdowns__heading">
        <span className="tni-chip-drawdowns__eyebrow">TNI RESEARCH · MARKET RISK</span>
        <h2 id="chip-drawdown-title">The Semiconductor Selloff Beneath the Nasdaq</h2>
        <p>Seven AI, memory, storage and semiconductor stocks — drawdown from each stock's own 2026 closing high.</p>
      </div>

      <div className="tni-chip-drawdowns__chart">
        {stocks.map((stock) => (
          <div className="tni-chip-drawdowns__row" key={stock.symbol}>
            <span className="tni-chip-drawdowns__ticker">{stock.symbol}</span>
            <div className="tni-chip-drawdowns__track">
              <div
                className="tni-chip-drawdowns__bar"
                style={{ width: `${Math.abs(stock.drawdown_pct) / 60 * 100}%` }}
              />
            </div>
            <strong className="tni-chip-drawdowns__value">
              {stock.drawdown_pct.toFixed(2)}%
            </strong>
          </div>
        ))}
      </div>

      <p className="tni-chip-drawdowns__source">
        As of October 16, 2026. Source: Yahoo Finance closing prices;
        TNI calculations. Peak dates vary by stock.
      </p>
    </section>
  )
}

export default function NasdaqSelloff2026Page() {
  useEffect(() => {
    const canonicalUrl = 'https://tradingninvestment.com/nasdaq-selloff-2026/'
    document.title =
      'Nasdaq Selloff 2026: AI, Semiconductors & SOXL Risk | TradingNInvestment'

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
  }, [])

  const soxl = data.summary.soxl
  const nasdaq = data.summary.nasdaq

  return (
    <main className="ns26-page">
      <nav className="ns26-breadcrumb" aria-label="Breadcrumb">
        <a href="/research/">Research</a>
        <span>›</span>
        <a href="/research/indexes/nasdaq/">Nasdaq</a>
        <span>›</span>
        <span>2026 Selloff</span>
      </nav>

      <article>
        <header className="ns26-hero">
          <div className="ns26-eyebrow">TNI MARKET RESEARCH · OCTOBER 16, 2026</div>
          <h1>Nasdaq Selloff 2026: AI Stocks, Semiconductor Risk, and the Hidden Danger of 3× Leveraged ETFs</h1>
        <figure className="ns26-hero-chart">
          <img
            src="/images/social/research/nasdaq-selloff-2026-tni-og.png"
            alt="Horizontal bar chart comparing 2026 drawdowns: Nasdaq Composite 5.13%, Nasdaq-100 6.26%, PHLX Semiconductor Index 23.07%, SMH 18.50%, and SOXL 67.70%."
            width={1200}
            height={630}
            fetchPriority="high"
            decoding="async"
          />
          <figcaption>
            Five market drawdowns measured from each asset's own 2026 closing high.
            Source: Yahoo Finance; TNI calculations.
          </figcaption>
        </figure>

          <p className="ns26-deck">
            The Nasdaq is retreating, semiconductor losses are deeper,
            and SOXL illustrates how daily leverage can magnify investor risk.
          </p>
          <p className="ns26-byline">
            By <a href="/about/" rel="author">Kamal Khondkar</a>
            {' · '}Quantitative Research · Data through October 16, 2026
          </p>
        </header>

        <ChipStockDrawdowns />
      <section className="ns26-snapshot" aria-label="Market snapshot">
          <div>
            <span>Nasdaq · October 16</span>
            <strong>{nasdaq.daily_return_pct.toFixed(2)}%</strong>
            <small>One trading day</small>
          </div>
          <div>
            <span>SOXL · October 13–16</span>
            <strong>{soxl.oct13_to_latest_pct.toFixed(2)}%</strong>
            <small>Three sessions</small>
          </div>
          <div>
            <span>SOXL · 2026 high</span>
            <strong>{soxl.drawdown_from_2026_peak_pct.toFixed(2)}%</strong>
            <small>Closing-price drawdown</small>
          </div>
        </section>

        <section>
          <h2>What happened to the Nasdaq?</h2>
          <p>
            On October 16, 2026, the Nasdaq Composite declined
            {` ${Math.abs(nasdaq.daily_return_pct).toFixed(2)}%`}.
            Its closing level stood {Math.abs(nasdaq.drawdown_from_2026_peak_pct).toFixed(2)}%
            below its 2026 closing high.
          </p>
          <p>
            The weakness extended beyond the broad index.
            Semiconductor exposure experienced considerably larger
            declines, particularly in leveraged products.
          </p>
          <NasdaqDrawdownChart />
        </section>

        <section>
          <h2>Semiconductors and SOXL: where losses accelerated</h2>
          <p>
            Between the October 13 and October 16 closes,
            SOXL declined {Math.abs(soxl.oct13_to_latest_pct).toFixed(2)}%.
            Over the same dates, SMH fell
            {` ${Math.abs(data.summary.smh.oct13_to_latest_pct).toFixed(2)}%`},
            while the PHLX Semiconductor Index declined
            {` ${Math.abs(data.summary.sox.oct13_to_latest_pct).toFixed(2)}%`}.
          </p>
          <PerformanceBars
            field="oct13_to_latest_pct"
            title="Three-session price performance · October 13–16, 2026"
          />
          <p>
            These are different instruments with different index
            methodologies. SMH and the PHLX Semiconductor Index
            provide semiconductor context, not an exact reconstruction
            of SOXL's benchmark returns.
          </p>
        </section>

        <section>
          <h2>SOXL's 67.70% drawdown: understanding leveraged ETF risk</h2>
          <p>
            SOXL seeks three times the daily performance of its
            designated semiconductor benchmark, before fees and expenses.
            Its objective resets daily; it does not promise three times
            the benchmark's cumulative return over longer periods.
          </p>
          <PerformanceBars
            field="drawdown_from_2026_peak_pct"
            title="Drawdown from each asset's own 2026 closing high"
          />
          <p>
            A hypothetical benchmark loss of 5% in one day would
            correspond to approximately 15% for a perfectly tracking
            3× long fund, before costs. Actual fund returns can differ.
          </p>
          <p>
            Compounding also matters. If a benchmark falls 10% and then
            rebounds 11.11%, it returns approximately to its starting
            level. A hypothetical daily-reset 3× product would fall
            30%, then gain 33.33%, ending about 6.67% lower.
          </p>
          <p>
            This illustrates path dependence, not a forecast or an
            attribution of SOXL's observed losses.
          </p>
          <a className="ns26-cta" href="/research/scanners/leveraged-etf/">
            Explore the TNI Leveraged ETF Scanner <span aria-hidden="true">→</span>
          </a>
        </section>

        <section>
          <h2>How does the selloff compare with previous Nasdaq declines?</h2>
          <p>
            The dot-com collapse, the global financial crisis,
            the COVID shock, and the 2022 bear market offer useful
            historical context. Their causes and recovery paths differed.
          </p>
          <HistoricalChart />
          <p>
            The Nasdaq's worst 2026 year-to-date drawdown in this
            dataset occurred on March 30. It should not be confused
            with the smaller October drawdown.
          </p>
        </section>

        <section>
          <h2>What could happen next?</h2>
          <p>
            A sustained recovery would require stabilization in
            semiconductor leadership, improving market breadth,
            and a reduction in downside volatility.
          </p>
          <p>
            Continued weakness could deepen drawdowns, especially
            for investors holding leveraged semiconductor exposure.
            Neither scenario is a prediction.
          </p>
        </section>

        <section className="ns26-methodology">
          <h2>Data and methodology</h2>
          <p>
            Source: Yahoo Finance historical daily closing prices,
            downloaded October 16, 2026. TNI calculated daily returns,
            cumulative price changes, and closing-price drawdowns.
          </p>
          <p>
            Figures exclude dividends and other total-return
            adjustments. SOXL historical prices may reflect share
            splits; the analysis uses the downloaded Close series.
            Results are historical and not investment advice.
          </p>
          <p>
            Additional research:
            {' '}<a href="/research/indexes/nasdaq/">Nasdaq Research</a>
            {' · '}<a href="/research/etfs/leveraged/">Leveraged ETF Research</a>
          </p>
        </section>
      </article>
    </main>
  )
}
