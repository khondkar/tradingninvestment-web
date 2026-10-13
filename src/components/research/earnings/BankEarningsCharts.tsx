import data from '../../../data/research/jpm-gs-earnings.json'
import './BankEarningsCharts.css'

type Bank = 'JPM' | 'GS'

type Observation = {
  symbol: string
  earningsDate: string
  epsActual: number | null
  epsConsensus: number | null
  revenueActualBillions: number | null
  revenueConsensusBillions: number | null
  revenueConsensusStatus: string | null
}

const observations = data as Observation[]

const banks: { symbol: Bank; name: string }[] = [
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'GS', name: 'Goldman Sachs' },
]

function formatQuarter(date: string) {
  const d = new Date(`${date}T12:00:00Z`)
  const quarter = Math.ceil((d.getUTCMonth() + 1) / 3)
  return `Q${quarter} '${String(d.getUTCFullYear()).slice(-2)}`
}

function ComparisonChart({
  bank,
  metric,
}: {
  bank: Bank
  metric: 'eps' | 'revenue'
}) {
  const isEPS = metric === 'eps'
  const actualKey = isEPS ? 'epsActual' : 'revenueActualBillions'
  const consensusKey = isEPS ? 'epsConsensus' : 'revenueConsensusBillions'

  const rows = observations
    .filter(row => row.symbol === bank)
    .filter(row => row[actualKey] !== null)
    .sort((a, b) => a.earningsDate.localeCompare(b.earningsDate))

  const max = Math.max(
    1,
    ...rows.flatMap(row => [
      row[actualKey] ?? 0,
      row[consensusKey] ?? 0,
    ])
  )

  const money = (value: number) =>
    isEPS ? `$${value.toFixed(2)}` : `$${value.toFixed(2)}B`

  return (
    <div className="bank-earnings-chart">
      <h4>{banks.find(item => item.symbol === bank)?.name}</h4>

      <div className="bank-earnings-legend">
        <span><i className="bank-earnings-key actual" /> Actual</span>
        <span><i className="bank-earnings-key consensus" /> Consensus</span>
      </div>

      <div className="bank-earnings-scroll">
        <div
          className="bank-earnings-columns"
          style={{ minWidth: `${Math.max(560, rows.length * 43)}px` }}
        >
          {rows.map(row => {
            const actual = row[actualKey] ?? 0
            const consensus = row[consensusKey]

            return (
              <div className="bank-earnings-column" key={row.earningsDate}>
                <div className="bank-earnings-bars">
                  <div
                    className="bank-earnings-bar actual"
                    style={{ height: `${actual / max * 100}%` }}
                    title={`${row.earningsDate}: actual ${money(actual)}`}
                  />
                  {consensus !== null && (
                    <div
                      className="bank-earnings-bar consensus"
                      style={{ height: `${consensus / max * 100}%` }}
                      title={`${row.earningsDate}: consensus ${money(consensus)}`}
                    />
                  )}
                </div>
                <span>{formatQuarter(row.earningsDate)}</span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="bank-earnings-chart-note">
        {rows.length} reported observations.
        {!isEPS && ' Revenue consensus is available for only a subset of quarters and has not been verified as point-in-time.'}
      </p>
    </div>
  )
}

export function BankEPSCharts() {
  return (
    <figure className="bank-earnings-figure">
      <div className="bank-earnings-figure-heading">
        <span>FIGURE 1</span>
        <h3>Quarterly earnings per share: actual vs. consensus</h3>
        <p>Historical reported EPS and stored analyst estimates, 2021–2026.</p>
      </div>
      {banks.map(bank => (
        <ComparisonChart key={bank.symbol} bank={bank.symbol} metric="eps" />
      ))}
      <figcaption>
        Source: TradingNInvestment historical earnings dataset.
        Historical estimate vintages require independent verification.
        Goldman Sachs and JPMorgan have different per-share earnings scales.
      </figcaption>
    </figure>
  )
}

export function BankRevenueCharts() {
  return (
    <figure className="bank-earnings-figure">
      <div className="bank-earnings-figure-heading">
        <span>FIGURE 2</span>
        <h3>Quarterly revenue: reported vs. available consensus</h3>
        <p>Revenue in USD billions. Missing consensus observations are not estimated.</p>
      </div>
      {banks.map(bank => (
        <ComparisonChart key={bank.symbol} bank={bank.symbol} metric="revenue" />
      ))}
      <figcaption>
        Source: TradingNInvestment compiled historical data.
        Revenue definitions and historical consensus timing remain subject
        to verification. The consensus series must not be interpreted
        as a complete historical record.
      </figcaption>
    </figure>
  )
}
