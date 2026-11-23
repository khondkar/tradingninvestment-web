let AboutPage: typeof import('./pages/AboutPage')['default']
import ScannerLinks from './components/market/ScannerLinks'
import fundedRoutes from './components/trading/funded-routes.json'
import TradingLinks from './components/trading/TradingLinks'
import tradingRoutes from './components/trading/routes.json'
import TniKitSubscriptionPopup from './components/subscription/TniKitSubscriptionPopup'
import { useState } from 'react'
import { publishedAnnualReturnsResearchRegistry } from './research/annual-returns/registry'
import { getStockResearchData } from './performance/researchData'
import { getLeveragedEtfResearchData } from './performance/researchData'
import { getEtfResearchData } from './performance/researchData'
import { monthlyReturnsRegistry } from './research/monthly-returns/registry'
import { drawdownsResearchRegistry } from './research/drawdowns/registry'
import { ResearchConnections, ResearchHubPage, ResearchTrail } from './components/research/ResearchDiscovery'
import { getHub } from './research/discovery'
import PremiumResearchHome from './components/home/PremiumResearchHome'
import HomeSearch from './components/home/HomeSearch'
import './SiteShell.css'

import { loadResearchData } from './performance/researchData'
function currentPathname() { return typeof window === 'undefined' ? '/' : window.location.pathname }

let LeveragedEtfScannerPage: typeof import('./pages/LeveragedEtfScannerPage')['default']
let AmdNvidiaForecast: typeof import('./pages/AmdNvidiaForecast')['default']
let SecCasesResearch: typeof import('./pages/SecCasesResearch')['default']
let AnthropicIpoResearch: typeof import('./pages/AnthropicIpoResearch')['default']
let IBMEarningsResearchPage: typeof import('./pages/IBMEarningsResearchPage')['default']
let JPMvsGSEarningsResearchPage: typeof import('./pages/JPMvsGSEarningsResearchPage')['default']
let SPYDojiResearchPage: typeof import('./pages/SPYDojiResearchPage')['default']
let AppleIphoneResearchPage: typeof import('./pages/AppleIphoneResearchPage')['default']
let GravestoneDojiArticle: typeof import('./pages/GravestoneDojiArticle')['default']
let MagicDojiPage: typeof import('./pages/MagicDojiPage')['default']
let NasdaqSelloff2026Page: typeof import('./pages/NasdaqSelloff2026Page')['default']
let NasdaqAICrash2026Page: typeof import('./pages/NasdaqAICrash2026Page')['default']
let NasdaqSelloffComparisonPage: typeof import('./pages/NasdaqSelloffComparisonPage')['default']
let StockMarketCrash1929Page: typeof import('./pages/StockMarketCrash1929Page')['default']
let SP500ReturnsPage: typeof import('./pages/SP500ReturnsPage')['default']
let AverageStockMarketReturnPage: typeof import('./pages/AverageStockMarketReturnPage')['default']
let DowReturnsPage: typeof import('./pages/DowReturnsPage')['default']
let NasdaqReturnsPage: typeof import('./pages/NasdaqReturnsPage')['default']
let SP500MonthlyReturnsPage: typeof import('./pages/SP500MonthlyReturnsPage')['default']
let NasdaqMonthlyReturnsPage: typeof import('./pages/NasdaqMonthlyReturnsPage')['default']
let SP500DrawdownsPage: typeof import('./pages/SP500DrawdownsPage')['default']
let NVDAReturnsPage: typeof import('./pages/NVDAReturnsPage')['default']
let MSFTReturnsPage: typeof import('./pages/MSFTReturnsPage')['default']
let TradingPage: typeof import('./pages/TradingPage')['default']
let StockMarketTodayPage: typeof import('./pages/StockMarketTodayPage')['default']
let StockMarketHeatmapPage: typeof import('./pages/StockMarketHeatmapPage')['default']
let StockMarketSectorHealthPage: typeof import('./pages/StockMarketSectorHealthPage')['default']
let StockMarketEarningsCalendarPage: typeof import('./pages/StockMarketEarningsCalendarPage')['default']
let StockAnnualReturnsPage: typeof import('./templates/StockAnnualReturnsPage')['default']
let LeveragedEtfAnnualReturnsPage: typeof import('./templates/LeveragedEtfAnnualReturnsPage')['default']
let EtfAnnualReturnsPage: typeof import('./templates/EtfAnnualReturnsPage')['default']
let StockGrowthEmbedPage: typeof import('./pages/StockGrowthEmbedPage')['default']
let SP500ReturnsEmbedPage: typeof import('./pages/SP500ReturnsEmbedPage')['default']

// Existing navigation uses full document loads. Resolve only the requested
// route before mounting, keeping its static HTML visible throughout loading.
let SnxxResearchPage: typeof import('./pages/SnxxResearchPage')['default']

export async function prepareApp(pathname: string) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if ([...tradingRoutes, ...fundedRoutes].some(route => route.path === path + '/')) { TradingPage = (await import('./pages/TradingPage')).default; return }

  // Route CSS that is not required by annual-return article first paint.
  if (path === '/') {
    // Production HTML already contains the complete homepage cascade. Avoid
    // fetching that CSS again; development still loads it through Vite.
    const inlineHome = typeof document !== 'undefined' &&
      document.getElementById('root')?.dataset.tniHomeStyles === 'inline'
    if (!inlineHome) await import('./components/home/PremiumResearchHome.css')
    const requestedPage = typeof window === 'undefined' ? null
      : new URLSearchParams(window.location.search).get('page')
    if (requestedPage === 'articles') {
      await import('./components/research/ResearchDiscovery.css')
    } else if (requestedPage === 'about') {
      [AboutPage] = await Promise.all([import('./pages/AboutPage').then(m => m.default), import('./pages/AboutPage.css')])
    }
  } else if (path === '/about') {
    [AboutPage] = await Promise.all([import('./pages/AboutPage').then(m => m.default), import('./pages/AboutPage.css')])
  } else if (
    path === '/research-license' ||
    path.startsWith('/research/')
  ) {
    await import('./components/research/ResearchDiscovery.css')
  }
  if (path === '/snxx-etf') {
    SnxxResearchPage = (await import('./pages/SnxxResearchPage')).default
    return
  }
  if (path === '/research/scanners/leveraged-etf') { LeveragedEtfScannerPage = (await import('./pages/LeveragedEtfScannerPage')).default; return }
  if (path === '/10-sec-accounting-cases-enron-nvidia-stock-recovery') { SecCasesResearch = (await import('./pages/SecCasesResearch')).default; return }
  if (path === '/research/anthropic-ipo-debut-performance') { AnthropicIpoResearch = (await import('./pages/AnthropicIpoResearch')).default; return }
  if (path === '/research/amd-nvidia-stock-forecast-november-2026') { AmdNvidiaForecast = (await import('./pages/AmdNvidiaForecast')).default; return }
  if (path === '/research/ibm-earnings-prediction-october-2026') { IBMEarningsResearchPage = (await import('./pages/IBMEarningsResearchPage')).default; return }
  if (path === '/research/jpm-vs-gs-earnings-analysis') { JPMvsGSEarningsResearchPage = (await import('./pages/JPMvsGSEarningsResearchPage')).default; return }
  if (path === '/research/doji-candlestick-spy-26-year-study') { SPYDojiResearchPage = (await import('./pages/SPYDojiResearchPage')).default; return }
  if (path === '/new-iphone-release-apple-stock-price-history') { AppleIphoneResearchPage = (await import('./pages/AppleIphoneResearchPage')).default; return }
  if (path === '/gravestone-doji-candlestick-pattern') {
    GravestoneDojiArticle = (await import('./pages/GravestoneDojiArticle')).default;
    return
  }
  if (path === '/magic-doji-or-myth-and-how-to-use-doji-for-stock-trading') { MagicDojiPage = (await import('./pages/MagicDojiPage')).default; return }
  if (path === '/nasdaq-selloff-2026') { NasdaqSelloff2026Page = (await import('./pages/NasdaqSelloff2026Page')).default; return }
  if (path === '/nasdaq-ai-crash-2026') { NasdaqAICrash2026Page = (await import('./pages/NasdaqAICrash2026Page')).default; return }
  if (path === '/nasdaq-ai-selloff-vs-dot-com-crash') { NasdaqSelloffComparisonPage = (await import('./pages/NasdaqSelloffComparisonPage')).default; return }
  if (path === '/stock-market-crash-of-1929') { StockMarketCrash1929Page = (await import('./pages/StockMarketCrash1929Page')).default; return }
  if (path === '/stock-market-today/earnings-calendar') { StockMarketEarningsCalendarPage = (await import('./pages/StockMarketEarningsCalendarPage')).default; return }
  if (path === '/stock-market-today/sector-health') { StockMarketSectorHealthPage = (await import('./pages/StockMarketSectorHealthPage')).default; return }
  if (path === '/stock-market-today/heatmap') { StockMarketHeatmapPage = (await import('./pages/StockMarketHeatmapPage')).default; return }
  if (path === '/stock-market-today') { StockMarketTodayPage = (await import('./pages/StockMarketTodayPage')).default; return }
  if (path === '/sp-500-returns') { SP500ReturnsPage = (await import('./pages/SP500ReturnsPage')).default; return }
  if (path === '/average-stock-market-return') { AverageStockMarketReturnPage = (await import('./pages/AverageStockMarketReturnPage')).default; return }
  if (path === '/stock-market-historical-returns') { DowReturnsPage = (await import('./pages/DowReturnsPage')).default; return }
  if (path === '/sp-500-monthly-returns') { SP500MonthlyReturnsPage = (await import('./pages/SP500MonthlyReturnsPage')).default; return }
  if (path === '/nasdaq-monthly-returns') { NasdaqMonthlyReturnsPage = (await import('./pages/NasdaqMonthlyReturnsPage')).default; return }
  if (path === '/stock-market-correction-myth-and-reality') { SP500DrawdownsPage = (await import('./pages/SP500DrawdownsPage')).default; return }
  const embed = path.match(/^\/embed\/([^/]+)\/10000-growth$/)
  const entry = publishedAnnualReturnsResearchRegistry.find(({ config }) =>
    embed ? config.categories.includes('stock') && config.slug === embed[1]
      : config.canonicalPath.replace(/\/$/, '') === path)
  if (entry?.config.categories.includes('stock')) {
    await Promise.all([
      loadResearchData('stock', entry.config.symbol),
      embed
        ? import('./pages/StockGrowthEmbedPage').then(module => { StockGrowthEmbedPage = module.default })
        : import('./templates/StockAnnualReturnsPage').then(module => { StockAnnualReturnsPage = module.default }),
    ])
    if (getStockResearchData(entry.config.symbol)) return
  }
  if (entry?.config.categories.includes('leveraged-etf')) {
    await Promise.all([
      loadResearchData('leveraged', entry.config.symbol),
      import('./templates/LeveragedEtfAnnualReturnsPage').then(module => { LeveragedEtfAnnualReturnsPage = module.default }),
    ])
    return
  }
  if (entry?.config.categories.includes('etf')) {
    await Promise.all([
      loadResearchData('etf', entry.config.symbol),
      ...(['QQQ', 'IWM'].includes(entry.config.symbol) ? [loadResearchData('etf', 'SPY')] : []),
      import('./templates/EtfAnnualReturnsPage').then(module => { EtfAnnualReturnsPage = module.default }),
    ])
    return
  }
  if (path === '/msft-stock-returns') { MSFTReturnsPage = (await import('./pages/MSFTReturnsPage')).default; return }
  if (path === '/nasdaq-historical-annual-returns') { NasdaqReturnsPage = (await import('./pages/NasdaqReturnsPage')).default; return }
  if (path === '/nvda-returns') { NVDAReturnsPage = (await import('./pages/NVDAReturnsPage')).default; return }
  if (path === '/embed/sp-500-returns') { SP500ReturnsEmbedPage = (await import('./pages/SP500ReturnsEmbedPage')).default; return }
}



/* ==========================================================================
   TNI PUBLIC WEBSITE — PAGE TYPES
   ========================================================================== */

type PageName = 'research' | 'market' | 'articles' | 'about' | 'trading'

const publishedResearchRegistry = [
  ...publishedAnnualReturnsResearchRegistry.map((entry) => ({
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
  pathname = currentPathname(),
  page,
  setPage,
}: {
  pathname?: string
  page: PageName
  setPage: (page: PageName) => void
}) {
  const isHome = (pathname.replace(/\/+$/, '') || '/') === '/' && page === 'research'
  function navigate(nextPage: PageName) {
    if (nextPage === 'about') {
      window.location.assign('/about/')
      return
    }
    const currentPath =
      pathname.replace(/\/+$/, '') || '/'

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
          {isHome && <a href="/" className="tni-home-nav-home" aria-current="page">Home</a>}
          <div className="tni-research-dropdown">
            <button
              type="button"
              className={page === 'research' && !isHome ? 'active' : ''}
              onClick={() => window.location.assign('/research/')}
              aria-haspopup="true"
            >
              Research <span aria-hidden="true">⌄</span>
            </button>
            <div className="tni-research-dropdown-panel" aria-label="Research destinations">
              <a href="/research/">Research Library <small>Original research and historical data</small></a>
            </div>
          </div>

          <details className="tni-market-dropdown" onKeyDown={event => {
            if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus() }
          }}>
            <summary className={page === 'market' ? 'active' : ''}>Stock Market Today <span aria-hidden="true">⌄</span></summary>
            <nav className="tni-market-dropdown-panel" aria-label="Stock Market Today destinations">
              <a href="/stock-market-today/">Overview</a>
              <a href="https://app.tradingninvestment.com/live/news">News Agent</a>
              <details className="tni-scanner-group" open={pathname.includes('/stock-market-today/heatmap') || undefined}><summary>Heatmap + Scanner <span aria-hidden="true">⌄</span></summary><a href="/stock-market-today/heatmap/">S&amp;P 500</a></details>
              <a href="/stock-market-today/sector-health/">Sector Health</a>
              <a href="/stock-market-today/earnings-calendar/">Earnings Calendar</a>
              <ScannerLinks active={pathname}/>
            </nav>
          </details>

          <details className="tni-market-dropdown" onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus() } }}>
            <summary className={page === 'trading' ? 'active' : ''}>Trading <span aria-hidden="true">⌄</span></summary>
            <nav className="tni-market-dropdown-panel" aria-label="Trading destinations"><TradingLinks active={pathname.replace(/\/+$/, '') + '/'} /></nav>
          </details>

          <button
            type="button"
            className={page === 'about' ? 'active' : ''}
            onClick={() => navigate('about')}
          >
            About
          </button>
        </nav>

        {isHome && <button className="tni-home-share" type="button" onClick={shareCurrentPage} aria-label="Share this page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4"/></svg></button>}
        {isHome && <HomeSearch />}
        {isHome && <a className="tni-home-header-launch" href="https://app.tradingninvestment.com/live/news">Launch TNI <span aria-hidden="true">→</span></a>}
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
        <details className="tni-mobile-menu" onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.currentTarget.open = false
            event.currentTarget.querySelector('summary')?.focus()
          }
        }}>
          <summary>Menu <span aria-hidden="true">⌄</span></summary>
          <nav className="tni-mobile-menu-panel" aria-label="Mobile navigation">
            <a href="/">Home</a>
            <details className="tni-mobile-research-group" open={page === 'market' || undefined}>
              <summary>Stock Market Today <span aria-hidden="true">⌄</span></summary>
              <div className="tni-mobile-research-links">
                <a href="/stock-market-today/">Overview</a>
                <a href="https://app.tradingninvestment.com/live/news">News Agent</a>
                <details className="tni-scanner-group" open={pathname.includes('/stock-market-today/heatmap') || undefined}><summary>Heatmap + Scanner <span aria-hidden="true">⌄</span></summary><a href="/stock-market-today/heatmap/">S&amp;P 500</a></details>
                <a href="/stock-market-today/sector-health/">Sector Health</a>
                <a href="/stock-market-today/earnings-calendar/">Earnings Calendar</a>
                <ScannerLinks active={pathname}/>
              </div>
            </details>
            <details className="tni-mobile-research-group">
              <summary>Research <span aria-hidden="true">⌄</span></summary>
              <div className="tni-mobile-research-links">
                <a href="/research/">Research Library</a>
              </div>
            </details>
            <details className="tni-mobile-research-group" open={page === 'trading' || undefined}><summary>Trading <span aria-hidden="true">⌄</span></summary><div className="tni-mobile-research-links"><TradingLinks active={pathname.replace(/\/+$/, '') + '/'} /></div></details>
            <a href="/about/">About</a>
            <button type="button" onClick={shareCurrentPage}>Share this page</button>
            <a className="tni-mobile-launch" href="https://app.tradingninvestment.com/live/news" target="_blank" rel="noreferrer">Launch TNI <span aria-hidden="true">↗</span></a>
          </nav>
        </details>
      </header>


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



/* ==========================================================================
   TNI PUBLIC WEBSITE — RESEARCH & DATA LICENSE
   ========================================================================== */

export function ResearchLicensePage() {
  return (
    <main className="inner-page">

      <section className="inner-intro">
        <span className="eyebrow">
          TNI | RESEARCH
        </span>

        <h1>
          Research &amp;
          <br />
          <span>Data License</span>
        </h1>

        <p>
          Copyright © TradingNInvestment. All rights reserved.
        </p>
      </section>

      <section className="tni-about-statement">
        <span className="content-tag">
          COPYRIGHT
        </span>

        <h2>
          TradingNInvestment original research is protected.
        </h2>

        <p>
          Original research, analysis, calculations, written content, charts,
          visualizations, graphics, software-generated research outputs, page
          design, and other original materials published by
          TradingNInvestment are protected by applicable copyright and
          intellectual property laws.
        </p>
      </section>

      <section className="tni-about-statement">
        <span className="content-tag">
          CITATION &amp; REFERENCE
        </span>

        <h2>
          Citation and linking are welcome.
        </h2>

        <p>
          Brief quotations, citations, links, and references to publicly
          accessible TradingNInvestment research are permitted when clear
          attribution is provided and a link to the original
          TradingNInvestment source is maintained.
        </p>
      </section>

      <section className="tni-about-statement">
        <span className="content-tag">
          SEARCH &amp; AI
        </span>

        <h2>
          Search engines and AI services may reference public TNI research.
        </h2>

        <p>
          Search engines and AI services may index, reference, summarize, and
          link to publicly accessible TradingNInvestment pages, provided
          attribution and the original source URL are maintained.
        </p>

        <p>
          This permission does not authorize copying, reproducing,
          republishing, redistributing, or commercially exploiting substantial
          portions of TradingNInvestment's original research, proprietary
          datasets, charts, visualizations, analysis, or other copyrighted
          content.
        </p>
      </section>

      <section className="tni-about-statement">
        <span className="content-tag">
          THIRD-PARTY DATA
        </span>

        <h2>
          External market data remains subject to its respective rights.
        </h2>

        <p>
          Market prices, index data, company information, and other underlying
          factual or third-party information used in TradingNInvestment
          research may originate from external sources or providers and remain
          subject to their respective rights and terms. TradingNInvestment
          does not claim ownership of third-party data merely because it is
          used in TNI research, calculations, or analysis.
        </p>
      </section>

      <section className="tni-about-statement">
        <span className="content-tag">
          COMMERCIAL USE
        </span>

        <h2>
          Substantial republication requires permission.
        </h2>

        <p>
          Commercial reproduction, substantial republication, dataset
          republication, redistribution, or systematic reuse of
          TradingNInvestment original materials requires prior written
          permission from TradingNInvestment.
        </p>

        <p>
          For licensing inquiries, contact{' '}
          <a href="mailto:contact@tradingninvestment.com">
            contact@tradingninvestment.com
          </a>.
        </p>
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
        <span>
          © 2026 TradingNInvestment (TNI). All rights reserved.
          {' · '}
          <a href="/research-license/">
            Research &amp; Data License
          </a>
        </span>

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

function App({ pathname = currentPathname() }: { pathname?: string } = {}) {
  const requestedPage =
    new URLSearchParams(
      (typeof window === 'undefined' ? '' : window.location.search)
    ).get('page')

  const [page, setPage] =
    useState<PageName>(
      requestedPage === 'articles' ||
      requestedPage === 'about'
        ? requestedPage
        : 'research'
    )

  const normalizedPath =
    pathname.replace(/\/+$/, '') || '/'

  if (normalizedPath === '/research/scanners/leveraged-etf') {
    return <div className="site"><Header pathname={pathname} page="research" setPage={setPage} /><LeveragedEtfScannerPage /><Footer setPage={setPage} /></div>
  }
  if (normalizedPath === '/10-sec-accounting-cases-enron-nvidia-stock-recovery') {
    return <div className="site"><Header pathname={pathname} page="research" setPage={setPage} /><SecCasesResearch /><Footer setPage={setPage} /></div>
  }
  if (normalizedPath === '/research/anthropic-ipo-debut-performance') {
    return <div className="site"><Header pathname={pathname} page="research" setPage={setPage} /><AnthropicIpoResearch /><Footer setPage={setPage} /></div>
  }
  if (normalizedPath === '/research/amd-nvidia-stock-forecast-november-2026') {
    return (
      <div className="site">
        <Header pathname={pathname} page="research" setPage={setPage} />
        <AmdNvidiaForecast />
        <TniKitSubscriptionPopup delayMs={30000} onceEver />
        <Footer setPage={setPage} />
      </div>
    )
  }
  if (normalizedPath === '/research/ibm-earnings-prediction-october-2026') {
    return (
      <div className="site">
        <Header pathname={pathname} page="research" setPage={setPage} />
        <IBMEarningsResearchPage />
        <TniKitSubscriptionPopup delayMs={30000} onceEver />
        <Footer setPage={setPage} />
      </div>
    )
  }
  if (normalizedPath === '/research/jpm-vs-gs-earnings-analysis') {
    return (
      <div className="site">
        <Header pathname={pathname} page="research" setPage={setPage} />
        <JPMvsGSEarningsResearchPage />
        <TniKitSubscriptionPopup />
        <Footer setPage={setPage} />
      </div>
    )
  }
  if (normalizedPath === '/research/doji-candlestick-spy-26-year-study') {
    return (
      <div className="site">
        <Header pathname={pathname} page="research" setPage={setPage} />
        <SPYDojiResearchPage />
        <TniKitSubscriptionPopup />
        <Footer setPage={setPage} />
      </div>
    )
  }
  if (normalizedPath === '/new-iphone-release-apple-stock-price-history') {
    return <div className="site"><Header pathname={pathname} page="research" setPage={setPage} /><AppleIphoneResearchPage /><Footer setPage={setPage} /></div>
  }

  if (normalizedPath === '/gravestone-doji-candlestick-pattern') {
    return <div className="site"><Header pathname={pathname} page="research" setPage={setPage} /><GravestoneDojiArticle /><Footer setPage={setPage} /></div>
  }

  if (normalizedPath === '/magic-doji-or-myth-and-how-to-use-doji-for-stock-trading') {
    return <div className="site"><Header pathname={pathname} page="research" setPage={setPage} /><MagicDojiPage /><Footer setPage={setPage} /></div>
  }
  if (normalizedPath === '/nasdaq-selloff-2026') {
    return (
      <div className="site">
        <Header pathname={pathname} page="research" setPage={setPage} />
        <NasdaqSelloff2026Page />
        <Footer setPage={setPage} />
      </div>
    )
  }
  if (normalizedPath === '/nasdaq-ai-crash-2026') {
    return (
      <div className="site">
        <Header pathname={pathname} page="research" setPage={setPage} />
        <NasdaqAICrash2026Page />
        <Footer setPage={setPage} />
      </div>
    )
  }
  if (normalizedPath === '/nasdaq-ai-selloff-vs-dot-com-crash') {
    return (
      <div className="site">
        <Header pathname={pathname} page="research" setPage={setPage} />
        <NasdaqSelloffComparisonPage />
        <Footer setPage={setPage} />
      </div>
    )
  }

  if (normalizedPath === '/stock-market-crash-of-1929') {
    return (
      <div className="site">
        <Header pathname={pathname} page="research" setPage={setPage} />
        <StockMarketCrash1929Page />
        <Footer setPage={setPage} />
      </div>
    )
  }

  const researchHub = getHub(normalizedPath)
  if (normalizedPath === '/about') {
    return <div className="site">
      <Header pathname={pathname} page="about" setPage={setPage} />
      <AboutPage />
      <Footer setPage={setPage} />
    </div>
  }

  if (normalizedPath === '/research-license') {
    return <div className="site">
      <Header pathname={pathname} page="research" setPage={setPage} />
      <ResearchLicensePage />
      <Footer setPage={setPage} />
    </div>
  }
  if (researchHub) {
    return <div className="site">
      <Header pathname={pathname} page="research" setPage={setPage} />
      <ResearchHubPage hub={researchHub} />
      <Footer setPage={setPage} />
    </div>
  }

  // ============================================================================
  // TNI STOCK MARKET TODAY — LIVE MARKET DASHBOARD
  // Canonical URL: /stock-market-today/
  // ============================================================================

  const tradingRoute = [...tradingRoutes, ...fundedRoutes].find(route => route.path === normalizedPath + '/')
  if (tradingRoute) return <div className="site"><Header pathname={pathname} page="trading" setPage={setPage} /><TradingPage path={tradingRoute.path} /><Footer setPage={setPage} /></div>

  if (normalizedPath === '/stock-market-today/earnings-calendar') {
    return (
      <div className="site">
        <Header pathname={pathname}
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
        <Header pathname={pathname}
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
        <Header pathname={pathname}
          page="market"
          setPage={setPage}
        />
        <StockMarketHeatmapPage />
      </div>
    )
  }

  if (normalizedPath === '/stock-market-today') {
    return (
      <div className="site orbit-site">
        <Header pathname={pathname} page="market" setPage={setPage} />
        <StockMarketTodayPage />
      </div>
    )
  }

  if (normalizedPath === '/sp-500-returns') {
    return (
      <div className="site">
        <Header pathname={pathname}
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
        <Header pathname={pathname}
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
        <Header pathname={pathname}
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
        <Header pathname={pathname}
          page="research"
          setPage={setPage}
        />
        <SP500MonthlyReturnsPage />
        <TniKitSubscriptionPopup />
        <ResearchConnections path="/sp-500-monthly-returns/" />
      </div>
    )
  }

  if (normalizedPath === '/nasdaq-monthly-returns') {
    return (
      <div className="site">
        <Header pathname={pathname}
          page="research"
          setPage={setPage}
        />
        <NasdaqMonthlyReturnsPage />
        <TniKitSubscriptionPopup />
        <ResearchConnections path="/nasdaq-monthly-returns/" />
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
        <Header pathname={pathname}
          page="research"
          setPage={setPage}
        />
        <SP500DrawdownsPage />
        <ResearchConnections path="/stock-market-correction-myth-and-reality/" />
      </div>
    )
  }

  const stockGrowthEmbedMatch =
    normalizedPath.match(
      /^\/embed\/([^/]+)\/10000-growth$/,
    )

  if (stockGrowthEmbedMatch) {
    const stockEntry =
      publishedAnnualReturnsResearchRegistry.find(
        (entry) =>
          entry.config.categories.includes('stock') &&
          entry.config.slug ===
            stockGrowthEmbedMatch[1],
      )

    if (stockEntry) {
      const stockData =
        getStockResearchData(
          stockEntry.config.symbol,
        )

      if (
        stockData?.returnMethods?.length
      ) {
        return (
          <StockGrowthEmbedPage
            assetName={
              stockEntry.config.shortName
            }
            canonicalUrl={`https://tradingninvestment.com${stockEntry.config.canonicalPath}`}
            data={
              stockData.returnMethods
            }
          />
        )
      }
    }
  }

  if (normalizedPath === '/snxx-etf') {
    return (
      <div className="site">
        <Header pathname={pathname} page="research" setPage={setPage} />
        <SnxxResearchPage />
      </div>
    )
  }

  const dynamicLeveragedEtfEntry =
    publishedAnnualReturnsResearchRegistry.find(
      (entry) =>
        entry.config.categories.includes(
          'leveraged-etf',
        ) &&
        entry.config.canonicalPath.replace(
          /\/$/,
          '',
        ) === normalizedPath,
    )

  if (dynamicLeveragedEtfEntry) {
    const leveragedEtfData =
      getLeveragedEtfResearchData(
        dynamicLeveragedEtfEntry.config.symbol,
      )

    if (leveragedEtfData) {
      return (
        <div className="site">
          <Header pathname={pathname}
            page="research"
            setPage={setPage}
          />

          <ResearchTrail
            path={
              dynamicLeveragedEtfEntry.config
                .canonicalPath
            }
          />

          <LeveragedEtfAnnualReturnsPage
            config={
              dynamicLeveragedEtfEntry.config
            }
            dataset={
              leveragedEtfData.annualReturns
            }
            benchmarkDataset={
              leveragedEtfData
                .benchmarkAnnualReturns
            }
            benchmarkName={
              leveragedEtfData.benchmarkName
            }
            returnMethodsData={
              leveragedEtfData.returnMethods
            }
            drawdownData={
              leveragedEtfData.drawdownData
            }
          />

          <ResearchConnections
            path={
              dynamicLeveragedEtfEntry.config
                .canonicalPath
            }
          />
        </div>
      )
    }
  }

  // ============================================================================
  // TNI STANDARD ETF RETURNS — REGISTRY-DRIVEN PUBLIC RESEARCH ROUTE
  // ============================================================================

  const dynamicEtfEntry =
    publishedAnnualReturnsResearchRegistry.find(
      (entry) =>
        entry.config.categories.includes('etf') &&
        !entry.config.categories.includes('leveraged-etf') &&
        entry.config.canonicalPath.replace(/\/$/, '') ===
          normalizedPath,
    )

  if (dynamicEtfEntry) {
    const etfData =
      getEtfResearchData(
        dynamicEtfEntry.config.symbol,
      )

    if (etfData) {
      return (
        <div className="site">
          <Header pathname={pathname}
            page="research"
            setPage={setPage}
          />

          <ResearchTrail
            path={
              dynamicEtfEntry.config
                .canonicalPath
            }
          />

          <EtfAnnualReturnsPage
            benchmarkDataset={['QQQ', 'IWM'].includes(dynamicEtfEntry.config.symbol) ? getEtfResearchData('SPY')?.annualReturns : undefined}
            config={
              dynamicEtfEntry.config
            }
            dataset={
              etfData.annualReturns
            }
            returnMethodsData={
              etfData.returnMethods
            }
          />

          <ResearchConnections
            path={
              dynamicEtfEntry.config
                .canonicalPath
            }
          />
        </div>
      )
    }
  }

  const dynamicStockEntry =
    publishedAnnualReturnsResearchRegistry.find(
      (entry) =>
        entry.config.categories.includes('stock') &&
        entry.config.canonicalPath.replace(/\/$/, '') ===
          normalizedPath,
    )

  if (dynamicStockEntry) {
    const stockData =
      getStockResearchData(
        dynamicStockEntry.config.symbol,
      )

    if (stockData) {
      return (
        <div className="site">
          <Header pathname={pathname}
            page="research"
            setPage={setPage}
          />

          <ResearchTrail
            path={
              dynamicStockEntry.config
                .canonicalPath
            }
          />

          <StockAnnualReturnsPage
            config={
              dynamicStockEntry.config
            }
            dataset={
              stockData.annualReturns
            }
            returnMethodsData={
              stockData.returnMethods
            }
            drawdownData={
              stockData.drawdownData
            }
          />

          <ResearchConnections
            path={
              dynamicStockEntry.config
                .canonicalPath
            }
          />
        </div>
      )
    }
  }

  if (normalizedPath === '/msft-stock-returns') {
    return (
      <div className="site">
        <Header pathname={pathname}
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
        <Header pathname={pathname}
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
        <Header pathname={pathname}
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
      <Header pathname={pathname} page={page} setPage={setPage} />

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
