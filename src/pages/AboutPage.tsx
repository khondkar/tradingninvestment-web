import { AboutAuthorBio } from "../components/research/AuthorBiography"
export default function AboutPage() {
  return (
    <main className="inner-page">

      {/* ==================================================================
          TNI ABOUT — PRIMARY INTRODUCTION
          ================================================================== */}

      <section className="inner-intro">
        <span className="eyebrow">
          ABOUT TRADINGNINVESTMENT
        </span>

        <h1>
          Markets are complex.
          <br />
          <span>Research should not be.</span>
        </h1>

        <p>
          TradingNInvestment (TNI) turns financial data, market history, and
          quantitative research into clear visual intelligence for investors,
          researchers, and market participants.
        </p>
      </section>


      <AboutAuthorBio />

      {/* ==================================================================
          TNI ABOUT — RESEARCH PHILOSOPHY
          ================================================================== */}

      <section className="tni-about-statement">
        <span className="content-tag">
          OUR APPROACH
        </span>

        <h2>
          Evidence first. Clear presentation. Deeper intelligence when needed.
        </h2>

        <p>
          We begin with verified market data and historical evidence, then
          present the results in a format that is simple to read and easy to
          understand.
        </p>

        <p>
          TradingNInvestment public research focuses on market history,
          interactive visualizations, and data-driven analysis. TNI extends
          that foundation into quantitative signals, real-time market
          intelligence, news analysis, and AI-powered research tools.
        </p>
      </section>


      {/* ==================================================================
          TNI ABOUT — CONTACT
          ================================================================== */}

      <section className="tni-about-statement tni-contact-premium">
        <div className="tni-contact-main">

          <div className="tni-contact-copy">
            <div className="tni-contact-eyebrow">
              <span aria-hidden="true" />
              <strong>CONTACT TNI</strong>
            </div>

            <h2>
              Discuss your project.
            </h2>

            <p>
              TNI works with financial technology teams, publishers,
              organizations, and research groups on specialized financial
              research and market intelligence.
            </p>

            <div className="tni-contact-capabilities">
              <span>Quantitative &amp; ML Signal Research</span>
              <span>News-Based Predictive Modeling &amp; Event Ratings</span>
              <span>Deep Financial Data Research</span>
              <span>Custom Data Visualization</span>
              <span>Sponsored Research</span>
            </div>
          </div>


          <div
            className="tni-contact-intelligence"
            aria-label="TNI research capabilities"
          >
            <div
              className="tni-contact-orbit"
              aria-hidden="true"
            />

            <article className="tni-contact-mini tni-contact-mini-signals">
              <header>
                <strong>Quantitative Signals</strong>
                <span>MODELS</span>
              </header>

              <div className="tni-contact-spark" aria-hidden="true">
                <svg viewBox="0 0 190 60">
                  <path
                    d="M2 49 L18 43 L31 47 L47 34 L61 38 L78 26 L94 33 L111 20 L128 27 L145 17 L160 22 L187 6"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </article>

            <article className="tni-contact-mini tni-contact-mini-market">
              <header>
                <strong>Market Intelligence</strong>
                <span>INSIGHTS</span>
              </header>

              <div className="tni-contact-bars" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </article>

            <article className="tni-contact-mini tni-contact-mini-research">
              <header>
                <strong>Custom Research</strong>
                <span>RESEARCH</span>
              </header>

              <div className="tni-contact-data-grid" aria-hidden="true">
                {Array.from({ length: 28 }).map((_, index) => (
                  <i key={index} />
                ))}
              </div>
            </article>
          </div>


          <aside className="tni-contact-action">
            <div className="tni-contact-action-top">
              <span>START A CONVERSATION</span>

              <i aria-hidden="true">
                <b />
                <b />
                <b />
              </i>
            </div>

            <h3>
              Have a research, data,
              <br />
              or intelligence problem?
            </h3>

            <p>
              Tell us what you're building, the data involved,
              and what you want to understand.
            </p>

            <a
              className="tni-contact-action-button"
              href="mailto:contact@tradingninvestment.com?subject=TNI%20Research%20Project"
            >
              <span>Discuss your project</span>
              <b aria-hidden="true">↗</b>
            </a>

            <div className="tni-contact-action-details">
              <a href="mailto:contact@tradingninvestment.com">
                <span aria-hidden="true">✉</span>
                contact@tradingninvestment.com
              </a>

              <small>
                <span aria-hidden="true">●</span>
                New York, NY, United States
              </small>
            </div>
          </aside>
        </div>


        <div className="tni-contact-proof">
          <div>
            <span className="tni-contact-proof-icon">◎</span>

            <p>
              <strong>Original Research</strong>
              <small>
                Deep analysis across indexes, sectors and assets.
              </small>
            </p>
          </div>

          <div>
            <span className="tni-contact-proof-icon">▥</span>

            <p>
              <strong>Quantitative Intelligence</strong>
              <small>
                Data-driven models and market insights.
              </small>
            </p>
          </div>

          <div>
            <span className="tni-contact-proof-icon">◇</span>

            <p>
              <strong>Visual Data &amp; Research Assets</strong>
              <small>
                Clear, publication-ready charts and analysis.
              </small>
            </p>
          </div>
        </div>
      </section>


      {/* ==================================================================
          TNI ABOUT — PRODUCT CONNECTION
          ================================================================== */}

      <section className="about-cta">
        <div>
          <span>
            GO FURTHER WITH TNI
          </span>

          <h2>
            Research is only the beginning.
          </h2>

          <p>
            Move from public market research into real-time intelligence,
            quantitative signals, news analysis, and AI-powered investment
            research.
          </p>
        </div>

        <a
          href="https://app.tradingninvestment.com/live/news"
          target="_blank"
          rel="noreferrer"
          className="primary-action"
        >
          Launch TNI
          <span>→</span>
        </a>
      </section>

    </main>
  )
}
