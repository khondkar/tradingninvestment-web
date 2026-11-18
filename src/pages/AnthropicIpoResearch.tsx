import { useState } from 'react'
import study from '../data/research/megaIpoDebuts.json'
import { ArticleAuthorBio } from '../components/research/AuthorBiography'
import './AnthropicIpoResearch.css'

const pct = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
const ret = (close: number, reference: number) => (close / reference - 1) * 100
const money = (value: number) => `$${value.toFixed(2)}`
const years = [2022, 2023, 2024, 2025, 2026]

function DebutChart() {
  const [year, setYear] = useState('all')
  const rows = study.rows.filter(row => year === 'all' || row.date.startsWith(year))
  const x = (value: number) => 275 + (value + 15) / 90 * 660
  return <figure className="ipo-chart">
    <div className="ipo-chart-heading"><div><h3>One debut. Two different returns.</h3><p>Offer → close in teal · Opening trade → close in navy</p></div>
      <label>Debut year <select value={year} onChange={e => setYear(e.target.value)}><option value="all">All five years</option>{years.map(y => <option key={y}>{y}</option>)}</select></label></div>
    <div className="ipo-chart-scroll"><svg viewBox={`0 0 1090 ${rows.length * 57 + 85}`} role="img" aria-labelledby="ipo-chart-title ipo-chart-desc">
      <title id="ipo-chart-title">First-day IPO returns from two entry prices</title><desc id="ipo-chart-desc">Comparing the offer-to-close return with the opening-trade-to-close return. Exact prices and calculations are in the table below.</desc>
      {[-10, 0, 20, 40, 60].map(tick => <g key={tick}><line x1={x(tick)} x2={x(tick)} y1="32" y2={rows.length * 57 + 38} stroke={tick === 0 ? '#63778b' : '#d5e0e8'} /><text x={x(tick)} y="22" textAnchor="middle" fontSize="16" fill="#20344c">{tick}%</text></g>)}
      {rows.map((row, i) => <g key={row.ticker} transform={`translate(0,${48 + i * 57})`}>
        <title>{`${row.company}, ${row.date}. Offer ${money(row.offer)}, open ${money(row.open)}, close ${money(row.close)}. Offer return ${pct(ret(row.close, row.offer))}; opening buyer return ${pct(ret(row.close, row.open))}.`}</title>
        <text x="5" y="14" fontSize="19" fontWeight="750" fill="#132b43">{row.company}</text><text x="5" y="34" fontSize="14" fill="#42556c">{row.ticker} · {row.date}</text>
        {(['offer', 'open'] as const).map((key, j) => {
          const value = ret(row.close, row[key])
          return <g key={key}><rect x={Math.min(x(0), x(value))} y={j * 19} width={Math.max(Math.abs(x(value) - x(0)), 1)} height="13" rx="2" fill={j === 0 ? '#007d75' : '#152f4c'} /><text x="955" y={j * 19 + 12} fontSize="16" fontWeight="750" fill={j === 0 ? '#006c65' : '#152f4c'}>{pct(value)}</text></g>
        })}
      </g>)}
    </svg></div>
    <figcaption>Nominal, unadjusted debut-day prices. Returns exclude costs and taxes. Each year contributes three IPOs; 2026 is incomplete through November 17.</figcaption>
    <a className="ipo-download" href="/images/social/research/mega-ipo-debut-returns-2022-2026.png" download>Download full comparison PNG ↓</a>
  </figure>
}

export default function AnthropicIpoResearch() {
  return <main className="ipo-study"><article>
    <header className="ipo-hero">
      <a className="ipo-eyebrow" href="/research/">TNI RESEARCH · IPO HISTORY</a>
      <h1>Anthropic IPO: Can a Blockbuster Debut Still Lose You Money?</h1>
      <p className="ipo-deck">Five years of major IPOs reveal why the price you can actually buy matters more than the headline first-day gain.</p>
      <p className="ipo-byline">By <a href="/about/#kamal-khondkar" rel="author">Kamal Khondkar</a> · Published November 17, 2026 · Research cutoff November 17, 2026</p>
      <nav className="ipo-jumps" aria-label="Article sections"><a href="#anthropic-terms">Anthropic IPO</a><a href="#ipo-comparison">Debut comparison</a><a href="#entry-price">Entry price matters</a><a href="#ipo-methodology">Data & sources</a></nav>
    </header>

    <div className="ipo-prose">
      <p className="ipo-lead">An IPO can finish its first day up 68% and still leave someone who bought at the opening trade down 11%. Cerebras did exactly that in May 2026. As investors prepare for Anthropic’s proposed listing, that gap deserves as much attention as the size of the offering.</p>
      <p>The familiar “IPO pop” measures the closing price against the offer price allocated before trading. Buying once the shares reach the exchange creates a different return. This study compares both outcomes across three of the largest traditional US IPOs in each calendar year from 2022 through November 17, 2026.</p>

      <section id="anthropic-terms"><h2>Anthropic IPO date, ticker and proposed price</h2>
        <p>Anthropic’s IPO website expects pricing on November 18 and public trading on November 19, subject to regulatory clearance. The proposed Nasdaq ticker is <strong>ANT</strong>. These are expected milestones. At this article’s November 17 cutoff, there is no final offer price, opening trade or debut-day closing return.</p>
        <div className="ipo-table-wrap"><table><caption>Proposed offering terms, checked November 17, 2026</caption><tbody>
          <tr><th scope="row">Indicative price range</th><td>$70–$78 per Class A share</td></tr>
          <tr><th scope="row">Base public offering</th><td>825 million shares</td></tr>
          <tr><th scope="row">Calculated gross offer size</th><td>$57.75 billion–$64.35 billion</td></tr>
          <tr><th scope="row">Offered by Anthropic</th><td>801,351,354 shares</td></tr>
          <tr><th scope="row">Offered by selling holders</th><td>23,648,646 shares</td></tr>
          <tr><th scope="row">Underwriters’ option</th><td>Up to 123.75 million additional shares</td></tr>
          <tr><th scope="row">Separate private placement</th><td>$26.0 billion; excluded from public IPO size</td></tr>
        </tbody></table></div>
        <p>The public offer size is 825 million multiplied by the indicated price. It includes shares sold by existing holders, so it is not the cash Anthropic would retain. Underwriting costs, the additional-share option and the concurrent private placement must be treated separately. <a href="https://ipo.anthropic.com/documents/us/prospectus.pdf">Preliminary prospectus</a> · <a href="https://ipo.anthropic.com/us/">Company timetable</a>.</p>
        <p>At the top of the range, the base public sale would remain below SpaceX’s $75 billion base IPO in June. Scale can attract attention and increase liquidity, but the amount sold cannot establish whether the opening market price offers an attractive return.</p>
      </section>

      <section id="ipo-comparison"><h2>How the biggest IPOs performed on debut day, 2022–2026</h2>
        <p>Selection uses gross base proceeds before the underwriters’ additional-share option. We take three offerings per year rather than letting 2026 dominate the sample. SPACs, direct listings, closed-end funds and US cross-listings of companies already trading abroad are excluded. INNIO therefore enters the 2026 group; SK hynix’s US depositary-share listing does not.</p>
        <div className="ipo-stats" aria-label="Results for all 15 selected IPOs"><div><strong>11 of 15</strong><span>Closed above offer</span></div><div><strong>10 of 15</strong><span>Closed above opening trade</span></div><div><strong>+19.22%</strong><span>Median offer → close</span></div><div><strong>+3.03%</strong><span>Median open → close</span></div></div>
        <DebutChart />
        <div className="ipo-table-wrap"><table><caption>Three largest eligible IPOs per year. Dollar prices per share; base proceeds in billions.</caption><thead><tr><th scope="col">Company / debut</th><th scope="col">Base $bn</th><th scope="col">Offer</th><th scope="col">Open</th><th scope="col">Close</th><th scope="col">Offer → close</th><th scope="col">Open → close</th></tr></thead><tbody>
          {study.rows.map(row => <tr key={row.ticker}><th scope="row">{row.company} <small>{row.ticker} · {row.date}</small></th><td>{row.baseProceedsBillions.toFixed(3)}</td><td>{money(row.offer)}</td><td>{money(row.open)}</td><td>{money(row.close)}</td><td>{pct(ret(row.close, row.offer))}</td><td>{pct(ret(row.close, row.open))}</td></tr>)}
        </tbody></table></div>
        <p>Three offerings finished below their offer price, while CoreWeave finished unchanged. Five closed below their opening trade. These outcomes describe this selected group, rather than the entire IPO market or a probability forecast for Anthropic. Median returns also conceal substantial differences between individual deals.</p>
        <a className="ipo-download" href="/data/mega-ipo-debut-returns-2022-2026.csv" download>Download prices, returns and source links as CSV ↓</a>
      </section>

      <section id="entry-price"><h2>Cerebras, SpaceX and Arm show why the entry price matters</h2>
        <p>Cerebras priced at $185, opened at $350 and closed at $311.07. That produced a <strong>68.15% offer-to-close gain</strong>, but an <strong>11.12% opening-to-close loss</strong>. An investor could correctly anticipate intense demand yet lose money during the debut by paying the opening premium. The headline gain belonged to a different starting price.</p>
        <p>SpaceX offered shares at $135, opened at $150 and closed at $160.95. Both entry points gained, but by different amounts: <strong>19.22% from the offer and 7.30% from the opening trade</strong>. Its record deal size did not eliminate the importance of execution. <a href="https://www.investing.com/news/stock-market-news/spacex-surges-past-2-trillion-in-nasdaq-debut-closes-in-on-amazon-4741182">Debut closing report</a>.</p>
        <p>Arm’s $51 offer became a $56.10 opening trade and a $63.59 close in September 2023. The corresponding returns were 24.69% and 13.35%. Medline also rewarded both groups in December 2025, closing at $41 after a $29 offer and $35 opening trade. Neither example establishes a repeatable result for a future listing.</p>
        <p>Lineage and Viking illustrate a subtler outcome. Each finished above its offer price but below its opening trade. CoreWeave reversed the pattern: its $40 close matched the offer but exceeded the $39 open. Reporting only the offer-based return misses the experience of investors trading after the listing begins.</p>
      </section>

      <section id="anthropic-watch"><h2>What this means for Anthropic’s first trading day</h2>
        <p>Start with the final offer price when it is announced. Then record the first exchange trade and regular-session close separately. A strong opening premium shows that buyers paid above the allocation price. It does not tell us whether the stock will keep rising after trading begins.</p>
        <p>A hypothetical example makes the distinction concrete. If an IPO priced at $75, opened at $100 and closed at $90, the headline return would be +20%. An opening buyer would lose 10%. These are illustrative prices, with no claim that Anthropic will trade at those levels.</p>
        <p>For a longer investment horizon, the prospectus matters beyond the debut. Examine revenue quality, compute expenses, operating losses, dilution, voting rights and the use of proceeds. First-day demand and long-term business value answer different questions. A successful debut cannot settle the valuation question.</p>
        <p>For context after trading begins, compare price action with the <a href="/nasdaq-historical-annual-returns/">Nasdaq’s returns and drawdowns</a> and the <a href="/sp-500-returns/">S&amp;P 500, Dow and Nasdaq comparison</a>. Those index studies provide market context, not an IPO prediction. Follow dated developments in the <a href="https://app.tradingninvestment.com/live/news">TNI News Agent</a>.</p>
      </section>

      <section id="ipo-methodology"><h2>Data, calculations and source checks</h2>
        <p>The window covers five calendar years, January 1, 2022 through November 17, 2026. It is not five completed years or the fifteen largest offerings across the entire period. Returning issuers such as Arm and Mobileye are included because their prior publicly traded businesses had been taken private. Operating REIT Lineage is included.</p>
        <p>Offer-to-close return equals (first-day close ÷ offer price − 1) × 100. Opening-to-close return substitutes the first exchange trade for the offer price. Prices are contemporaneous nominal quotations, without later dividend or split adjustments. Returns exclude commissions, spread, slippage and taxes; an actual fill can differ from the recorded opening trade.</p>
        <p>Annual rankings were checked against IPO research listings. Offering terms use issuer announcements where available; opening and closing prices use contemporaneous market reporting. Venture Global’s $24.00 closing price follows Bloomberg and MarketWatch; an Investopedia article gives a conflicting $23.94. Corebridge uses Bloomberg’s $20.73 debut close, rather than a vendor summary showing next-day prices.</p>
        <p>The equal-year sample is small, spans different industries and market conditions, and does not control for valuation, float or broader market returns. Its historical frequencies are descriptive. They are not a trained model, calibrated odds or evidence of a trading strategy’s profitability.</p>
        <details className="ipo-sources"><summary>Open the source list for all 15 IPOs</summary><p>Ranking references: {study.rankingSources.map((url, i) => <span key={url}><a href={url}>{i < 3 ? `Renaissance Capital ${i === 0 ? 'rankings' : 2021 + i}` : '2026 listing review'}</a>{i < study.rankingSources.length - 1 ? ' · ' : ''}</span>)}</p><ol>{study.rows.map(row => <li key={row.ticker}><strong>{row.company} · {row.date}</strong> — <a href={row.termsSource}>Offering terms / size</a> · <a href={row.openSource}>Opening trade</a> · <a href={row.closeSource}>Closing report</a>{'note' in row && row.note ? <p>{row.note}</p> : null}</li>)}</ol></details>
        <p className="ipo-disclaimer">This research is for educational purposes only and does not constitute financial advice. Historical debut returns do not predict Anthropic’s performance. Offering terms and expected dates can change.</p>
      </section>
      <ArticleAuthorBio />
    </div>
  </article></main>
}
