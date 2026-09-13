import { useState } from 'react'
import heroImg from './assets/hero.webp'
import SP500ReturnsPage from './pages/SP500ReturnsPage'
import SP500ReturnsEmbedPage from './pages/SP500ReturnsEmbedPage'
import LatestMarketIntelligence from './components/news/LatestMarketIntelligence'
import './App.css'

/* ==========================================================================
   TNI PUBLIC WEBSITE — PAGE TYPES
   ========================================================================== */

type PageName = 'research' | 'articles' | 'about'

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
              <span>POPULAR TOPICS</span>
            </div>

            <div className="topic-tags">
              <span>Historical Returns</span>
              <span>Drawdowns</span>
              <span>Seasonality</span>
              <span>Quant Research</span>
            </div>
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
          TNI HOMEPAGE — LATEST MARKET INTELLIGENCE
          Delayed public preview of verified TNI intelligence.
          Primary conversion path into the real-time TNI Live News channel.
          ==================================================================== */}

      <LatestMarketIntelligence />

      {/* ====================================================================
          FEATURED RESEARCH
          ==================================================================== */}

      <section className="content-section" id="featured-research">
        <div className="section-heading">
          <div>
            <span>FEATURED ARTICLE</span>
            <h2>Nearly a century of S&amp;P 500 market history.</h2>
          </div>

          {/* ============================================================
              TNI HOMEPAGE — FEATURED RESEARCH NAVIGATION
              Opens the canonical S&P 500 research page.
          ============================================================ */}
          <a
            className="section-research-link"
            href="/sp-500-returns/"
          >
            View Full Research →
          </a>
        </div>

        {/* ====================================================================
            TNI HOMEPAGE — FLAGSHIP FEATURED ARTICLE
            Uses verified static research artwork instead of dashboard UI.
            ==================================================================== */}

        <article className="featured-card featured-article-card">

          {/* ==================================================================
              TNI FEATURED ARTICLE — STATIC RESEARCH PREVIEW
              Generated from verified S&P 500 annual-return data.
              ================================================================== */}

          <a
            className="featured-article-image-link"
            href="/sp-500-returns/"
            aria-label="View S&P 500 Returns by Year research"
          >
            <img
              className="featured-article-image"
              src="/images/sp500-annual-returns-preview.svg"
              alt="S&P 500 historical annual price returns by year from 1928 through 2026 YTD"
              loading="lazy"
            />
          </a>

          {/* ==================================================================
              TNI FEATURED ARTICLE — EDITORIAL COPY
              ================================================================== */}

          <div className="featured-copy featured-article-copy">

            <span className="content-tag">MARKET HISTORY</span>

            <h3>S&amp;P 500 Returns by Year (1928–2026)</h3>

            <h4>Historical Annual Returns and Market Performance</h4>

            <p>
              Explore S&amp;P 500 returns by year from 1928 through 2026 YTD.
              See positive and negative years, average historical returns,
              major market declines, recoveries, and nearly a century of
              annual market performance in one interactive research center.
            </p>

            {/* ==============================================================
                TNI FEATURED ARTICLE — PRIMARY CTA
                ============================================================== */}

            <a
              className="primary-action"
              href="/sp-500-returns/"
            >
              View Full Research
              <span>→</span>
            </a>
          </div>

          {/* ==================================================================
              TNI FEATURED ARTICLE — VERIFIED RESEARCH METRICS
              ================================================================== */}

          <div className="featured-metrics">

            <div>
              <small>AVERAGE ANNUAL RETURN</small>
              <strong className="positive-text">+8.10%</strong>
              <span>98 completed calendar years</span>
            </div>

            <div>
              <small>NON-NEGATIVE YEARS</small>
              <strong className="positive-text">68.37%</strong>
              <span>67 of 98 completed years</span>
            </div>

            <div>
              <small>BEST YEAR</small>
              <strong className="positive-text">+45.02%</strong>
              <span>1954</span>
            </div>

            <div>
              <small>WORST YEAR</small>
              <strong className="negative-text">-47.07%</strong>
              <span>1931</span>
            </div>

          </div>

        </article>
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

      {/* ==================================================================
          TNI ARTICLES — PAGE INTRO
          ================================================================== */}

      <section className="inner-intro">
        <span className="eyebrow">
          TRADINGNINVESTMENT RESEARCH
        </span>

        <h1>
          Market research,
          <br />
          <span>clearly explained.</span>
        </h1>

        <p>
          Independent market research, historical analysis, and data-driven
          investment insights designed to make complex market information
          easier to understand.
        </p>
      </section>


      {/* ==================================================================
          TNI ARTICLES — PUBLISHED RESEARCH
          Only real published research appears here.
          ================================================================== */}

      <section className="article-library">
        <article className="library-card tni-real-article-card">

          <a
            className="tni-real-article-image-link"
            href="/sp-500-returns/"
            aria-label="View S&P 500 Returns by Year research"
          >
            <img
              className="tni-real-article-image"
              src="/images/sp500-annual-returns-preview.svg"
              alt="S&P 500 historical annual price returns by year from 1928 through 2026 YTD"
              loading="lazy"
            />
          </a>

          <div className="library-content">
            <span className="content-tag">
              MARKET HISTORY
            </span>

            <h2>
              S&amp;P 500 Returns by Year (1928–2026)
            </h2>

            <p>
              Explore nearly a century of S&amp;P 500 annual returns,
              including positive and negative years, average historical
              performance, major market declines, recoveries, and 2026 YTD.
            </p>

            <div>
              <small>
                Historical Annual Returns and Market Performance
              </small>

              <a
                className="tni-article-read-link"
                href="/sp-500-returns/"
              >
                View Full Research →
              </a>
            </div>
          </div>

        </article>
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
          TradingNInvestment turns financial data, market history, and
          quantitative research into clear visual intelligence for investors,
          researchers, and market participants.
        </p>
      </section>


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
          href="https://tni-frontend.onrender.com/live/news"
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

  const normalizedPath =
    window.location.pathname.replace(/\/+$/, '') || '/'

  if (normalizedPath === '/sp-500-returns') {
    return <SP500ReturnsPage />
  }

  // ==========================================================================
  // TNI S&P 500 RETURNS — PUBLISHER EMBED ROUTE
  // ==========================================================================

  if (normalizedPath === '/embed/sp-500-returns') {
    return <SP500ReturnsEmbedPage />
  }

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
