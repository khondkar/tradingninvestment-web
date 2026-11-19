import './AmdlLeveragedComparison.css'

const stockVsFund = [
  { ticker: 'AMD', name: 'Advanced Micro Devices', exposure: 'AMD stock · unleveraged', return2025: '+77.30%', href: '/amd-stock-returns-drawdowns-and-recovery/' },
  { ticker: 'AMDL', name: 'GraniteShares 2x Long AMD Daily ETF', exposure: 'AMD stock · 2× daily', return2025: '+103.00%', href: 'https://graniteshares.com/etfs/amdl/' },
]

const fundComparison = [
  { ticker: 'AMD', name: 'Advanced Micro Devices', exposure: 'AMD stock · unleveraged', return2025: '+77.30%', href: '/amd-stock-returns-drawdowns-and-recovery/' },
  { ticker: 'NVDL', name: 'GraniteShares 2x Long NVDA Daily ETF', exposure: 'NVIDIA stock · 2× daily', return2025: '+32.57%', href: '/nvdl-etf/' },
  { ticker: 'QLD', name: 'ProShares Ultra QQQ', exposure: 'Nasdaq-100 · 2× daily', return2025: '+30.36%', href: 'https://www.proshares.com/our-etfs/leveraged-and-inverse/qld' },
  { ticker: 'TQQQ', name: 'ProShares UltraPro QQQ', exposure: 'Nasdaq-100 · 3× daily', return2025: '+34.35%', href: '/tqqq-returns/' },
]

function ComparisonTable({ rows, caption }: { rows: typeof stockVsFund; caption: string }) {
  return (
    <div className="amdl-leveraged-compare__scroll" role="region" aria-label={caption} tabIndex={0}>
      <table>
        <caption>{caption}</caption>
        <thead><tr><th scope="col">Ticker</th><th scope="col">Exposure</th><th scope="col">2025 adjusted-close return</th></tr></thead>
        <tbody>{rows.map(fund => {
          const external = fund.href.startsWith('http')
          return <tr key={fund.ticker}>
            <th scope="row"><a href={fund.href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{fund.ticker}</a><span>{fund.name}</span></th>
            <td>{fund.exposure}</td>
            <td>{fund.return2025}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
  )
}

export default function AmdlLeveragedComparison() {
  return (
    <section className="amdl-leveraged-compare" aria-labelledby="amdl-fund-comparison">
      <p className="amdl-leveraged-compare__eyebrow">RETURNS · DAILY OBJECTIVES · RISK</p>
      <h2 id="amdl-fund-comparison">AMDL compared with AMD, NVDL, QLD and TQQQ</h2>
      <p>
        The first comparison isolates AMD stock from AMDL’s 2× daily objective. The second
        places AMD beside NVDL, QLD and TQQQ to contrast an unleveraged chip stock with two
        single-stock and two Nasdaq-100 leveraged funds. They track different exposures, so
        this is a cross-asset comparison, not a claim that the funds are interchangeable.
      </p>
      <h3>AMD vs AMDL</h3>
      <ComparisonTable rows={stockVsFund} caption="AMD stock and AMDL · 2025" />
      <h3>AMD vs NVDL vs QLD (with TQQQ)</h3>
      <ComparisonTable rows={fundComparison} caption="Underlying exposure and 2025 adjusted-close returns" />
      <p className="amdl-leveraged-compare__note">
        Returns use adjusted-close endpoints from Dec. 31, 2024 to Dec. 31, 2025 and are rounded.
        AMD, AMDL and NVDL had no distributions in the return observations; adjusted close
        accounts for distributions where applicable for QLD and TQQQ. Daily objectives reset
        each trading day, so multi-day results can diverge substantially from the stated multiple.
      </p>
      <div className="amdl-leveraged-compare__drawdown">
        <h3>Drawdown and recovery comparisons</h3>
        <p>
          The article is prepared to show AMD vs AMDL and the leveraged-fund comparison, but
          the saved AMDL data currently contains annual endpoints only. A daily AMDL price series
          is required to calculate a defensible maximum drawdown, peak and trough dates, and
          recovery duration. Those figures are not estimated from annual returns.
        </p>
      </div>
      <p className="amdl-leveraged-compare__sources">
        Fund objectives: <a href="https://graniteshares.com/etfs/amdl/" target="_blank" rel="noopener noreferrer">GraniteShares AMDL</a>
        {' · '}<a href="https://graniteshares.com/etfs/nvdl/" target="_blank" rel="noopener noreferrer">GraniteShares NVDL</a>
        {' · '}<a href="https://www.proshares.com/our-etfs/leveraged-and-inverse/qld" target="_blank" rel="noopener noreferrer">ProShares QLD</a>
        {' · '}<a href="https://www.proshares.com/our-etfs/leveraged-and-inverse/tqqq" target="_blank" rel="noopener noreferrer">ProShares TQQQ</a>.
      </p>
    </section>
  )
}
