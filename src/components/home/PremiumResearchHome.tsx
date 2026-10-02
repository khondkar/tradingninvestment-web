import sp500Data from '../../data/charts/sp500AnnualReturns.json'
import sp500HistoricalReturnMethods from '../../data/sp500-historical-return-methods.json'
import nvdaData from '../../data/charts/nvdaAnnualReturns.json'
import nasdaqData from '../../data/charts/nasdaqAnnualReturns.json'
import dowData from '../../data/charts/dowAnnualReturns.json'
import { researchHubs, researchItems } from '../../research/discovery'
import { annualReturnsResearchRegistry } from '../../research/annual-returns/registry'
import { stockResearchDataRegistry } from '../../research/annual-returns/stockDataRegistry'
import TNIResearchIdentity from '../research/TNIResearchIdentity'
import '../research/TNIResearchIdentity.css'
import './PremiumResearchHome.css'

type AnnualPoint = {
  year: number
  value: number
  label?: string
}

type HistoricalReturnPoint = {
  year: number
  total_return: number | null
  is_ytd?: boolean
}

const historicalTotalReturnPoints =
  (
    sp500HistoricalReturnMethods.data as
      HistoricalReturnPoint[]
  )
    .filter(
      (point) =>
        Number.isFinite(
          point.total_return,
        ),
    )
    .map(
      (point) => ({
        year: point.year,
        value:
          point.total_return as number,
        label:
          point.is_ytd
            ? 'YTD'
            : undefined,
      }),
    )

const featured = [
  {
    path:
      '/average-stock-market-return/',
    label:
      '150+ YEARS · TOTAL RETURN · INFLATION',
    headline:
      '150+ years of stock market returns, dividends and inflation.',
    intro:
      'Explore U.S. stock market history across more than 150 years, comparing total return with dividends reinvested, inflation-adjusted real return, and price return.',
    chartLabel:
      'U.S. STOCK MARKET',
    metricLabel:
      'TOTAL RETURNS',
    chartDescription:
      'Total return · Dividends reinvested · Source and methodology in article',
    points:
      historicalTotalReturnPoints,
  },
  { path: '/sp-500-returns/', label: 'INDEX HISTORY · INTERACTIVE STUDY', headline: 'Nearly a century of S&P 500 returns, made explorable.', intro: 'Go year by year through market performance, then examine the averages, extremes, and long-term context behind the headline numbers.', chartLabel: 'S&P 500', metricLabel: 'ANNUAL RETURNS', chartDescription: 'Annual price returns · Source and methodology in article', points: sp500Data.data as AnnualPoint[] },
  { path: '/nvda-returns/', label: 'STOCK INTELLIGENCE · NVIDIA', headline: 'NVIDIA returns, year by year.', intro: 'See the scale of NVIDIA’s historical moves and explore each year in the full research article.', chartLabel: 'NVIDIA', metricLabel: 'ANNUAL RETURNS', chartDescription: 'Annual price returns · Source and methodology in article', points: nvdaData.data as AnnualPoint[] },
  { path: '/nasdaq-historical-annual-returns/', label: 'INDEX HISTORY · NASDAQ COMPOSITE', headline: 'Nasdaq history in perspective.', intro: 'Trace the Nasdaq Composite across decades and examine the years that shaped its long-term record.', chartLabel: 'NASDAQ COMPOSITE', metricLabel: 'ANNUAL RETURNS', chartDescription: 'Annual price returns · Source and methodology in article', points: nasdaqData.data as AnnualPoint[] },
  { path: '/stock-market-historical-returns/', label: 'INDEX HISTORY · DOW JONES', headline: 'More than a century of Dow Jones returns.', intro: 'Explore annual Dow Jones performance and the market periods behind its long-term record.', chartLabel: 'DOW JONES', metricLabel: 'ANNUAL RETURNS', chartDescription: 'Annual price returns · Source and methodology in article', points: dowData.data as AnnualPoint[] },
]

const stockHomepageResearch =
  annualReturnsResearchRegistry
    .filter(
      ({ config }) =>
        config.categories.includes('stock') &&
        !featured.some(
          (study) =>
            study.path === config.canonicalPath,
        ) &&
        Boolean(
          stockResearchDataRegistry[
            config.symbol
          ]?.annualReturns,
        ),
    )
    .map(({ config }) => {
      const dataset =
        stockResearchDataRegistry[
          config.symbol
        ].annualReturns

      return {
        path: config.canonicalPath,
        label:
          `STOCK INTELLIGENCE · ${config.shortName.toUpperCase()}`,
        headline:
          `${config.shortName} returns, year by year.`,
        intro:
          `Explore ${config.name} annual stock returns, historical performance, and long-term return patterns.`,
        chartLabel:
          config.shortName.toUpperCase(),
        metricLabel:
          'ANNUAL RETURNS',
        chartDescription:
          'Annual price returns · Source and methodology in article',
        points:
          dataset.data as AnnualPoint[],
        socialImage:
          config.seo.socialImage,
      }
    })

const etfHomepageResearch =
  annualReturnsResearchRegistry
    .filter(
      ({ config }) =>
        config.categories.includes('etf') &&
        Boolean(config.seo.socialImage),
    )
    .map(({ config }) => ({
      path: config.canonicalPath,
      label:
        config.categories.includes('leveraged-etf')
          ? `LEVERAGED ETF INTELLIGENCE · ${config.shortName.toUpperCase()}`
          : `ETF INTELLIGENCE · ${config.shortName.toUpperCase()}`,
      headline:
        `${config.shortName} returns and benchmark intelligence.`,
      intro:
        config.seo.socialDescription,
      chartLabel:
        config.shortName.toUpperCase(),
      socialImage:
        config.seo.socialImage,
    }))

const citations = [
  { name: 'Florida State University', detail: 'Law Review', logo: '/images/citations/fsu.svg', logoClass: 'fsu', href: 'https://ir.law.fsu.edu/lr/vol46/iss4/3/' },
  { name: 'Sorbonne University', detail: 'Academic reference', logo: '/images/citations/sorbonne.png', href: 'https://ecm.univ-paris1.fr/nuxeo/nxfile/default/2a2e1785-2b20-4751-9203-7f8819df8e62/file%3Acontent/2023-04%20PEREZ%20Inf.pdf' },
  { name: 'Debt.org', detail: 'Publication reference', logo: '/images/citations/debt-org.png', href: 'https://www.debt.org/advice/the-truth-about-dave-ramseys-baby-steps-do-they-work/' },
  { name: 'NFP · An Aon Company', detail: 'Industry reference', logo: '/images/citations/nfp-aon.svg', href: 'https://webfiles2.nfp.com/webfiles/public/2020_emails/COVID-19/JH_three_insurance_opportunities.pdf' },
]

function ReturnPreview({
  label,
  metricLabel,
  points,
}: {
  label: string
  metricLabel: string
  points: AnnualPoint[]
}) {
  const completed = points.filter((point) => Number.isFinite(point.value) && !/YTD/i.test(point.label ?? ''))
  const recent = completed.slice(-18)
  const first = recent[0]?.year
  const last = recent.at(-1)?.year
  const positiveMax = Math.max(1, ...recent.map((point) => point.value))
  const negativeMax = Math.max(1, ...recent.map((point) => -point.value))

  return <div className="tni-home-chart" aria-label={`${label} annual return preview, ${first} to ${last}`}>
    <div style={{ marginBottom: '8px' }}>
      <TNIResearchIdentity />
    </div>
    <div className="tni-home-chart-top"><strong>{label} / {metricLabel}</strong><span>ACTUAL DATA</span></div>
    <div className="tni-home-chart-years">{first}—{last}</div>
    <p>Recent completed calendar years</p>
    <svg viewBox="0 0 350 130" role="img" aria-label={`Annual returns for ${label} from ${first} to ${last}`}>
      <title>{`${label} ${metricLabel.toLowerCase()}, ${first} to ${last}`}</title>
      <line x1="0" y1="79" x2="350" y2="79" stroke="#d6e4dd" strokeDasharray="3 4" />
      {recent.map((point, index) => {
        const positive = point.value >= 0
        const height = Math.max(2, Math.abs(point.value) / (positive ? positiveMax : negativeMax) * (positive ? 59 : 37))
        return <rect key={point.year} x={7 + index * 19} y={positive ? 79 - height : 79} width="12" height={height} rx="2.5" fill={positive ? '#83beab' : '#c49380'} />
      })}
      <text x="7" y="124">{first}</text><text x="287" y="124">{last}</text>
    </svg>
    <div className="tni-home-chart-bottom"><span>Positive and negative years</span><strong>EXPLORE FULL DATA ↗</strong></div>
  </div>
}

export default function PremiumResearchHome() {
  const featuredPaths = new Set(featured.map((study) => study.path))
  const remaining = researchItems
    .filter((item) => !featuredPaths.has(item.path))
    .sort((a, b) => {
      if (a.symbol === 'AAPL') return -1
      if (b.symbol === 'AAPL') return 1
      return 0
    })
  const topHubs = researchHubs.filter((hub) => ['/research/stocks/', '/research/indexes/', '/research/market-history/', '/research/market-risk/'].includes(hub.path))

  return <main className="tni-home" id="top">
    <section className="tni-home-hero tni-home-wrap">
      <span className="tni-home-kicker">STOCK MARKET RESEARCH &amp; INVESTMENT INTELLIGENCE</span>
      <h1>Understand the market.<br /><span>Go further with every answer.</span></h1>
      <p className="tni-home-lead">Original research, interactive data, and clear paths from one question to the next. Start with the evidence that matters to you.</p>
      <a className="tni-home-product" href="https://app.tradingninvestment.com/live/news" aria-label="Open TNI Intelligence market workspace">
        <span><small>TNI INTELLIGENCE · THE PRODUCT</small><strong>Explore today’s market in one workspace.</strong><em>Live news, stock intelligence, and market tools</em></span><b aria-hidden="true">↗</b>
      </a>
      <div className="tni-home-hero-actions"><a className="tni-home-primary" href="#featured-research">Explore the research <span>↗</span></a><a href="/research/">Browse by topic →</a></div>
    </section>

    <section className="tni-home-trust" aria-labelledby="tni-home-trust-title"><div className="tni-home-wrap">
      <span className="tni-home-kicker">RESEARCH WITH A RECORD</span>
      <h2 id="tni-home-trust-title">Cited &amp; referenced by</h2>
      <p>Explore the original references to see where TNI research has been cited or discussed. References are not endorsements.</p>
      <div className="tni-home-citations">{citations.map((citation) => <a key={citation.name} href={citation.href} target="_blank" rel="noreferrer" aria-label={`Open ${citation.name} reference`}>
        <span className={`tni-home-citation-logo ${'logoClass' in citation ? citation.logoClass : ''}`}><img src={citation.logo} alt="" loading="lazy" /></span><span className="tni-home-citation-copy"><strong>{citation.name}</strong><small>{citation.detail}</small></span><b aria-hidden="true">↗</b>
      </a>)}</div>
      <a className="tni-home-all-citations" href="https://app.tradingninvestment.com/research/citations">Explore All Citations <span aria-hidden="true">→</span></a>
    </div></section>

    <section className="tni-home-features tni-home-wrap" id="featured-research" aria-labelledby="tni-home-feature-title">
      <div className="tni-home-section-head"><span className="tni-home-kicker">FEATURED RESEARCH</span><h2 id="tni-home-feature-title">Research worth spending time with.</h2><p>Interactive studies with transparent data sources and methodology.</p></div>
      <div className="tni-home-feature-stack">{featured.map((study) => <article className="tni-home-feature" key={study.path}>
        <div className="tni-home-feature-copy">
          <TNIResearchIdentity compact />
          <span className="tni-home-kicker">{study.label}</span>
          <h3><a href={study.path}>{study.headline}</a></h3>
          <p>{study.intro}</p>
          <a className="tni-home-feature-link" href={study.path}>Explore the full study ↗</a>
          <small>{study.chartDescription}</small>
        </div>
        <a
          className="tni-home-feature-visual"
          href={study.path}
          aria-label={`Explore ${study.chartLabel} interactive returns`}
        >
          {study.path === '/average-stock-market-return/' ? (
            <img
              src="/images/social/average-stock-market-return-og.png"
              alt="Historical U.S. stock market total returns with dividends reinvested across more than 150 years"
              loading="eager"
              className="tni-home-feature-og"
            />
          ) : (
            <ReturnPreview
              label={study.chartLabel}
              metricLabel={study.metricLabel}
              points={study.points}
            />
          )}
        </a>
      </article>)}</div>
    </section>

    {stockHomepageResearch.length > 0 && (
      <section
        className="tni-home-features tni-home-wrap"
        aria-labelledby="tni-home-stock-research-title"
      >
        <div className="tni-home-section-head">
          <span className="tni-home-kicker">
            STOCK INTELLIGENCE
          </span>

          <h2 id="tni-home-stock-research-title">
            Explore individual stocks.
          </h2>

          <p>
            Historical returns, actual data, and long-term
            performance research for leading companies.
          </p>
        </div>

        <div className="tni-home-feature-stack">
          {stockHomepageResearch.map((study) => (
            <article
              className="tni-home-feature"
              key={study.path}
            >
              <div className="tni-home-feature-copy">
                <TNIResearchIdentity compact />

                <span
                  className="tni-home-kicker"
                  style={{ marginTop: '18px' }}
                >
                  {study.label}
                </span>

                <h3>
                  <a href={study.path}>
                    {study.headline}
                  </a>
                </h3>

                <p>
                  {study.intro}
                </p>

                <a
                  className="tni-home-feature-link"
                  href={study.path}
                >
                  Explore the full study ↗
                </a>

                <small>
                  {study.chartDescription}
                </small>
              </div>

              <a
                className="tni-home-feature-visual"
                href={study.path}
                aria-label={`Explore ${study.chartLabel} interactive returns`}
              >
                {study.socialImage ? (
                  <img
                    src={study.socialImage}
                    alt={`${study.chartLabel} TNI Research`}
                    loading="lazy"
                    className="tni-home-research-og"
                  />
                ) : (
                  <ReturnPreview
                    label={study.chartLabel}
                    metricLabel={study.metricLabel}
                    points={study.points}
                  />
                )}
              </a>
            </article>
          ))}
        </div>
      </section>
    )}

    {etfHomepageResearch.length > 0 && (
      <section
        className="tni-home-features tni-home-wrap"
        aria-labelledby="tni-home-etf-research-title"
      >
        <div className="tni-home-section-head">
          <span className="tni-home-kicker">
            ETF INTELLIGENCE
          </span>

          <h2 id="tni-home-etf-research-title">
            Explore ETF performance.
          </h2>

          <p>
            Historical returns, benchmark comparisons,
            compounding, and long-term ETF research.
          </p>
        </div>

        <div className="tni-home-feature-stack">
          {etfHomepageResearch.map((study) => (
            <article
              className="tni-home-feature"
              key={study.path}
            >
              <div className="tni-home-feature-copy">
                <TNIResearchIdentity compact />

                <span
                  className="tni-home-kicker"
                  style={{ marginTop: '18px' }}
                >
                  {study.label}
                </span>

                <h3>
                  <a href={study.path}>
                    {study.headline}
                  </a>
                </h3>

                <p>{study.intro}</p>

                <a
                  className="tni-home-feature-link"
                  href={study.path}
                >
                  Explore the full study ↗
                </a>
              </div>

              <a
                className="tni-home-feature-visual"
                href={study.path}
                aria-label={`Explore ${study.chartLabel} research`}
              >
                <img
                  src={study.socialImage}
                  alt={`${study.chartLabel} TNI Research`}
                  loading="lazy"
                  className="tni-home-research-og"
                />
              </a>
            </article>
          ))}
        </div>
      </section>
    )}

    <section className="tni-home-topics" id="explore"><div className="tni-home-wrap">
      <div className="tni-home-section-head"><span className="tni-home-kicker">FIND YOUR PATH</span><h2>Start anywhere. Keep exploring.</h2></div>
      <div className="tni-home-topic-grid">{topHubs.map((hub) => <a key={hub.path} href={hub.path}><strong>{hub.title}</strong><span>{hub.description}</span><b aria-hidden="true">↗</b></a>)}</div>
      <a className="tni-home-all-link" href="/research/">Explore the full research index ↗</a>
    </div></section>

    {remaining.length > 0 && <section className="tni-home-more tni-home-wrap" aria-labelledby="tni-home-more-title"><div className="tni-home-section-head"><span className="tni-home-kicker">MORE RESEARCH</span><h2 id="tni-home-more-title">Continue with the evidence.</h2></div><div className="tni-home-more-grid">{remaining.map((item) => <a key={item.path} href={item.path}><small>{item.categories.includes('stock') ? 'STOCK INTELLIGENCE' : item.kind === 'drawdowns' ? 'MARKET RISK' : 'INDEX HISTORY'}</small><strong>{item.title}</strong><span>{item.description}</span><b>EXPLORE STUDY ↗</b></a>)}</div></section>}

    <section className="tni-home-bridge tni-home-wrap"><div><span className="tni-home-kicker">FROM HISTORY TO TODAY</span><h2>See the market in context.</h2><p>Historical research frames the questions. Continue into current market developments in TNI Intelligence.</p><a href="https://app.tradingninvestment.com/live/news">Explore TNI Intelligence ↗</a></div></section>
  </main>
}
