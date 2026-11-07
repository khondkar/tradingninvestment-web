import data from '../../data/research/brkbCashBuybacks.json'
import './BerkshireCashBuybacks.css'

const billions = (millions: number) => `$${(millions / 1000).toFixed(2)}B`
const dateLabel = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${value}T00:00:00Z`))

export default function BerkshireCashBuybacks() {
  const rows = data.annual
  const latest = data.latest
  const cashScale = Math.ceil(Math.max(...rows.map(row => row.gross_liquidity_m)) / 50000) * 50000
  const buybackScale = Math.ceil(Math.max(...rows.map(row => row.buybacks_cash_paid_m), 1000) / 5000) * 5000
  return (
    <section id="brkb-cash-buybacks" className="tni-leveraged-drawdown tni-brkb-capital" aria-labelledby="brkb-capital-title">
      <span className="tni-leveraged-drawdown__eyebrow">CASH RESERVES &amp; CAPITAL ALLOCATION</span>
      <h2 id="brkb-capital-title">Berkshire Hathaway Cash Reserves &amp; Share Buybacks</h2>
      <p>
        How much liquidity did Berkshire hold, and how much cash did it spend buying back its own shares?
        Compare the ten completed years from {rows[0].year} to {rows[rows.length - 1].year},
        with the latest reported period shown separately. Cash supports obligations and investment
        flexibility; it does not guarantee protection from stock-price declines.
      </p>
      <div className="tni-brkb-capital__latest">
        <h3>Latest reported snapshot: {dateLabel(latest.period_end)}</h3>
        <div className="tni-brkb-capital__cards">
          <div><span>Cash, equivalents &amp; Treasury bills</span><strong>{billions(latest.gross_liquidity_m)}</strong><span>Consolidated gross balance</span></div>
          <div><span>After Treasury purchase payables</span><strong>{billions(latest.liquidity_net_of_treasury_payables_m)}</strong><span>Gross less {billions(latest.treasury_purchase_payables_m)} unsettled purchases</span></div>
          <div><span>Cash paid for share buybacks</span><strong>{billions(latest.buybacks_cash_paid_m)}</strong><span>{latest.label} · Not annualized</span></div>
        </div>
        <p>
          Cash and equivalents: {billions(latest.cash_equivalents_m)}; separately reported Treasury bills:
          {' '}{billions(latest.treasury_bills_m)}. Berkshire reported approximately ${latest.buybacks_executed_rounded_b.toFixed(1)}B
          {' '}of repurchases executed during the first nine months, including September purchases settled in October.
          That is different from cash paid within the period. The balance after Treasury payables is not net cash after all debt or obligations.
          {' '}<a href={latest.balance_source}>Balance sheet</a> · <a href={latest.buyback_source}>Cash-flow statement</a>
        </p>
      </div>
      <div className="tni-brkb-capital__charts">
        {([
          { key: 'gross_liquidity_m', heading: 'Year-end cash, equivalents & Treasury bills', scale: cashScale, className: 'cash' },
          { key: 'buybacks_cash_paid_m', heading: 'Annual share buybacks: cash paid', scale: buybackScale, className: 'buybacks' },
        ] as const).map(chart => (
          <figure key={chart.key}>
            <figcaption>{chart.heading}</figcaption>
            <p className="tni-brkb-capital__scale">USD billions · Scale: $0–${chart.scale / 1000}B</p>
            {rows.map(row => (
              <div className="tni-brkb-capital__row" key={row.year}>
                <span>{row.year}</span>
                <div className="tni-brkb-capital__track" aria-hidden="true"><div className={chart.className} style={{ width: `${row[chart.key] / chart.scale * 100}%` }} /></div>
                <strong>{billions(row[chart.key])}</strong>
              </div>
            ))}
          </figure>
        ))}
      </div>
      <p>Charts use separate scales. Cash is a December 31 balance; buybacks are cash spent during the year. The 2026 year-to-date figures are excluded from these full-year charts.</p>
      <div className="tni-brkb-capital__table">
        <table>
          <caption>Annual history and filing sources · USD billions</caption>
          <thead><tr><th scope="col">Year</th><th scope="col">Cash &amp; equivalents</th><th scope="col">Treasury bills*</th><th scope="col">Gross total</th><th scope="col">Buybacks: cash paid</th><th scope="col">Sources</th></tr></thead>
          <tbody>{rows.map(row => (
            <tr key={row.year}><th scope="row">{row.year}</th><td>{billions(row.cash_equivalents_m)}</td><td>{billions(row.treasury_bills_m)}</td><td>{billions(row.gross_liquidity_m)}</td><td>{billions(row.buybacks_cash_paid_m)}</td><td><a href={row.balance_source}>Balance sheet</a> · <a href={row.buyback_source}>Buybacks</a></td></tr>
          ))}</tbody>
        </table>
      </div>
      <details>
        <summary>Definitions, sources and reporting dates</summary>
        <p>*Treasury bills here are the separately reported short-term investment line. {data.methodology.cash}</p>
        <p>{data.methodology.buybacks}</p>
        <p>Annual figures use comparative statements in Berkshire&apos;s annual reports; 2016 zero buybacks are also confirmed in its 2016 Form 10-K. Amounts are stored in USD millions and displayed in billions, rounded to two decimals.</p>
        <p>{data.methodology.updates} Last financial-data review: {dateLabel(data.reviewed_on)}.</p>
      </details>
    </section>
  )
}
