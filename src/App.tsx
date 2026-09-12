import { useState } from 'react'
import heroImg from './assets/hero.webp'
import './App.css'

/* ==========================================================================
   TNI PUBLIC WEBSITE — PAGE TYPES
   ========================================================================== */

type PageName = 'research' | 'articles' | 'about'

/* ==========================================================================
   TNI PUBLIC WEBSITE — SAMPLE ARTICLE CONTENT
   ========================================================================== */

const articles = [
  {
    category: 'MARKET INSIGHTS',
    title: 'Why Market Drawdowns Matter',
    description:
      'What historical drawdowns reveal about risk, recovery, and long-term investing.',
  },
  {
    category: 'QUANT RESEARCH',
    title: 'The Weekend Effect in Stocks',
    description:
      'A data-driven look at whether market returns behave differently around the weekend.',
  },
  {
    category: 'MARKET HISTORY',
    title: 'Nearly a Century of S&P 500 Returns',
    description:
      'Putting long-term market gains, losses, and volatility into historical perspective.',
  },
]

/* ==========================================================================
   TNI PUBLIC WEBSITE — FEATURED CHART PLACEHOLDER
   Visual structure only. Replace with verified market data later.
   ========================================================================== */

const chartValues = [
  18, 27, -14, 31, 22, -19, 35, 13, 25, 42,
  -24, 19, 30, 16, -11, 37, 20, 29, -18, 33,
  24, 15, 40, -22, 27, 18, 34, -15, 21, 39,
  14, -27, 31, 26, 17, 43, -20, 23, 36, 12,
  -17, 29, 38, 19, 25, -24, 32, 16, 41, 22,
  -13, 28, 35, 17, -21, 39, 24, 30, 13, -16,
  34, 21, 42, -18, 26, 37, 15, -23, 31, 20,
]

function FeaturedChart() {
  return (
    <div className="featured-chart">
      <div className="chart-grid chart-grid-1" />
      <div className="chart-grid chart-grid-2" />
      <div className="chart-grid chart-grid-3" />
      <div className="chart-zero-line" />

      <div className="chart-bars">
        {chartValues.map((value, index) => (
          <span
            key={`${index}-${value}`}
            className={`chart-bar ${
              value >= 0 ? 'chart-bar-positive' : 'chart-bar-negative'
            }`}
            style={{
              height: `${Math.max(Math.abs(value) * 1.35, 6)}px`,
            }}
          />
        ))}
      </div>

      <div className="chart-years">
        <span>1930</span>
        <span>1950</span>
        <span>1970</span>
        <span>1990</span>
        <span>2010</span>
        <span>2026</span>
      </div>
    </div>
  )
}

/* ==========================================================================
   TNI PUBLIC WEBSITE — HEADER
   ========================================================================== */

function Header({
  page,
  setPage,
}: {
  page: PageName
  setPage: (page: PageName) => void
}) {
  function navigate(nextPage: PageName) {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <header className="site-header">
        <button
          className="brand"
          type="button"
          onClick={() => navigate('research')}
        >
          <span className="brand-mark">
            <span>T</span>
            <strong>N</strong>
            <span>I</span>
          </span>

          <span className="brand-copy">
            <strong>TradingNInvestment</strong>
            <small>RESEARCH · DATA · INTELLIGENCE</small>
          </span>
        </button>

        <nav className="desktop-nav">
          <button
            type="button"
            className={page === 'research' ? 'active' : ''}
            onClick={() => navigate('research')}
          >
            Research
          </button>

          <button
            type="button"
            className={page === 'articles' ? 'active' : ''}
            onClick={() => navigate('articles')}
          >
            Articles
          </button>

          <button
            type="button"
            className={page === 'about' ? 'active' : ''}
            onClick={() => navigate('about')}
          >
            About
          </button>
        </nav>

        <div className="header-actions">
          <button className="header-search" type="button" aria-label="Search">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16L20 20" />
            </svg>
          </button>

          <a className="launch-tni" href="https://tni-frontend.onrender.com/live/news" target="_blank" rel="noreferrer">
            Launch TNI
            <span>→</span>
          </a>
        </div>
      </header>

      {/* ====================================================================
          MOBILE BOTTOM NAVIGATION
          ==================================================================== */}

      <nav className="mobile-bottom-nav">
        <button
          type="button"
          className={page === 'research' ? 'active' : ''}
          onClick={() => navigate('research')}
        >
          Research
        </button>

        <button
          type="button"
          className={page === 'articles' ? 'active' : ''}
          onClick={() => navigate('articles')}
        >
          Articles
        </button>

        <button
          type="button"
          className={page === 'about' ? 'active' : ''}
          onClick={() => navigate('about')}
        >
          About
        </button>
      </nav>
    </>
  )
}

/* ==========================================================================
   TNI PUBLIC WEBSITE — RESEARCH HOME PAGE
   ========================================================================== */

function ResearchPage({
  setPage,
}: {
  setPage: (page: PageName) => void
}) {
  return (
    <main>
      {/* ====================================================================
          HERO SECTION
          ==================================================================== */}

      <section className="hero-layout">
        <div className="hero-card">
          <div className="hero-content">
            <span className="eyebrow">EVIDENCE-BASED RESEARCH</span>

            <h1>
              Smarter Insights
              <br />
              for a <span>Brighter Tomorrow</span>
            </h1>

            <p>
              Independent market research, visual intelligence, and
              data-driven analysis for better investment decisions.
            </p>

            <div className="hero-actions">
              <a href="#featured-research" className="primary-action">
                Explore Research
                <span>→</span>
              </a>

              <a href="https://tni-frontend.onrender.com/live/news" target="_blank" rel="noreferrer" className="secondary-action">
                Launch TNI
                <span>→</span>
              </a>
            </div>

            <div className="hero-search">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16L20 20" />
              </svg>

              <input
                type="text"
                placeholder="Search research, markets, or topics"
              />

              <button type="button" aria-label="Search">
                →
              </button>
            </div>
          </div>

          {/* ==================================================================
              HERO BUILDING IMAGE
              Actual image asset. Used on both desktop and mobile.
              ================================================================== */}

          <div className="hero-image-wrap">
            <img
              src={heroImg}
              alt=""
              className="hero-building-image"
            />
          </div>
        </div>

        {/* ==================================================================
            DESKTOP SIDE COLUMN
            ================================================================== */}

        <aside className="hero-sidebar">
          <div className="side-card">
            <div className="side-title">
              <span>MARKET SNAPSHOT</span>
              <small>OVERVIEW</small>
            </div>

            <div className="market-item">
              <div>
                <strong>S&amp;P 500</strong>
                <small>U.S. Large Cap</small>
              </div>
              <span className="positive-text">Market</span>
            </div>

            <div className="market-item">
              <div>
                <strong>NASDAQ</strong>
                <small>Technology</small>
              </div>
              <span className="positive-text">Growth</span>
            </div>

            <div className="market-item">
              <div>
                <strong>DOW</strong>
                <small>Blue Chip</small>
              </div>
              <span>Industrial</span>
            </div>

            <div className="market-item">
              <div>
                <strong>VIX</strong>
                <small>Volatility</small>
              </div>
              <span className="negative-text">Risk</span>
            </div>
          </div>

          <div className="side-card">
            <div className="side-title">
              <span>POPULAR TOPICS</span>
            </div>

            <div className="topic-tags">
              <span>Historical Returns</span>
              <span>Drawdowns</span>
              <span>Seasonality</span>
              <span>Quant Research</span>
            </div>
          </div>

          <div className="side-card research-brief">
            <span>RESEARCH BRIEF</span>

            <h3>New research. Clear perspective.</h3>

            <p>
              Concise financial research without unnecessary noise.
            </p>

            <button type="button">
              Get Research Updates →
            </button>
          </div>
        </aside>
      </section>

      {/* ====================================================================
          SIMPLE RESEARCH / ARTICLES / ABOUT ROW
          ==================================================================== */}

      <section className="quick-navigation">
        <button type="button" onClick={() => setPage('research')}>
          <strong>Research</strong>
          <span>Original market studies and visual analysis</span>
        </button>

        <button type="button" onClick={() => setPage('articles')}>
          <strong>Articles</strong>
          <span>Clear explanations of markets and investing</span>
        </button>

        <button type="button" onClick={() => setPage('about')}>
          <strong>About</strong>
          <span>Research philosophy and TNI platform</span>
        </button>
      </section>

      {/* ====================================================================
          FEATURED RESEARCH
          ==================================================================== */}

      <section className="content-section" id="featured-research">
        <div className="section-heading">
          <div>
            <span>FEATURED RESEARCH</span>
            <h2>Research worth seeing.</h2>
          </div>

          <button type="button">View All Research →</button>
        </div>

        <article className="featured-card">
          <div className="featured-copy">
            <span className="content-tag">MARKET HISTORY</span>

            <h3>S&amp;P 500 Annual Returns</h3>

            <h4>Nearly a Century of Market History</h4>

            <p>
              A visual history of annual market performance showing how gains,
              losses, volatility, and long-term compounding have evolved across
              market cycles.
            </p>

            <button className="primary-action" type="button">
              View Full Research
              <span>→</span>
            </button>
          </div>

          <div className="chart-panel">
            <div className="chart-top">
              <div>
                <small>ANNUAL RETURN</small>
                <strong>S&amp;P 500</strong>
              </div>

              <div className="chart-legend">
                <span className="legend-positive">Positive</span>
                <span className="legend-negative">Negative</span>
              </div>
            </div>

            <FeaturedChart />

            <p className="chart-question">
              How often does the market actually lose money?
            </p>
          </div>

          <div className="featured-metrics">
            <div>
              <small>LONG-TERM TREND</small>
              <strong className="positive-text">Positive</strong>
              <span>Despite frequent short-term volatility</span>
            </div>

            <div>
              <small>RESEARCH FORMAT</small>
              <strong>Visual</strong>
              <span>Designed for fast understanding</span>
            </div>

            <div>
              <small>PRIMARY FOCUS</small>
              <strong>Evidence</strong>
              <span>Data before opinion</span>
            </div>
          </div>
        </article>
      </section>

      {/* ====================================================================
          LATEST ARTICLES
          ==================================================================== */}

      <section className="content-section latest-section">
        <div className="section-heading">
          <div>
            <span>LATEST ARTICLES</span>
            <h2>Market ideas, clearly explained.</h2>
          </div>

          <button type="button" onClick={() => setPage('articles')}>
            View All Articles →
          </button>
        </div>

        <div className="article-grid">
          {articles.map((article, index) => (
            <article className="article-card" key={article.title}>
              <div className={`article-image article-image-${index + 1}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="article-content">
                <span className="content-tag">{article.category}</span>

                <h3>{article.title}</h3>

                <p>{article.description}</p>

                <div className="article-bottom">
                  <small>Research Insight</small>
                  <button type="button">Read →</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

/* ==========================================================================
   TNI PUBLIC WEBSITE — ARTICLES PAGE
   ========================================================================== */

function ArticlesPage() {
  return (
    <main className="inner-page">
      <section className="inner-intro">
        <span className="eyebrow">
          TRADINGNINVESTMENT RESEARCH
        </span>

        <h1>
          Market ideas,
          <br />
          <span>clearly explained.</span>
        </h1>

        <p>
          Quantitative research, market history, and practical investment
          insights presented without unnecessary complexity.
        </p>
      </section>

      <section className="article-library">
        {articles.concat(articles).map((article, index) => (
          <article className="library-card" key={`${article.title}-${index}`}>
            <div
              className={`library-image article-image-${(index % 3) + 1}`}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>

            <div className="library-content">
              <span className="content-tag">{article.category}</span>

              <h2>{article.title}</h2>

              <p>{article.description}</p>

              <div>
                <small>Research Insight</small>
                <button type="button">Read Article →</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

/* ==========================================================================
   TNI PUBLIC WEBSITE — ABOUT PAGE
   ========================================================================== */

function AboutPage() {
  return (
    <main className="inner-page">
      <section className="about-intro">
        <div>
          <span className="eyebrow">
            ABOUT TRADINGNINVESTMENT
          </span>

          <h1>
            Markets are complex.
            <br />
            <span>Research should not be.</span>
          </h1>

          <p>
            TradingNInvestment transforms financial data, market history, and
            quantitative research into clear visual intelligence designed to
            help investors understand what matters.
          </p>
        </div>

        <div className="about-art">
          <div className="about-circle" />

          <div className="about-line about-line-1" />
          <div className="about-line about-line-2" />
          <div className="about-line about-line-3" />

          <span>
            DATA
            <strong>→</strong>
            RESEARCH
            <strong>→</strong>
            INTELLIGENCE
          </span>
        </div>
      </section>

      <section className="principles">
        <article>
          <span>01</span>

          <h2>Independent Research</h2>

          <p>
            Start with evidence, market data, and historical context rather
            than headlines or opinions.
          </p>
        </article>

        <article>
          <span>02</span>

          <h2>Visual Intelligence</h2>

          <p>
            Complex financial information becomes easier to understand when
            the right data is presented clearly.
          </p>
        </article>

        <article>
          <span>03</span>

          <h2>Technology + Research</h2>

          <p>
            Public research connects naturally with the deeper market
            intelligence available through TNI.
          </p>
        </article>
      </section>

      <section className="about-cta">
        <div>
          <span>GO FURTHER WITH TNI</span>

          <h2>Research is only the beginning.</h2>

          <p>
            Move from public research into real-time market intelligence,
            quantitative signals, news analysis, and AI-powered research.
          </p>
        </div>

        <a href="https://tni-frontend.onrender.com/live/news" target="_blank" rel="noreferrer" className="primary-action">
          Launch TNI
          <span>→</span>
        </a>
      </section>
    </main>
  )
}

/* ==========================================================================
   TNI PUBLIC WEBSITE — FOOTER
   ========================================================================== */

function Footer({
  setPage,
}: {
  setPage: (page: PageName) => void
}) {
  return (
    <footer className="site-footer">

      {/* ==================================================================
          TNI FOOTER — EDUCATIONAL & RESEARCH DISCLAIMER
          ================================================================== */}
      <div className="footer-disclaimer">
        <strong>Educational &amp; Research Purposes Only</strong>

        <p>
          All content, data, charts, research, analysis, and tools provided by
          TradingNInvestment (TNI) are for educational and research purposes
          only and do not constitute investment, financial, trading, legal, or
          tax advice. Information may contain errors, omissions, or delays.
          Users should independently verify information, conduct their own due
          diligence, and consult qualified professionals where appropriate
          before making investment or commercial decisions. Past performance
          does not guarantee future results.
        </p>
      </div>

      {/* ==================================================================
          TNI FOOTER — BRAND & NAVIGATION
          ================================================================== */}
      <div className="footer-main">
        <div className="footer-brand">
          <span className="brand-mark">
            <span>T</span>
            <strong>N</strong>
            <span>I</span>
          </span>

          <div>
            <strong>TradingNInvestment</strong>
            <small>Research. Data. Intelligence.</small>
          </div>
        </div>

        <nav>
          <button type="button" onClick={() => setPage('research')}>
            Research
          </button>

          <button type="button" onClick={() => setPage('articles')}>
            Articles
          </button>

          <button type="button" onClick={() => setPage('about')}>
            About
          </button>

          <a
            href="https://tni-frontend.onrender.com/live/news"
            target="_blank"
            rel="noreferrer"
          >
            Launch TNI
          </a>
        </nav>
      </div>

      {/* ==================================================================
          TNI FOOTER — COPYRIGHT
          ================================================================== */}
      <div className="footer-bottom">
        <span>© 2026 TradingNInvestment (TNI)</span>

        <span>
          Research and information. Not investment advice.
        </span>
      </div>
    </footer>
  )
}

/* ==========================================================================
   TNI PUBLIC WEBSITE — APP
   ========================================================================== */

function App() {
  const [page, setPage] = useState<PageName>('research')

  return (
    <div className="site">
      <Header page={page} setPage={setPage} />

      {page === 'research' && (
        <ResearchPage setPage={setPage} />
      )}

      {page === 'articles' && <ArticlesPage />}

      {page === 'about' && <AboutPage />}

      <Footer setPage={setPage} />
    </div>
  )
}

export default App
