import StockMarketCrash1929Page from './pages/StockMarketCrash1929Page'
import { useState } from 'react'
import SP500ReturnsPage from './pages/SP500ReturnsPage'
import AverageStockMarketReturnPage from './pages/AverageStockMarketReturnPage'
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
import { ResearchConnections, ResearchHubPage, ResearchTrail } from './components/research/ResearchDiscovery'
import { getHub } from './research/discovery'
import PremiumResearchHome from './components/home/PremiumResearchHome'
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
    if (nextPage === 'about') {
      window.location.assign('/about/')
      return
    }
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
            onClick={() => window.location.assign('/research/')}
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
          className={window.location.pathname === '/' && page === 'research' ? 'active' : ''}
          onClick={() => navigate('research')}
        >
          Home
        </button>

        <button type="button" className={window.location.pathname.startsWith('/research/') ? 'active' : ''} onClick={() => window.location.assign('/research/')}>Research</button>

        <a className="mobile-tni-product" href="https://app.tradingninvestment.com/live/news" aria-label="Open TNI Intelligence">✦ TNI</a>

        <button
          type="button"
          className={page === 'market' ? 'active' : ''}
          onClick={() => window.location.assign('/stock-market-today/')}
        >
          Market
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

function ResearchPage() {
  return <PremiumResearchHome />
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

export function AboutPage() {
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
          <a href="/research/">Research</a>

          <button type="button" onClick={() => { setPage('about'); window.location.assign('/about/') }}>
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

  if (normalizedPath === '/stock-market-crash-of-1929') {
    return (
      <div className="site">
        <Header page="research" setPage={setPage} />
        <StockMarketCrash1929Page />
        <Footer setPage={setPage} />
      </div>
    )
  }

  const researchHub = getHub(normalizedPath)
  if (normalizedPath === '/about') {
    return <div className="site">
      <Header page="about" setPage={setPage} />
      <AboutPage />
      <Footer setPage={setPage} />
    </div>
  }
  if (researchHub) {
    return <div className="site">
      <Header page="research" setPage={setPage} />
      <ResearchHubPage hub={researchHub} />
      <Footer setPage={setPage} />
    </div>
  }

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
        <ResearchTrail path="/sp-500-returns/" />
        <SP500ReturnsPage />
        <ResearchConnections path="/sp-500-returns/" />
      </div>
    )
  }

  // ========================================================================
  // TNI AVERAGE STOCK MARKET RETURN — PRICE / TOTAL / REAL RETURN RESEARCH
  // ========================================================================

  if (normalizedPath === '/average-stock-market-return') {
    return (
      <div className="site">
        <Header
          page="research"
          setPage={setPage}
        />
        <AverageStockMarketReturnPage />
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
        <ResearchTrail path="/stock-market-historical-returns/" />
        <DowReturnsPage />
        <ResearchConnections path="/stock-market-historical-returns/" />
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
        <ResearchConnections path="/sp-500-monthly-returns/" />
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
        <ResearchConnections path="/stock-market-correction-myth-and-reality/" />
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
        <ResearchTrail path="/msft-stock-returns/" />
        <MSFTReturnsPage />
        <ResearchConnections path="/msft-stock-returns/" />
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
        <ResearchTrail path="/nasdaq-historical-annual-returns/" />
        <NasdaqReturnsPage />
        <ResearchConnections path="/nasdaq-historical-annual-returns/" />
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
        <ResearchTrail path="/nvda-returns/" />
        <NVDAReturnsPage />
        <ResearchConnections path="/nvda-returns/" />
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
    <div className={page === 'research' ? 'site tni-home-site' : 'site'}>
      <Header page={page} setPage={setPage} />

      {page === 'research' && (
        <ResearchPage />
      )}

      {page === 'articles' && <ArticlesPage />}

      {page === 'about' && <AboutPage />}

      <Footer setPage={setPage} />
    </div>
  )
}

export default App
