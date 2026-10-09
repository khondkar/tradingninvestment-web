import { useEffect } from 'react'
import MarketBreadthDonut, { MarketOrbitNavigation } from '../components/market/MarketBreadthDonut'

import '../components/market/StockMarketToday.css'

import {
  useMarketTodaySnapshot,
} from '../hooks/useMarketTodaySnapshot'

function formatUpdatedTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Latest market snapshot'
  }

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

export default function StockMarketTodayPage() {
  const snapshot = useMarketTodaySnapshot()
  useEffect(() => {
    const title =
      'Stock Market Today: S&P 500, Stock Movers & Market Trends | TradingNInvestment'

    const description =
      'Follow the stock market today with S&P 500 performance, major market indexes, top stock gainers and losers, market breadth, S&P 500 heatmap, sector performance and upcoming earnings.'

    const canonicalUrl =
      'https://tradingninvestment.com/stock-market-today/'

    document.title = title

    let descriptionMeta =
      document.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      )

    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta')
      descriptionMeta.name = 'description'
      document.head.appendChild(descriptionMeta)
    }

    descriptionMeta.content = description

    let canonical =
      document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      )

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }

    canonical.href = canonicalUrl

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Stock Market Today',
      headline:
        'Stock Market Today: S&P 500 Performance, Stock Movers and Market Trends',
      description,
      url: canonicalUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: 'TradingNInvestment',
        url: 'https://tradingninvestment.com/',
      },
      about: [
        {
          '@type': 'Thing',
          name: 'S&P 500',
        },
        {
          '@type': 'Thing',
          name: 'U.S. stock market',
        },
        {
          '@type': 'Thing',
          name: 'Stock market performance',
        },
        {
          '@type': 'Thing',
          name: 'Market breadth',
        },
        {
          '@type': 'Thing',
          name: 'Stock market sectors',
        },
        {
          '@type': 'Thing',
          name: 'Corporate earnings',
        },
      ],
      mainEntity: {
        '@type': 'ItemList',
        name: 'Stock Market Today Research Tools',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Stock Market Today Overview',
            url: canonicalUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'S&P 500 Stock Market Heatmap',
            url:
              'https://tradingninvestment.com/stock-market-today/heatmap/',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'S&P 500 Sector Health',
            url:
              'https://tradingninvestment.com/stock-market-today/sector-health/',
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'S&P 500 Earnings Calendar',
            url:
              'https://tradingninvestment.com/stock-market-today/earnings-calendar/',
          },
        ],
      },
    }

    const scriptId =
      'stock-market-today-structured-data'

    let script =
      document.getElementById(
        scriptId,
      ) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }

    script.textContent =
      JSON.stringify(structuredData)

    return () => {
      document
        .getElementById(scriptId)
        ?.remove()
    }
  }, [])

  const updatedTime = formatUpdatedTime(
    snapshot.generated_at_utc,
  )

  const snapshotAge = Date.now() - new Date(snapshot.generated_at_utc).getTime()
  const stale = !Number.isFinite(snapshotAge) || snapshotAge > 30 * 60 * 1000
  const marketIsOpen = !stale && snapshot.market_status.toLowerCase() === 'open'

  return (
    <>
      <MarketOrbitNavigation />

      <main className="market-today-page orbit-page">
        <section
          className="market-today-hero"
          id="overview"
        >
          <span className="market-eyebrow">
            TNI MARKET INTELLIGENCE
          </span>

          <h1>Stock Market Today</h1>

          <p>
            Track major U.S. market benchmarks, sector leadership,
            earnings events, and the strongest and weakest stocks
            in the S&amp;P 500.
          </p>

          <div className="market-update-status">
            <span
              className={
                marketIsOpen
                  ? 'market-live-dot'
                  : 'market-live-dot market-live-dot-closed'
              }
            />

            {stale ? 'SAVED SNAPSHOT' : marketIsOpen ? 'MARKET OPEN' : snapshot.market_status.replaceAll('_', ' ').toUpperCase()}

            <span>·</span>

            Updated {updatedTime}

            <span>·</span>

            {snapshot.coverage.successful}/
            {snapshot.coverage.expected} stocks
          </div>
        </section>

        <MarketBreadthDonut snapshot={snapshot} />

        <section
          className="market-overview-explainer"
          aria-labelledby="market-overview-explainer-title"
        >
          <h2 id="market-overview-explainer-title">
            Today&apos;s Stock Market at a Glance
          </h2>

          <p>
            The Stock Market Today overview brings together major U.S.
            market indexes, S&amp;P 500 top gainers and losers, and
            market breadth to provide a quick view of how the stock
            market is performing today. Follow SPY, QQQ, DIA and IWM
            alongside the VIX to compare large-cap, technology,
            blue-chip and small-cap market performance and current
            market volatility.
          </p>

          <p>
            S&amp;P 500 stock movers show where the largest daily price
            changes are occurring, while advancing and declining stocks
            show whether market strength or weakness is broadly
            distributed. For deeper analysis, explore the{' '}
            <a href="/stock-market-today/heatmap/">
              S&amp;P 500 heatmap
            </a>
            ,{' '}
            <a href="/stock-market-today/sector-health/">
              sector performance
            </a>
            {' '}and the{' '}
            <a href="/stock-market-today/earnings-calendar/">
              earnings calendar
            </a>.
          </p>
        </section>

        <section
          className="market-today-seo"
          aria-labelledby="market-today-guide-title"
        >
          <div className="market-today-seo-intro">
            <span className="market-seo-eyebrow">
              TNI MARKET GUIDE
            </span>

            <h2 id="market-today-guide-title">
              Stock Market Today: S&amp;P 500 Performance,
              Stock Movers and Market Trends
            </h2>

            <p>
              TradingNInvestment&apos;s Stock Market Today provides a
              data-driven view of today&apos;s U.S. stock market.
              Follow S&amp;P 500 performance, major market indexes,
              top stock gainers and losers, market breadth and sector
              performance to understand where strength and weakness
              are developing across the market.
            </p>

            <p>
              The goal is to answer three practical questions: How is
              the stock market performing today? Which stocks and
              sectors are moving? What market information may help
              explain those moves?
            </p>
          </div>

          <article className="market-seo-block">
            <h3>Major Market Index Performance Today</h3>

            <p>
              The Stock Market Today overview provides a snapshot of
              major U.S. market benchmarks, including the S&amp;P 500,
              Nasdaq-100, Dow Jones Industrial Average and Russell 2000,
              together with market volatility.
            </p>

            <p>
              Tracking SPY, QQQ, DIA and IWM provides context for
              large-cap stocks, technology-heavy equities, blue-chip
              companies and small-cap stocks. The VIX provides an
              additional measure of expected stock market volatility.
              Together, these indicators provide a quick view of U.S.
              stock market performance today.
            </p>
          </article>

          <article className="market-seo-block">
            <h3>Top Stock Gainers and Losers Today</h3>

            <p>
              The top gainers and losers section highlights S&amp;P 500
              stocks experiencing some of the largest daily price
              changes. This provides a fast way to find stocks moving
              today, including the day&apos;s biggest stock movers,
              S&amp;P 500 gainers and S&amp;P 500 losers.
            </p>

            <p>
              Large stock movements can occur around earnings reports,
              company announcements, industry developments and broader
              market conditions. Identifying the largest movers
              provides a starting point for investigating unusual
              market activity.
            </p>
          </article>

          <article className="market-seo-block">
            <h3>
              Stock Market Breadth: Advancing and Declining Stocks
            </h3>

            <p>
              Market breadth compares advancing stocks and declining
              stocks across the market. An index can rise even when
              many individual companies are falling, so breadth helps
              show how widely a market move is being supported.
            </p>

            <p>
              TNI&apos;s market breadth data shows whether daily market
              strength or weakness is occurring across a large portion
              of the S&amp;P 500 or is concentrated among fewer
              companies.
            </p>
          </article>

          <article className="market-seo-block">
            <h3>
              <a href="/stock-market-today/heatmap/">
                S&amp;P 500 Stock Market Heatmap
              </a>
            </h3>

            <p>
              The S&amp;P 500 Stock Market Heatmap provides a visual
              view of daily performance across S&amp;P 500 companies.
              Stocks are organized by market sector, while color
              represents positive and negative daily stock performance.
              Cell sizing emphasizes the magnitude of price movement
              within each sector.
            </p>

            <p>
              The sector heatmap makes it easier to scan hundreds of
              S&amp;P 500 stocks and identify stock market movers,
              market leaders, market laggards and areas of significant
              daily price movement.
            </p>

            <a
              className="market-seo-link"
              href="/stock-market-today/heatmap/"
            >
              Explore the S&amp;P 500 Stock Market Heatmap →
            </a>
          </article>

          <article className="market-seo-block">
            <h3>
              <a href="/stock-market-today/sector-health/">
                S&amp;P 500 Sector Performance and Sector Health
              </a>
            </h3>

            <p>
              Sector Health compares performance across the 11 major
              S&amp;P 500 sectors: Information Technology, Financials,
              Health Care, Consumer Discretionary, Communication
              Services, Industrials, Consumer Staples, Energy,
              Utilities, Real Estate and Materials.
            </p>

            <p>
              TNI tracks sector performance across daily, weekly,
              monthly and year-to-date periods. These time horizons
              help identify market leadership, stronger and weaker
              performing sectors, broader sector trends and changes
              in sector rotation.
            </p>

            <a
              className="market-seo-link"
              href="/stock-market-today/sector-health/"
            >
              Explore S&amp;P 500 Sector Performance →
            </a>
          </article>

          <article className="market-seo-block">
            <h3>
              <a href="/stock-market-today/earnings-calendar/">
                Earnings Calendar: Earnings Today and This Week
              </a>
            </h3>

            <p>
              The Earnings Calendar tracks upcoming earnings reports
              for S&amp;P 500 companies. Review companies reporting
              earnings, upcoming earnings dates, reporting times and
              available EPS estimates to find earnings today, earnings
              this week and upcoming earnings reports.
            </p>

            <p>
              Selecting a company can connect the earnings event with
              TNI News Intelligence, including relevant company news,
              market impact, direction and confidence information when
              available.
            </p>

            <a
              className="market-seo-link"
              href="/stock-market-today/earnings-calendar/"
            >
              Explore the Earnings Calendar →
            </a>
          </article>

          <article className="market-seo-block market-seo-conclusion">
            <h3>
              Understanding What&apos;s Moving the Stock Market Today
            </h3>

            <p>
              No single market indicator explains the entire trading
              day. An index can move because of broad participation,
              a small group of large companies, sector-specific
              developments, company earnings or broader market
              conditions.
            </p>

            <p>
              TradingNInvestment combines major market indexes,
              S&amp;P 500 gainers and losers, market breadth, the stock
              market heatmap, sector performance, the earnings calendar
              and TNI intelligence to provide multiple views of
              today&apos;s market in one research workflow.
            </p>

            <p>
              The purpose is to move from a broad question — what is
              the stock market doing today? — toward more specific
              questions about which stocks are moving, which sectors
              are leading or lagging, and what information may be
              associated with those movements.
            </p>
          </article>
        </section>

      </main>
    </>
  )
}
