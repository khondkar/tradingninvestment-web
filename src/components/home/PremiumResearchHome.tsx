import { researchItems } from '../../research/discovery'
import './EditorialHome.css'
import './HomeTop.css'
import './HomeTradingCard.css'
import { HomeGlobe, HomeIcon } from './HomeVisuals'

const citations = [
  { name: 'Florida State University', detail: 'Law Review', logo: '/images/citations/fsu.svg', logoClass: 'fsu', href: 'https://ir.law.fsu.edu/lr/vol46/iss4/3/' },
  { name: 'Sorbonne University', detail: 'Academic reference', logo: '/images/citations/sorbonne.png', href: 'https://ecm.univ-paris1.fr/nuxeo/nxfile/default/2a2e1785-2b20-4751-9203-7f8819df8e62/file%3Acontent/2023-04%20PEREZ%20Inf.pdf' },
  { name: 'Debt.org', detail: 'Publication reference', logo: '/images/citations/debt-org.png', href: 'https://www.debt.org/advice/the-truth-about-dave-ramseys-baby-steps-do-they-work/' },
  { name: 'NFP · An Aon Company', detail: 'Industry reference', logo: '/images/citations/nfp-aon.svg', href: 'https://webfiles2.nfp.com/webfiles/public/2020_emails/COVID-19/JH_three_insurance_opportunities.pdf' },
]


const priorities = ['/research/doji-candlestick-spy-26-year-study/', '/average-stock-market-return/']
const featured = researchItems.filter(item => item.homepagePlacement === 'featured').sort((a, b) => {
  const rank = (path: string) => priorities.includes(path) ? priorities.indexOf(path) : 2
  return rank(a.path) - rank(b.path)
})
const lead = featured.filter(item => priorities.includes(item.path))
const more = researchItems.filter(item => item.homepagePlacement === 'regular' ||
  (item.homepagePlacement === 'featured' && !priorities.includes(item.path)))

export default function PremiumResearchHome() {
  return <main className="tni-home tni-editorial" id="top">
    <div className="tni-home-hero-backdrop"><HomeGlobe /></div>
    <section className="tni-home-intro editorial-wrap">
      <p className="tni-home-intro-tagline">TRADING · INVESTMENT · RESEARCH · INTELLIGENCE</p>
      <h1>Understand the Market.<br />Invest with <span>Intelligence.</span></h1>
      <p className="tni-home-intro-description">Independent financial research, historical market data, and quantitative intelligence.</p>
    </section>
    <div className="editorial-wrap">
      <div className="tni-home-feature-stack">
        <section className="tni-home-feature tni-home-feature-intelligence">
          <div className="tni-home-feature-icon"><HomeIcon kind="brain" /></div><div className="tni-home-feature-label">TNI Intelligence</div>
          <h2>Smarter market decisions start here.</h2>
          <p>Explore quantitative signals, AI-powered research, and market intelligence.</p>
          <a href="https://app.tradingninvestment.com/live/news">Launch TNI <span aria-hidden="true">→</span></a>
        </section>
        <section className="tni-home-feature tni-home-feature-market">
          <div className="tni-home-feature-icon"><HomeIcon kind="market" /></div><div className="tni-home-feature-label">Stock Market Today</div>
          <h2>See what’s moving the market.</h2>
          <p>Follow market benchmarks, sector performance, heatmaps, and earnings developments.</p>
          <a href="/stock-market-today/">Explore Stock Market Today <span aria-hidden="true">↗</span></a>
        </section>
        <section className="tni-home-citations" aria-labelledby="editorial-citations">
          <div className="tni-home-citations-icon"><HomeIcon kind="cap" /></div><h2 id="editorial-citations">Cited &amp; Referenced By</h2>
          <p>Historical market research referenced by academic, publication, and industry sources.</p>
          <div className="tni-home-citation-links">{citations.map(citation => <a key={citation.name} href={citation.href} target="_blank" rel="noopener noreferrer">
            <img src={citation.logo} alt="" width="80" height="64" loading="lazy" decoding="async" />
            <span><strong>{citation.name}</strong><small>{citation.detail}</small></span>
          </a>)}</div>
          <div className="tni-home-citations-bottom"><small>References are not endorsements.</small><a href="https://app.tradingninvestment.com/research/citations">Explore all citations ↗</a></div>
        </section>
      </div>
      <section className="tni-home-explore" aria-labelledby="tni-home-explore-title">
        <h2 id="tni-home-explore-title">Explore TradingNInvestment</h2>
        <div>{([
          ['trading','Trading','/trading/','Strategies, candlestick research, tools and funded accounts.','Explore trading'],
          ['grid','S&P 500 Heatmap','/stock-market-today/heatmap/','See winners, losers, and sector moves.','View heatmap'],
          ['book','Research','/research/','Original studies and historical market data.','Read research'],
          ['search','ETF Scanner','/research/scanners/leveraged-etf/','Find and compare leveraged ETFs.','Open scanner'],
        ] as const).map(([icon,label,href,description,cta]) => <a key={href} href={href} className={`tni-explore-card tni-explore-${icon}`}><div className="tni-explore-thumbnail" aria-hidden="true"><HomeIcon kind={icon}/></div><strong>{label}</strong><p>{description}</p><span className="tni-explore-cta">{cta} <span aria-hidden="true">→</span></span></a>)}</div>
      </section>
      <h2 className="tni-home-featured-heading">Featured Research</h2>
      <section id="featured-research" className="editorial-studies" aria-label="Featured research">
        {lead.map(item => {
          const doji = item.path === priorities[0]
          return <article className="editorial-study" key={item.path}>
            <div className="editorial-study-copy">
              <span className="editorial-tag">{doji ? 'TRADING' : 'INVESTMENT'}</span>
              <h2><a href={item.path}>{doji ? 'Does the Doji candlestick work?' : 'Market history. A longer perspective.'}</a></h2>
              <p>{doji ? 'A 26-year SPY study.' : '150+ years of U.S. market data.'}</p>
              <a className="editorial-link" href={item.path}>{doji ? 'Explore the study' : 'Explore market history'} ↗</a>
            </div>
            {item.image && <a className="editorial-study-image" href={item.path} aria-label={`Read ${item.title}`}>
              <img src={item.image} alt={`${item.name} — TNI research chart`} width="1200" height="630" loading="lazy" decoding="async" />
            </a>}
          </article>
        })}
      </section>
      <a className="editorial-browse editorial-link" href="/research/">Browse all research <span aria-hidden="true">↗</span></a>
      {more.length > 0 && <section className="editorial-more" aria-labelledby="editorial-more-title">
        <h2 id="editorial-more-title">More perspectives.</h2>
        <div>{more.map(item => <a key={item.path} href={item.path}>
          <span><small>{item.categories.includes('stock') ? 'STOCK RESEARCH' : 'MARKET RESEARCH'}</small><strong>{item.title}</strong></span><span aria-hidden="true">↗</span>
        </a>)}</div>
      </section>}
    </div>
    <section
      className="tni-home-work-with-us tni-home-wrap"
      aria-labelledby="tni-home-work-with-us-title"
    >
      <div className="tni-home-work-main">
        <div className="tni-home-work-copy">
          <div className="tni-home-work-eyebrow">
            <span aria-hidden="true" />
            <strong>WORK WITH TNI</strong>
          </div>

          <h2 id="tni-home-work-with-us-title">
            Build intelligence
            <br />
            from your data.
          </h2>

          <p className="tni-home-work-intro">
            TNI works with organizations, financial technology teams,
            publishers, and research groups on specialized financial
            research and market intelligence.
          </p>

          <div
            className="tni-home-work-capabilities"
            aria-label="TNI research capabilities"
          >
            <span>Quantitative &amp; ML Signal Research</span>
            <span>News-Based Predictive Modeling &amp; Event Ratings</span>
            <span>Deep Financial Data Research</span>
            <span>Custom Data Visualization</span>
            <span>Sponsored Research</span>
          </div>

          <div className="tni-home-work-contact">
            <a
              className="tni-home-work-cta"
              href="mailto:contact@tradingninvestment.com?subject=TNI%20Research%20Project"
            >
              Discuss your project
              <span aria-hidden="true">↗</span>
            </a>

            <div className="tni-home-work-email-wrap">
              <a
                className="tni-home-work-email"
                href="mailto:contact@tradingninvestment.com"
              >
                <span
                  className="tni-home-work-mail-icon"
                  aria-hidden="true"
                >
                  ✉
                </span>

                <span>
                  contact@tradingninvestment.com
                </span>
              </a>

              <small>
                Share your research or data needs. We’ll get back to you.
              </small>
            </div>
          </div>
        </div>

        <div
          className="tni-home-work-visual"
          aria-label="Examples of TNI intelligence capabilities"
        >
          <div
            className="tni-home-work-orbit tni-home-work-orbit-one"
            aria-hidden="true"
          />
          <div
            className="tni-home-work-orbit tni-home-work-orbit-two"
            aria-hidden="true"
          />

          <div className="tni-home-work-card tni-home-work-card-signals">
            <div className="tni-home-work-card-head">
              <div>
                <strong>Quantitative Signals</strong>
                <small>
                  Price, volume, news and
                  <br />
                  fundamental signals
                </small>
              </div>

              <span>MODELS</span>
            </div>

            <div className="tni-home-mini-line" aria-hidden="true">
              <svg
                viewBox="0 0 300 110"
                role="presentation"
              >
                <path
                  d="M4 88 L25 80 L43 91 L63 66 L82 71 L101 53 L120 61 L141 42 L160 58 L180 35 L200 46 L220 28 L241 39 L262 18 L286 7"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <div className="tni-home-work-card-periods">
              <span>1D</span>
              <span>1M</span>
              <span>6M</span>
              <span>1Y</span>
              <span>5Y</span>
            </div>
          </div>

          <div className="tni-home-work-card tni-home-work-card-market">
            <div className="tni-home-work-card-head">
              <div>
                <strong>Market Intelligence</strong>
                <small>
                  Event impact, sentiment
                  <br />
                  and risk analysis
                </small>
              </div>

              <span>INSIGHTS</span>
            </div>

            <div className="tni-home-mini-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="tni-home-work-card tni-home-work-card-research">
            <div className="tni-home-work-card-head">
              <div>
                <strong>Custom Research</strong>
                <small>
                  Tailored analysis
                  <br />
                  and visualization
                </small>
              </div>

              <span>RESEARCH</span>
            </div>

            <div className="tni-home-research-visual" aria-hidden="true">
              <div className="tni-home-research-grid">
                {Array.from({ length: 28 }).map((_, index) => (
                  <i key={index} />
                ))}
              </div>

              <b>DATA · RESEARCH · INTELLIGENCE</b>
            </div>
          </div>
        </div>
      </div>

      <div className="tni-home-work-proof">
        <div>
          <span className="tni-home-work-proof-icon">◎</span>

          <p>
            <strong>Original Research</strong>
            <small>
              Deep analysis across indexes, sectors and assets.
            </small>
          </p>
        </div>

        <div>
          <span className="tni-home-work-proof-icon">▥</span>

          <p>
            <strong>Quantitative Intelligence</strong>
            <small>
              Data-driven models and market insights.
            </small>
          </p>
        </div>

        <div>
          <span className="tni-home-work-proof-icon">◇</span>

          <p>
            <strong>Visual Data &amp; Research Assets</strong>
            <small>
              Clear, publication-ready charts and analysis.
            </small>
          </p>
        </div>
      </div>
    </section>

    <section className="tni-home-bridge tni-home-wrap"><div><span className="tni-home-kicker">FROM HISTORY TO TODAY</span><h2>See the market in context.</h2><p>Historical research frames the questions. Continue into current market developments in TNI Intelligence.</p><a href="https://app.tradingninvestment.com/live/news">Explore TNI Intelligence ↗</a></div></section>
  </main>
}
