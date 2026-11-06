import { useEffect } from 'react'
import data from '../data/articles/nasdaq-ai-crash-2026.json'
import forwardReturns from '../data/articles/nasdaq-crash-forward-returns.json'
import './NasdaqAICrash2026Page.css'

type Point = { date: string; close: number; normalized: number }
type Bar = { name: string; value: number; note?: string }

const dotcom = data.normalized_comparison.dotcom
const ai = data.normalized_comparison.ai
const nov5 = data.worst_point_days.find(d => d.date === '2026-11-05')
const close = data.nasdaq_close

const historicalStocks = [
  { name: 'Microsoft', symbol: 'MSFT', value: -43 },
  { name: 'Cisco Systems', symbol: 'CSCO', value: -66 },
  { name: 'Intel', symbol: 'INTC', value: -49 },
  { name: 'Oracle', symbol: 'ORCL', value: -58 },
  { name: 'Sun Microsystems', symbol: 'SUNW', value: -56 },
  { name: 'Dell Computer', symbol: 'DELL', value: -54 },
  { name: 'Qualcomm', symbol: 'QCOM', value: -54 },
  { name: 'Yahoo', symbol: 'YHOO', value: -88 },
  { name: 'Applied Materials', symbol: 'AMAT', value: -51 },
  { name: 'JDS Uniphase', symbol: 'JDSU', value: -79 },
]

function maxDrawdown(points: Point[]) {
  let peak = 0
  let worst = 0
  for (const p of points) {
    peak = Math.max(peak, p.close)
    worst = Math.min(worst, (p.close / peak - 1) * 100)
  }
  return worst
}

function currentDrawdown(points: Point[]) {
  const peak = Math.max(...points.map(p => p.close))
  return (points[points.length - 1].close / peak - 1) * 100
}

const percent = (n: number) => `${n.toFixed(2)}%`

function Bars({ rows, title, note }: {
  rows: Bar[]
  title: string
  note: string
}) {
  const maximum = Math.max(1, ...rows.map(row => Math.abs(row.value)))
  return (
    <figure className="nac-figure">
      <figcaption>{title}</figcaption>
      <div className="nac-bars">
        {rows.map(row => (
          <div className="nac-bar-row" key={row.name}>
            <div className="nac-bar-label">
              <strong>{row.name}</strong>
              <strong>{percent(row.value)}</strong>
            </div>
            <div className="nac-track">
              <div className="nac-bar" style={{
                width: `${Math.abs(row.value) / maximum * 100}%`
              }}/>
            </div>
            {row.note && <div className="nac-bar-note">{row.note}</div>}
          </div>
        ))}
      </div>
      <p className="nac-source">{note}</p>
    </figure>
  )
}

function HistoricalComparison() {
  const chartUrl = '/images/social/nasdaq-ai-crash-2026-og.png'

  return (
    <figure className="nac-figure">
      <a href={chartUrl} target="_blank" rel="noopener noreferrer"
        aria-label="Open the full-size Nasdaq comparison chart in a new tab"
        style={{ display: 'block', cursor: 'zoom-in' }}>
        <img
          src={chartUrl}
          width={1200}
          height={630}
          alt="Nasdaq Composite daily closes indexed to 100. The blue line tracks the 1997–2002 dot-com cycle and the red line tracks the 2023–2026 AI boom. Each line has its own calendar-year labels."
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </a>
      <figcaption className="nac-source">
        Both series start at 100 and are aligned by trading session.
        Source: Yahoo Finance daily closing prices.
      </figcaption>
    </figure>
  )
}

const stocks2026 = [...data.stocks_2026]
  .sort((a, b) => a.drawdown_pct - b.drawdown_pct)

const peakAI = Math.max(...ai.map(point => point.close))
const scenarios = [20, 30, 40, 55.7, 77.9]

export default function NasdaqAICrash2026Page() {
  useEffect(() => {
    document.title = 'Nasdaq AI Stock Crash 2026 vs. the 2000 Dot-Com Bubble | TNI'
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    )
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href =
      'https://tradingninvestment.com/nasdaq-ai-crash-2026/'
  }, [])

  return (
    <main className="nac-page">
      <nav className="nac-breadcrumb" aria-label="Breadcrumb">
        <a href="/research/">Research</a> /{' '}
        <a href="/research/indexes/nasdaq/">Nasdaq</a> /{' '}
        AI Crash 2026
      </nav>

      <article>
        <header className="nac-hero">
          <span className="nac-eyebrow">
            TNI ORIGINAL RESEARCH · NOVEMBER 5, 2026
          </span>
          <h1>Nasdaq AI Stock Crash 2026 vs. the 2000 Dot-Com Bubble</h1>
          <p>
            On November 5, 2026, the Nasdaq Composite fell 1,421.51 points (5.52%), its largest one-day point drop in our daily closing-price data going back to December 1996. What could come next for AI stocks? To put the selloff in context, we compare today’s AI boom with the dot-com bubble, from the 1998 correction through the 2000 peak and the decline that followed. Where do the two booms look similar, and where do their paths diverge?
          </p>
          <p className="nac-byline">
            By <a href="/about/" rel="author">Kamal Khondkar</a> ·
            Quantitative Research · Data through November 5, 2026
          </p>
        </header>

        <section className="nac-record" aria-label="Historic selloff">
          <span className="nac-record-eyebrow">
            NOVEMBER 5, 2026 · RECORD NOMINAL POINT LOSS
          </span>
          <strong className="nac-record-number">
            {nov5?.points.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </strong>
          <h2>Nasdaq points lost in one trading session</h2>
          <div className="nac-record-bottom">
            <strong>{nov5 ? percent(nov5.percent) : 'N/A'}</strong>
            <span>Nasdaq close: {close.toLocaleString('en-US')}</span>
          </div>
          <p>
            The largest nominal one-day point loss in the downloaded
            Nasdaq series, which begins in December 1996.
            This is not the largest daily percentage decline.
          </p>
        </section>


        <section className="nac-crosslinks nac-crosslinks--under-record"
          aria-label="Explore market outlook and history">

          <a className="nac-crosslinks__card"
            href="https://app.tradingninvestment.com/prediction-lab?ticker=QQQ"
            target="_blank" rel="noopener noreferrer">
            <span className="nac-crosslinks__eyebrow">
              TNI MARKET INTELLIGENCE
            </span>
            <strong>Explore Nasdaq Outlook — Prediction Lab</strong>
            <span>View QQQ model outlooks, evidence and community voting.</span>
            <b>Open Prediction Lab ↗</b>
          </a>

          <a className="nac-crosslinks__card"
            href="/100-years-dow-jones-industrial-average-djia-events-history-chart/">
            <span className="nac-crosslinks__eyebrow">
              100 YEARS OF MARKET HISTORY
            </span>
            <strong>Dow Jones: 100 Years of Market History</strong>
            <span>Explore historical crashes, recoveries and major events.</span>
            <b>Explore Dow Jones History →</b>
          </a>

        </section>

        <div className="nac-metrics">
          <div>
            <span>AI BOOM · 2026 CORRECTION</span>
            <strong>{percent(currentDrawdown(ai))}</strong>
            <small>From prior closing peak</small>
          </div>
          <div>
            <span>DOT-COM CRASH · 2000–02</span>
            <strong>{percent(maxDrawdown(dotcom))}</strong>
            <small>Largest historical drawdown in period</small>
          </div>
          <div>
            <span>AI STOCK DRAWDOWNS</span>
            <strong>{stocks2026.length} stocks</strong>
            <small>Individual 12-month closing peaks</small>
          </div>
          <div>
            <span>HISTORICAL TRADING DAYS</span>
            <strong>Top 10</strong>
            <small>Daily point and percentage losses</small>
          </div>
        </div>

        <section className="nac-section">
          <h2>Two technology booms. Two different market cycles.</h2>
          <p>
            The Nasdaq rallied during the internet revolution, suffered
            a sharp correction in 1998, then surged into March 2000.
            Its subsequent collapse demonstrated that transformative
            technology and attractive stock-market returns are not the
            same thing.
          </p>
          <p>
            The AI boom beginning in 2023 shares the themes of infrastructure
            investment, earnings expectations and concentrated technology
            leadership. But similarities do not establish that 2026 will
            repeat the dot-com crash.
          </p>
          <HistoricalComparison/>
        </section>

        <section className="nac-section">
          <h2>The 1998 crash came before the dot-com peak</h2>
          <p>
            The Nasdaq lost roughly 30% during the 1998 market shock,
            then climbed to its March 2000 high. An initial deep
            correction did not end the technology boom.
          </p>
          <p>
            After March 2000, the collapse developed over approximately
            31 months. Strong interim rallies occurred before the
            October 2002 trough, illustrating why a rebound alone cannot
            establish that a bear market has ended.
          </p>
        </section>

        <section className="nac-section">
          <h2>10 AI and semiconductor stocks: 2026 peak drawdowns</h2>
          <p>
            The index-level selloff conceals much deeper declines in
            individual technology companies. Each figure below is
            calculated from the highest daily closing price during
            the preceding 12 months through November 5.
          </p>
          <Bars
            title="Selected AI-related stocks: peak-to-November 5 drawdown"
            rows={stocks2026.map(s => ({
              name: s.symbol,
              value: s.drawdown_pct,
              note: `Peak: ${s.peak_date} · ${s.peak_close.toFixed(2)} to ${s.nov5_close.toFixed(2)}`
            }))}
            note="Source: Yahoo Finance daily Close, downloaded through November 5, 2026. TNI calculations. This is a selected group, not a ranking of Nasdaq index contributions."
          />
        </section>

        <section className="nac-section">
          <h2>The 10 largest Nasdaq companies at the 2000 peak</h2>
          <p>
            The dot-com collapse was not limited to unprofitable
            internet startups. Microsoft, Cisco, Intel, Oracle and
            other established technology leaders suffered major
            stock-price declines.
          </p>
          <Bars
            title="March 2000 Nasdaq leaders: declines through March 5, 2001"
            rows={historicalStocks.map(s => ({
              name: s.symbol,
              value: s.value,
              note: s.name
            }))}
            note="Historical published figures, rounded to whole percentages. Source: Reuters' March 2000 Nasdaq company ranking and Los Angeles Times, March 6, 2001. These are first-year losses, not full 2000–2002 maximum drawdowns."
          />
          <p>
            The internet eventually became essential economic
            infrastructure. But that did not prevent enormous valuation
            losses among its leading suppliers. The same distinction
            between economic success and investment returns matters
            when analyzing AI.
          </p>
        </section>

        <section className="nac-section">
          <h2>Nasdaq's 10 worst single-day percentage declines</h2>
          <Bars
            title="Largest daily percentage losses in the available series"
            rows={data.worst_percentage_days.map(d => ({
              name: d.date,
              value: d.percent,
              note: `${d.points.toLocaleString('en-US')} index points`
            }))}
            note="Calculated from consecutive Nasdaq Composite daily closes, December 1996–November 5, 2026. Not an all-time ranking back to 1971."
          />
        </section>

        <section className="nac-section">
          <h2>Nasdaq's 10 largest daily point losses</h2>
          <Bars
            title="Daily point-loss ranking, converted to percentage changes"
            rows={data.worst_point_days.map(d => ({
              name: d.date,
              value: d.percent,
              note: `${d.points.toLocaleString('en-US')} points`
            }))}
            note="Ranking is by index points lost, while bar length shows the corresponding percentage loss for meaningful cross-era comparison. Source: Yahoo Finance daily Nasdaq closing levels."
          />
        </section>


        <section className="nac-section nac-forward-study">
          <h2>What Happened After Nasdaq Crashed 5% or More?</h2>
          <p>
            We analyzed Nasdaq Composite daily prices from February
            1971 through November 5, 2026. Historical forward returns
            cover approximately 1, 3, 6 and 12 months.
          </p>

          {forwardReturns.groups.map(group => (
            <div className="nac-forward-group" key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.events} qualifying crash sessions</p>
              <div className="nac-forward-grid">
                {group.results.map(row => (
                  <div className="nac-forward-card" key={row[0]}>
                    <strong>{row[0]}</strong>
                    <span>Average forward return</span>
                    <b>{Number(row[2]) > 0 ? '+' : ''}
                      {Number(row[2]).toFixed(2)}%</b>
                    <div className="nac-forward-track">
                      <div style={{
                        width: `${Math.min(100,
                          Math.abs(Number(row[2])) / 13 * 100)}%`
                      }}/>
                    </div>
                    <small>Median: {Number(row[3]).toFixed(2)}%</small>
                    <small>Positive: {Number(row[4]).toFixed(1)}%</small>
                    <small>Observations: {row[1]}</small>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <h3>Nasdaq's 10 Worst Crash Days: Forward Returns</h3>
          <div className="nac-forward-scroll">
            <table className="nac-forward-table">
              <thead>
                <tr>
                  <th>Date</th><th>Crash</th><th>1M</th>
                  <th>3M</th><th>6M</th><th>1Y</th>
                </tr>
              </thead>
              <tbody>
                {forwardReturns.worst_days.map(row => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    {row.slice(1).map((value, i) => (
                      <td key={i}
                        className={Number(value) >= 0
                          ? 'nac-gain' : 'nac-loss'}>
                        {Number(value) > 0 ? '+' : ''}
                        {Number(value).toFixed(2)}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>The Critical Difference: 1998 vs. 2000</h3>
          <p>
            After the August 31, 1998 crash, the Nasdaq gained 82.71%
            over the following 252 trading sessions. After the
            April 14, 2000 crash, it fell another 42.09%.
          </p>
          <p>
            One-day crashes did not consistently predict recoveries.
            Market conditions and valuation regimes mattered.
          </p>
          <p className="nac-forward-note">
            Source: Yahoo Finance daily Nasdaq Composite closes;
            TNI calculations. Horizons: 21, 63, 126 and 252 trading
            sessions. Crash observations may overlap and are not
            statistically independent. November 5, 2026 has no
            completed forward-return period.
          </p>
        </section>

        <section className="nac-section">
          <h2>How deep could a further Nasdaq correction become?</h2>
          <p>
            The following figures are mathematical stress scenarios
            calculated from the actual 2026 Nasdaq closing peak.
            They are not price forecasts or probabilities.
          </p>
          <figure className="nac-figure">
            <figcaption>
              Hypothetical Nasdaq levels from the 2026 closing peak
            </figcaption>
            <div className="nac-scenarios">
              {scenarios.map(loss => (
                <div key={loss}>
                  <span>−{loss.toFixed(1)}%</span>
                  <div className="nac-track">
                    <div className="nac-bar"
                      style={{ width: `${loss / 80 * 100}%` }}/>
                  </div>
                  <strong>
                    {(peakAI * (1 - loss / 100)).toLocaleString(
                      'en-US',
                      { maximumFractionDigits: 0 }
                    )}
                  </strong>
                </div>
              ))}
            </div>
            <p className="nac-source">
              Levels calculated directly from the maximum 2026
              Nasdaq closing price in the imported daily series.
            </p>
          </figure>
        </section>

        <section className="nac-section">
          <h2>What would confirm a deeper AI bear market?</h2>
          <p>
            The crucial evidence is not simply whether technology
            prices fall. Investors should watch revisions to AI
            infrastructure spending, semiconductor earnings expectations,
            free cash flow, market breadth and the sustainability
            of recoveries.
          </p>
          <p>
            AI can generate lasting economic value while some equity
            investments deliver disappointing returns. The dot-com
            era provides compelling historical evidence of that
            distinction, not a mechanical forecast for 2026.
          </p>
          <div className="nac-conclusion">
            <strong>Research conclusion</strong>
            <p>
              The technology can be right while the investment price
              is wrong. Compare valuations, earnings and drawdowns
              rather than assuming that a historical crash must repeat.
            </p>
          </div>
        </section>


        <section className="nac-crosslinks-bottom"
          aria-labelledby="nac-more-history-title">

          <h2 id="nac-more-history-title">
            Explore More Historical Market Returns
          </h2>

          <div className="nac-crosslinks">
            <a className="nac-crosslinks__card"
              href="/nasdaq-historical-annual-returns/">
              <span className="nac-crosslinks__eyebrow">
                NASDAQ COMPOSITE
              </span>
              <strong>Nasdaq Returns by Year</strong>
              <span>
                Explore historical annual returns, gains, losses
                and long-term performance.
              </span>
              <b>Explore Nasdaq Returns →</b>
            </a>

            <a className="nac-crosslinks__card"
              href="/sp-500-returns/">
              <span className="nac-crosslinks__eyebrow">
                S&P 500 INDEX
              </span>
              <strong>S&P 500 Returns by Year</strong>
              <span>
                Explore nearly a century of annual returns,
                corrections and market performance.
              </span>
              <b>Explore S&P 500 Returns →</b>
            </a>
          </div>
        </section>

        <footer className="nac-references">
          <h2>Sources and methodology</h2>
          <p>
            Nasdaq and 2026 stock charts: Yahoo Finance historical
            daily closing prices, calculated by TradingNInvestment.
            Returns exclude dividends. Historical 2000 stock losses
            refer to the first year after the March 2000 peak.
          </p>
          <p>
            <a href="https://fred.stlouisfed.org/series/NASDAQCOM">
              FRED: Nasdaq Composite historical series
            </a>
            {' · '}
            <a href="https://www.latimes.com/archives/la-xpm-2001-mar-06-fi-34059-story.html">
              Los Angeles Times: Inside Nasdaq (2001)
            </a>
            {' · '}
            <a href="https://www.investing.com/news/stock-market-news/nasdaq-looks-different-15-years-after-its-peak:-then-and-now-331733">
              Reuters: Nasdaq's 2000 market leaders
            </a>
          </p>
          <p>
            Related research:{' '}
            <a href="/nasdaq-selloff-2026/">
              Nasdaq 2026 semiconductor and SOXL selloff
            </a>
          </p>
        </footer>
      </article>
    </main>
  )
}
