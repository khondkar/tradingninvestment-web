import { useEffect } from 'react'
import data from '../data/research/jpm-gs-earnings.json'
import {
  BankEPSCharts,
  BankRevenueCharts,
} from '../components/research/earnings/BankEarningsCharts'
import './JPMvsGSEarningsResearchPage.css'

const canonicalPath = '/research/jpm-vs-gs-earnings-analysis/'

type Observation = {
  symbol: string
  earningsDate: string
  epsActual: number | null
  epsConsensus: number | null
  return30mPct: number | null
  preEarnings5dPct: number | null
}

const observations = data as Observation[]

function summarize(symbol: string) {
  const rows = observations.filter(row => row.symbol === symbol)
  const epsPairs = rows.filter(
    row => row.epsActual !== null && row.epsConsensus !== null
  )
  const beats = epsPairs.filter(
    row => (row.epsActual ?? 0) > (row.epsConsensus ?? 0)
  ).length

  return { observations: rows.length, beats, epsPairs: epsPairs.length }
}

const jpm = summarize('JPM')
const gs = summarize('GS')

function ReactionTable() {
  const groups = [
    { symbol: 'JPM', name: 'JPMorgan Chase' },
    { symbol: 'GS', name: 'Goldman Sachs' },
  ]

  return (
    <div className="bank-study-table-wrap">
      <table data-tni-readable-table="data">
        <caption>
          Five-day pre-earnings momentum and first 30-minute reactions
        </caption>
        <thead>
          <tr>
            <th>Bank</th>
            <th>Prior five-day return</th>
            <th>Events</th>
            <th>Positive 30m reactions</th>
            <th>Average 30m return</th>
          </tr>
        </thead>
        <tbody>
          {groups.flatMap(bank =>
            [
              { label: 'Positive', test: (n: number) => n > 0 },
              { label: 'Negative', test: (n: number) => n < 0 },
            ].map(group => {
              const rows = observations.filter(
                row =>
                  row.symbol === bank.symbol &&
                  row.preEarnings5dPct !== null &&
                  row.return30mPct !== null &&
                  group.test(row.preEarnings5dPct)
              )

              const positive = rows.filter(
                row => (row.return30mPct ?? 0) > 0
              ).length

              const average = rows.length
                ? rows.reduce(
                    (sum, row) => sum + (row.return30mPct ?? 0), 0
                  ) / rows.length
                : null

              return (
                <tr key={`${bank.symbol}-${group.label}`}>
                  <td>{bank.name}</td>
                  <td>{group.label}</td>
                  <td>{rows.length}</td>
                  <td>
                    {rows.length
                      ? `${(positive / rows.length * 100).toFixed(1)}%`
                      : '—'}
                  </td>
                  <td>
                    {average === null
                      ? '—'
                      : `${average >= 0 ? '+' : ''}${average.toFixed(2)}%`}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function JPMvsGSEarningsResearchPage() {
  useEffect(() => {
    document.title =
      'JPMorgan vs. Goldman Sachs Earnings: Historical EPS, Revenue & Market Reactions | TradingNInvestment'

    let canonical =
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]')

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }

    canonical.href = `https://tradingninvestment.com${canonicalPath}`

    let description =
      document.querySelector<HTMLMetaElement>('meta[name="description"]')

    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.appendChild(description)
    }

    description.content =
      'Compare JPMorgan and Goldman Sachs across 46 historical earnings announcements, including EPS versus consensus, revenue trends, and early market reactions.'
  }, [])

  return (
    <main className="bank-study">
      <nav className="bank-study-breadcrumb" aria-label="Breadcrumb">
        <a href="/research/">Research</a>
        <span>›</span>
        <a href="/research/stocks/">Stocks</a>
        <span>›</span>
        <a href="/research/stocks/gs/">GS</a>
        <span>›</span>
        <span aria-current="page">Earnings</span>
      </nav>

      <article>
        <header className="bank-study-hero">
          <span className="bank-study-eyebrow">
            TNI ORIGINAL RESEARCH / BANK EARNINGS
          </span>

          <h1>
            JPMorgan vs. Goldman Sachs
            <span> What Historical Earnings Data Reveals</span>
          </h1>

          <p className="bank-study-dek">
            A data-driven comparison of quarterly earnings,
            Wall Street expectations, revenue performance,
            and the first 30 minutes of trading following
            earnings announcements.
          </p>

          <p className="bank-study-byline">
            By <a href="/about/" rel="author">Kamal Khondkar</a>
            {' · '}TradingNInvestment Research
            {' · '}Historical sample through July 2026
          </p>
        </header>

        <section className="bank-study-key-findings" aria-label="Key findings">
          <div>
            <span>HISTORICAL EVENTS</span>
            <strong>46</strong>
            <p>23 announcements per bank</p>
          </div>
          <div>
            <span>JPM EPS BEATS</span>
            <strong>{jpm.beats}/{jpm.epsPairs}</strong>
            <p>Reported EPS above stored consensus</p>
          </div>
          <div>
            <span>GS EPS BEATS</span>
            <strong>{gs.beats}/{gs.epsPairs}</strong>
            <p>Reported EPS above stored consensus</p>
          </div>
        </section>

        <div className="bank-study-body">
          <section>
            <h2>Two major banks, two different earnings profiles</h2>
            <p>
              JPMorgan Chase and Goldman Sachs occupy different positions
              within the US banking industry. JPMorgan combines consumer
              banking, commercial lending, payments, asset management,
              and investment banking. Goldman Sachs has greater exposure
              to investment banking, institutional trading, and asset
              and wealth management.
            </p>
            <p>
              These differences make their quarterly earnings reports
              useful for studying how investors interpret profitability,
              expectations, and changing financial conditions.
              A strong earnings report does not necessarily produce
              a positive stock-price reaction. Markets respond to
              information relative to what investors anticipated.
            </p>
          </section>

          <section>
            <h2>Actual earnings per share versus consensus</h2>
            <p>
              Our historical dataset contains 23 earnings announcements
              for each bank between January 2021 and July 2026.
              Every observation includes reported earnings per share
              and a stored analyst estimate.
            </p>
            <p>
              Comparing these two measures illustrates the difference
              between reported profitability and expectations.
              Because Goldman Sachs and JPMorgan have different share
              counts and business models, absolute EPS levels should
              not be interpreted as a direct measure of which bank
              performs better.
            </p>
            <BankEPSCharts />
            <p>
              The historical record includes both substantial earnings
              beats and periods of disappointment. For example,
              Goldman Sachs reported EPS of $20.98 against a stored
              estimate of $14.54 in July 2026, while JPMorgan reported
              $6.14 against $5.80 in the same reporting month.
              These figures describe historical results, not future
              earnings expectations.
            </p>
          </section>

          <section>
            <h2>Revenue performance provides a second perspective</h2>
            <p>
              EPS can be affected by operating expenses, credit costs,
              taxes, provisions, and other accounting items. Revenue
              provides another perspective on business activity,
              although the revenue definitions used by banks may differ.
            </p>
            <p>
              Our dataset currently contains 17 reported revenue
              observations for each bank. Historical revenue consensus
              is much less complete: only three JPMorgan quarters
              and four Goldman Sachs quarters contain both a reported
              revenue figure and a consensus estimate.
            </p>
            <BankRevenueCharts />
            <p>
              The available revenue-consensus observations were
              collected from retrospective earnings reports.
              Their availability before the original announcements
              has not been independently established. They should
              therefore be interpreted as historical comparisons,
              not as a verified point-in-time forecasting dataset.
            </p>
          </section>

          <section>
            <h2>How did the stocks react after earnings?</h2>
            <p>
              An earnings beat is not equivalent to a positive stock
              return. Investors may focus on management guidance,
              business mix, credit quality, expenses, or the outlook
              for interest rates rather than the headline EPS figure.
            </p>
            <p>
              To examine immediate market behavior, we compiled
              a first-30-minute reaction measure alongside each
              earnings observation. This provides a narrower view
              than the full trading day and should not be interpreted
              as a complete assessment of market response.
            </p>
          </section>

          <section>
            <h2>Pre-earnings momentum and early market reactions</h2>
            <p>
              We also examined each bank's five-session price
              performance before its earnings announcement.
              The table separates observations with positive
              and negative preceding returns and compares the
              subsequent early price reactions.
            </p>

            <ReactionTable />

            <p>
              In this sample, JPMorgan's positive pre-earnings
              momentum observations were associated with more
              frequent positive early reactions than its negative
              momentum observations. Goldman Sachs displayed
              a different historical pattern.
            </p>
            <p>
              These are descriptive relationships based on small
              samples. They do not establish causation, statistical
              significance, or a reliable trading strategy.
              Differences in release timing and market conditions
              may also influence the measurements.
            </p>
          </section>

          <section>
            <h2>What matters beyond an earnings beat?</h2>
            <p>
              Bank earnings require interpretation across several
              business dimensions. For JPMorgan, investors commonly
              monitor net interest income, lending activity,
              credit-loss provisions, deposit trends, and capital
              management. For Goldman Sachs, investment banking
              activity, advisory fees, underwriting, trading,
              and asset-management performance are particularly
              relevant.
            </p>
            <p>
              Expenses, regulatory capital requirements, and
              management commentary can materially affect the
              market's interpretation of both banks' results.
              The historical charts in this study do not
              independently measure these additional variables.
            </p>
          </section>

          <section>
            <h2>Conclusion</h2>
            <p>
              The historical earnings records of JPMorgan and
              Goldman Sachs illustrate why investors should
              distinguish between absolute financial results,
              performance relative to expectations, and subsequent
              market reactions.
            </p>
            <p>
              Our comparison provides a foundation for examining
              those differences across multiple reporting periods.
              It does not support a directional forecast for
              either stock's next earnings announcement.
            </p>
          </section>

          <section className="bank-study-methodology">
            <h2>Methodology and limitations</h2>
            <p>
              This study uses 46 historical earnings observations:
              23 for JPMorgan Chase and 23 for Goldman Sachs,
              dated January 2021 through July 2026. EPS figures,
              revenue observations, and early market reactions
              come from TradingNInvestment's compiled research
              dataset.
            </p>
            <p>
              Pre-earnings momentum is based on historical adjusted
              daily closing prices. The early reaction measure
              uses the dataset's approximate 9:30 a.m. to
              10:00 a.m. Eastern Time price window. Release
              timestamps and reaction-window alignment require
              final independent verification, particularly for
              announcements occurring outside regular market hours.
            </p>
            <p>
              Historical analyst-estimate vintages have not been
              independently verified. Revenue data are incomplete,
              and available revenue-consensus figures were sourced
              retrospectively. The findings are exploratory and
              should not be treated as validated trading signals.
            </p>
          </section>

          <p className="bank-study-disclosure">
            Research disclosure: This material is provided for
            informational and educational purposes only. It is
            not investment advice, a recommendation, or a forecast.
            Historical performance does not guarantee future results.
          </p>
        </div>
      </article>
    </main>
  )
}
