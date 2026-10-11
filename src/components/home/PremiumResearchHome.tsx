import { researchHubs, researchItems } from '../../research/discovery'
import TNIResearchIdentity from '../research/TNIResearchIdentity'
import '../research/TNIResearchIdentity.css'

const featured = researchItems.filter((item) => item.homepagePlacement === 'featured').map((item) => ({
  path: item.path, label: `${item.name.toUpperCase()} / ORIGINAL RESEARCH`,
  headline: item.title, intro: item.description, chartLabel: item.name,
  chartDescription: 'Source and methodology in the full study.', image: item.image,
}))

const citations = [
  { name: 'Florida State University', detail: 'Law Review', logo: '/images/citations/fsu.svg', logoClass: 'fsu', href: 'https://ir.law.fsu.edu/lr/vol46/iss4/3/' },
  { name: 'Sorbonne University', detail: 'Academic reference', logo: '/images/citations/sorbonne.png', href: 'https://ecm.univ-paris1.fr/nuxeo/nxfile/default/2a2e1785-2b20-4751-9203-7f8819df8e62/file%3Acontent/2023-04%20PEREZ%20Inf.pdf' },
  { name: 'Debt.org', detail: 'Publication reference', logo: '/images/citations/debt-org.png', href: 'https://www.debt.org/advice/the-truth-about-dave-ramseys-baby-steps-do-they-work/' },
  { name: 'NFP · An Aon Company', detail: 'Industry reference', logo: '/images/citations/nfp-aon.svg', href: 'https://webfiles2.nfp.com/webfiles/public/2020_emails/COVID-19/JH_three_insurance_opportunities.pdf' },
]

export default function PremiumResearchHome() {
  const remaining = researchItems.filter((item) => item.homepagePlacement === 'regular')
  const topHubs = researchHubs.filter((hub) => ['/research/stocks/', '/research/indexes/', '/research/market-history/', '/research/market-risk/'].includes(hub.path))

  return <main className="tni-home" id="top">
    <section className="tni-home-hero tni-home-wrap">
      <span className="tni-home-kicker">STOCK MARKET RESEARCH &amp; INVESTMENT INTELLIGENCE</span>
      <h1>Understand the market.<br /><span>Go further with every answer.</span></h1>
      <p className="tni-home-lead">Original research, interactive data, and clear paths from one question to the next. Start with the evidence that matters to you.</p>
      <a className="tni-home-product" href="https://app.tradingninvestment.com/live/news" aria-label="Open TNI Intelligence market workspace">
        <span><small>TNI INTELLIGENCE · THE PRODUCT</small><strong>Explore today’s market in one workspace.</strong><em>Live news, stock intelligence, and market tools</em></span><b aria-hidden="true">↗</b>
      </a>
      <div className="tni-home-hero-actions"><a className="tni-home-primary" href={featured.length ? '#featured-research' : '/research/'}>Explore the research <span>↗</span></a><a href="/research/">Browse by topic →</a></div>
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

    <section hidden={featured.length === 0} className="tni-home-features tni-home-wrap" id="featured-research" aria-labelledby="tni-home-feature-title">
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
          <img src={study.image} alt={`${study.chartLabel} TNI Research`} loading="lazy" className="tni-home-feature-og" />
        </a>
      </article>)}</div>
    </section>

    <section className="tni-home-topics" id="explore"><div className="tni-home-wrap">
      <div className="tni-home-section-head"><span className="tni-home-kicker">FIND YOUR PATH</span><h2>Start anywhere. Keep exploring.</h2></div>
      <div className="tni-home-topic-grid">{topHubs.map((hub) => <a key={hub.path} href={hub.path}><strong>{hub.title}</strong><span>{hub.description}</span><b aria-hidden="true">↗</b></a>)}</div>
      <a className="tni-home-all-link" href="/research/">Explore the full research index ↗</a>
    </div></section>

    {remaining.length > 0 && <section className="tni-home-more tni-home-wrap" aria-labelledby="tni-home-more-title"><div className="tni-home-section-head"><span className="tni-home-kicker">MORE RESEARCH</span><h2 id="tni-home-more-title">Continue with the evidence.</h2></div><div className="tni-home-more-grid">{remaining.map((item) => <a key={item.path} href={item.path}>{item.image && <img className="tni-home-publication-og" src={item.image} alt={`${item.name} TNI Research`} loading="lazy" />}<small>{item.categories.includes('stock') ? 'STOCK INTELLIGENCE' : item.kind === 'drawdowns' ? 'MARKET RISK' : 'INDEX HISTORY'}</small><strong>{item.title}</strong><span>{item.description}</span><b>EXPLORE STUDY ↗</b></a>)}</div></section>}

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
