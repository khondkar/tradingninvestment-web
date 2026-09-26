import { useState } from 'react'
import heroImg from './assets/hero.webp'
import SP500ReturnsPage from './pages/SP500ReturnsPage'
import DowReturnsPage from './pages/DowReturnsPage'
import NasdaqReturnsPage from './pages/NasdaqReturnsPage'
import SP500MonthlyReturnsPage from './pages/SP500MonthlyReturnsPage'
import SP500DrawdownsPage from './pages/SP500DrawdownsPage'
import NVDAReturnsPage from './pages/NVDAReturnsPage'
import MSFTReturnsPage from './pages/MSFTReturnsPage'
import StockMarketTodayPage from './pages/StockMarketTodayPage'
import StockMarketHeatmapPage from './pages/StockMarketHeatmapPage'
import StockMarketSectorHealthPage from './pages/StockMarketSectorHealthPage'
import StockMarketEarningsCalendarPage from './pages/StockMarketEarningsCalendarPage'
import { annualReturnsResearchRegistry } from './research/annual-returns/registry'
import { monthlyReturnsRegistry } from './research/monthly-returns/registry'
import { drawdownsResearchRegistry } from './research/drawdowns/registry'
import SP500ReturnsEmbedPage from './pages/SP500ReturnsEmbedPage'
import LatestMarketIntelligence from './components/news/LatestMarketIntelligence'
import './App.css'

/* ==========================================================================
   TNI PUBLIC WEBSITE — PAGE TYPES
   ========================================================================== */

type PageName = 'research' | 'market' | 'articles' | 'about'

const publishedResearchRegistry = [
  ...annualReturnsResearchRegistry.map((entry) => ({
    ...entry,
    researchType: 'annual' as const,
  })),
  ...monthlyReturnsRegistry.map((entry) => ({
    ...entry,
    researchType: 'monthly' as const,
  })),
  ...drawdownsResearchRegistry.map((entry) => ({
    ...entry,
    researchType: 'drawdowns' as const,
  })),
]


/* ==========================================================================
   TNI RESEARCH AUTHORITY — INDEPENDENT CITATIONS & REFERENCES
   ========================================================================== */

const researchCitations = [
  {
    name: 'Florida State University Law Review',
    type: 'ACADEMIC CITATION',
    logo: '/images/citations/fsu.svg',
    href: 'https://ir.law.fsu.edu/lr/vol46/iss4/3/',
  },
  {
    name: 'Sorbonne University',
    type: 'ACADEMIC REFERENCE',
    logo: '/images/citations/sorbonne.png',
    href: 'https://ecm.univ-paris1.fr/nuxeo/nxfile/default/2a2e1785-2b20-4751-9203-7f8819df8e62/file%3Acontent/2023-04%20PEREZ%20Inf.pdf',
  },
  {
    name: 'NFP — An Aon Company',
    type: 'PROFESSIONAL REFERENCE',
    logo: '/images/citations/nfp-aon.svg',
    href: 'https://webfiles2.nfp.com/webfiles/public/2020_emails/COVID-19/JH_three_insurance_opportunities.pdf',
  },
  {
    name: 'Debt.org',
    type: 'FINANCIAL REFERENCE',
    logo: '/images/citations/debt-org.png',
    href: 'https://www.debt.org/advice/the-truth-about-dave-ramseys-baby-steps-do-they-work/',
  },
  {
    name: 'Oak Harvest Financial Group',
    type: 'FINANCIAL REFERENCE',
    logo: null,
    monogram: 'OH',
    href: 'https://oakharvestfg.com/wp-content/uploads/2020/10/roadmap-to-retirement.pdf',
  },
]

/* ==========================================================================
   TNI PUBLIC WEBSITE — HEADER
   ========================================================================== */

async function shareCurrentPage() {
  const shareData = {
    title: document.title,
    url: window.location.href,
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
      window.gtag?.("event", "page_share", {
        platform: "native",
        page_path: window.location.pathname,
      })
      return
    }

    await navigator.clipboard.writeText(window.location.href)

    window.gtag?.("event", "page_share", {
      platform: "copy_link",
      page_path: window.location.pathname,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return
    }

    console.error("TNI SHARE ERROR:", error)
  }
}

function Header({
  page,
  setPage,
}: {
  page: PageName
  setPage: (page: PageName) => void
}) {
  function navigate(nextPage: PageName) {
    const currentPath =
      window.location.pathname.replace(/\/+$/, '') || '/'

    if (currentPath !== '/') {
      const target =
        nextPage === 'research'
          ? '/'
          : '/?page=' + nextPage

      window.location.assign(target)
      return
    }

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
            className={page === 'market' ? 'active' : ''}
            onClick={() => window.location.assign('/stock-market-today/')}
          >
            Stock Market Today
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

          <button
            type="button"
            className="header-share-button"
            onClick={shareCurrentPage}
            aria-label="Share this page"
            title="Share this page"
          >
            ↗ Share
          </button>

          <a className="launch-tni" href="https://app.tradingninvestment.com/live/news" target="_blank" rel="noreferrer">
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
          className={page === 'market' ? 'active' : ''}
          onClick={() => window.location.assign('/stock-market-today/')}
        >
          Market Today
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

              <a href="https://app.tradingninvestment.com/live/news" target="_blank" rel="noreferrer" className="secondary-action">
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

          {/* ================================================================
              TNI RESEARCH AUTHORITY — INDEPENDENT REFERENCES
              ================================================================ */}

          <div className="side-card citation-side-card">
            <div className="side-title">
              <span>CITED &amp; REFERENCED BY</span>
            </div>

            <div className="citation-trust-intro">
              Independent publications referencing
              TradingNInvestment research.
            </div>

            <div className="citation-side-list">
              {researchCitations.map((citation) => (
                <a
                  key={citation.name}
                  className="citation-side-link"
                  href={citation.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Verify ${citation.name} reference`}
                >
                  <div className="citation-mark" aria-hidden="true">
                    {citation.logo ? (
                      <img
                        src={citation.logo}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <strong>{citation.monogram}</strong>
                    )}
                  </div>

                  <div className="citation-side-copy">
                    <strong>{citation.name}</strong>
                    <small>{citation.type}</small>
                  </div>

                  <span
                    className="citation-verify"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>
              ))}
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
            <h2>100+ years of Dow Jones market history.</h2>
          </div>

          {/* ============================================================
              TNI HOMEPAGE — FEATURED RESEARCH NAVIGATION
              Opens the canonical Dow Jones historical returns research page.
          ============================================================ */}
          <a
            className="section-research-link"
            href="/stock-market-historical-returns/"
          >
            View Full Research →
          </a>
        </div>

        {/* ====================================================================
            TNI HOMEPAGE — FLAGSHIP FEATURED ARTICLE
            Uses verified static research artwork instead of dashboard UI.
            ==================================================================== */}

        <article className="featured-card featured-article-card">

          <a
            className="featured-article-image-link"
            href="/stock-market-historical-returns/"
            aria-label="View Stock Market Historical Returns research"
          >
            <img
              className="featured-article-image"
              src="/images/social/stock-market-historical-returns-og.png"
              alt="Dow Jones historical returns and more than 100 years of stock market history"
              loading="lazy"
            />
          </a>

          <div className="featured-copy featured-article-copy">

            <span className="content-tag">MARKET HISTORY</span>

            <h3>
              Stock Market Historical Returns: 100+ Years of Dow Jones Returns
            </h3>

            <h4>Historical Annual Returns and Market Performance</h4>

            <p>
              Explore Dow Jones returns by year from 1921 through 2026 YTD.
              Analyze historical annual returns, long-term performance,
              positive and negative years, and more than a century of
              stock market history in one interactive research center.
            </p>

            <a
              className="primary-action"
              href="/stock-market-historical-returns/"
            >
              View Full Research
              <span>→</span>
            </a>
          </div>

          <div className="featured-metrics">

            <div>
              <small>AVERAGE ANNUAL RETURN</small>
              <strong className="positive-text">+8.08%</strong>
              <span>105 completed calendar years</span>
            </div>

            <div>
              <small>POSITIVE YEARS</small>
              <strong className="positive-text">69.52%</strong>
              <span>73 of 105 completed years</span>
            </div>

            <div>
              <small>BEST YEAR</small>
              <strong className="positive-text">+63.74%</strong>
              <span>1933</span>
            </div>

            <div>
              <small>WORST YEAR</small>
              <strong className="negative-text">-52.67%</strong>
              <span>1931</span>
            </div>

          </div>

        </article>

        {/* ====================================================================
            TNI HOMEPAGE — AUTOMATIC PUBLISHED RESEARCH
            Non-featured published assets are rendered from the central
            annual-return research registry.
            ==================================================================== */}

        <div className="article-library tni-research-secondary">
          {publishedResearchRegistry
            .filter((entry) => !entry.featured)
            .map((entry) => {
              const { config, previewImage } = entry

              return (
                <article
                  className="library-card tni-real-article-card"
                  key={config.slug}
                >
                  <a
                    className={
                      previewImage
                        ? "tni-real-article-image-link"
                        : "tni-real-article-image-link tni-research-placeholder"
                    }
                    href={config.canonicalPath}
                    aria-label={"View " + config.name + " returns research"}
                  >
                    {previewImage ? (
                      <img
                        className="tni-real-article-image"
                        src={previewImage}
                        alt={config.name + " historical returns research"}
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <strong>{config.symbol}</strong>
                        <span>
                          {entry.researchType === 'monthly'
                            ? 'MONTHLY RETURNS'
                            : entry.researchType === 'drawdowns'
                              ? 'DRAWDOWNS & CORRECTIONS'
                              : 'ANNUAL RETURNS'}
                        </span>
                      </>
                    )}
                  </a>

                  <div className="library-content">
                    <span className="content-tag">
                      {config.categories.includes("index")
                        ? "MARKET HISTORY"
                        : "STOCK HISTORY"}
                    </span>

                    <h2>{config.seo.socialTitle}</h2>

                    <p>{config.seo.socialDescription}</p>

                    <div>
                      <small>
                        {entry.researchType === 'monthly'
                          ? 'Historical Monthly Returns and Market Performance'
                          : entry.researchType === 'drawdowns'
                            ? 'Historical Corrections, Bear Markets and Recoveries'
                            : 'Historical Annual Returns and Market Performance'}
                      </small>

                      <a
                        className="tni-article-read-link"
                        href={config.canonicalPath}
                      >
                        View Full Research →
                      </a>
                    </div>
                  </div>
                </article>
              )
            })}
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
        {publishedResearchRegistry.map((entry) => {
          const { config, previewImage } = entry

          return (
            <article
              className="library-card tni-real-article-card"
              key={config.slug}
            >
              <a
                className={
                  previewImage
                    ? "tni-real-article-image-link"
                    : "tni-real-article-image-link tni-research-placeholder"
                }
                href={config.canonicalPath}
                aria-label={"View " + config.name + " returns research"}
              >
                {previewImage ? (
                  <img
                    className="tni-real-article-image"
                    src={previewImage}
                    alt={config.name + " historical returns research"}
                    loading="lazy"
                  />
                ) : (
                  <>
                    <strong>{config.symbol}</strong>
                    <span>
                          {entry.researchType === 'monthly'
                            ? 'MONTHLY RETURNS'
                            : entry.researchType === 'drawdowns'
                              ? 'DRAWDOWNS & CORRECTIONS'
                              : 'ANNUAL RETURNS'}
                        </span>
                  </>
                )}
              </a>

              <div className="library-content">
                <span className="content-tag">
                  {config.categories.includes("index")
                    ? "MARKET HISTORY"
                    : "STOCK HISTORY"}
                </span>

                <h2>{config.seo.socialTitle}</h2>

                <p>{config.seo.socialDescription}</p>

                <div>
                  <small>
                    {entry.researchType === 'monthly'
                          ? 'Historical Monthly Returns and Market Performance'
                          : entry.researchType === 'drawdowns'
                            ? 'Historical Corrections, Bear Markets and Recoveries'
                            : 'Historical Annual Returns and Market Performance'}
                  </small>

                  <a
                    className="tni-article-read-link"
                    href={config.canonicalPath}
                  >
                    View Full Research →
                  </a>
                </div>
              </div>
            </article>
          )
        })}
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
          TNI ABOUT — CONTACT
          ================================================================== */}

      <section className="tni-about-statement">
        <span className="content-tag">
          CONTACT
        </span>

        <h2>
          Contact TradingNInvestment
        </h2>

        <p>
          TradingNInvestment<br />
          New York, NY, United States
        </p>

        <p>
          <a href="mailto:contact@tradingninvestment.com">
            contact@tradingninvestment.com
          </a>
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
            href="https://app.tradingninvestment.com/live/news"
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
  const requestedPage =
    new URLSearchParams(
      window.location.search
    ).get('page')

  const [page, setPage] =
    useState<PageName>(
      requestedPage === 'articles' ||
      requestedPage === 'about'
        ? requestedPage
        : 'research'
    )

  const normalizedPath =
    window.location.pathname.replace(/\/+$/, '') || '/'

  // ============================================================================
  // TNI STOCK MARKET TODAY — LIVE MARKET DASHBOARD
  // Canonical URL: /stock-market-today/
  // ============================================================================

  if (normalizedPath === '/stock-market-today/earnings-calendar') {
    return (
      <div className="site">
        <Header
          page="market"
          setPage={setPage}
        />

        <StockMarketEarningsCalendarPage />

        <Footer setPage={setPage} />
      </div>
    )
  }

  if (normalizedPath === '/stock-market-today/sector-health') {
    return (
      <div className="site">
        <Header
          page="market"
          setPage={setPage}
        />

        <StockMarketSectorHealthPage />

        <Footer setPage={setPage} />
      </div>
    )
  }

  if (normalizedPath === '/stock-market-today/heatmap') {
    return (
      <div className="site">
        <Header
          page="market"
          setPage={setPage}
        />
        <StockMarketHeatmapPage />
      </div>
    )
  }

  if (normalizedPath === '/stock-market-today') {
    return (
      <div className="site">
        <Header
          page="market"
          setPage={setPage}
        />
        <StockMarketTodayPage />
      </div>
    )
  }

  if (normalizedPath === '/sp-500-returns') {
    return (
      <div className="site">
        <Header
          page="research"
          setPage={setPage}
        />
        <SP500ReturnsPage />
      </div>
    )
  }

  // ========================================================================
  // TNI DOW JONES HISTORICAL RETURNS — PUBLIC RESEARCH ROUTE
  //
  // Legacy canonical URL preserved:
  // /stock-market-historical-returns/
  // ========================================================================

  if (normalizedPath === '/stock-market-historical-returns') {
    return (
      <div className="site">
        <Header
          page="research"
          setPage={setPage}
        />
        <DowReturnsPage />
      </div>
    )
  }

  // ========================================================================
  // TNI MICROSOFT STOCK RETURNS — PUBLIC RESEARCH ROUTE
  //
  // Canonical URL:
  // /msft-stock-returns/
  // ========================================================================


  // ============================================================================
  // TNI S&P 500 MONTHLY RETURNS — PUBLIC RESEARCH ROUTE
  // Canonical URL: /sp-500-monthly-returns/
  // ============================================================================

  if (normalizedPath === '/sp-500-monthly-returns') {
    return (
      <div className="site">
        <Header
          page="research"
          setPage={setPage}
        />
        <SP500MonthlyReturnsPage />
      </div>
    )
  }

  // ============================================================================
  // TNI S&P 500 DRAWDOWNS & CORRECTIONS — PUBLIC RESEARCH ROUTE
  //
  // Legacy article URL preserved as the canonical research URL:
  // /stock-market-correction-myth-and-reality/
  // ============================================================================

  if (
    normalizedPath ===
    '/stock-market-correction-myth-and-reality'
  ) {
    return (
      <div className="site">
        <Header
          page="research"
          setPage={setPage}
        />
        <SP500DrawdownsPage />
      </div>
    )
  }

  if (normalizedPath === '/msft-stock-returns') {
    return (
      <div className="site">
        <Header
          page="research"
          setPage={setPage}
        />
        <MSFTReturnsPage />
      </div>
    )
  }

  // ========================================================================
  // TNI NASDAQ COMPOSITE RETURNS — PUBLIC RESEARCH ROUTE
  //
  // Canonical URL:
  // /nasdaq-historical-annual-returns/
  // ========================================================================

  if (normalizedPath === '/nasdaq-historical-annual-returns') {
    return (
      <div className="site">
        <Header
          page="research"
          setPage={setPage}
        />
        <NasdaqReturnsPage />
      </div>
    )
  }

  // ========================================================================
  // TNI NVDA RETURNS — PUBLIC RESEARCH ROUTE
  // ========================================================================

  if (normalizedPath === '/nvda-returns') {
    return (
      <div className="site">
        <Header
          page="research"
          setPage={setPage}
        />
        <NVDAReturnsPage />
      </div>
    )
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
