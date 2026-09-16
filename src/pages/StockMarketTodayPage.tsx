import '../components/market/StockMarketToday.css'

import marketSnapshot from '../data/market-today/snapshot.json'

type MarketRecord = {
  ticker: string
  yahoo_symbol: string
  company: string
  sector: string
  industry: string
  price: number
  previous_close: number
  change: number
  change_pct: number
  price_source: string
  price_timestamp: string | null
  previous_close_date: string | null
}

type Benchmark = {
  symbol: string
  name: string
  available: boolean
  price?: number
  previous_close?: number
  change?: number
  change_pct?: number
  price_source?: string
  price_timestamp?: string | null
  error?: string
}

type SectorHealth = {
  sector: string
  stocks: number
  advancing: number
  declining: number
  unchanged: number
  positive_pct: number
  negative_pct: number
  average_change_pct: number
  median_change_pct: number
  health: string
}

type MarketSnapshot = {
  generated_at_utc: string
  generated_at_et: string
  market_status: string
  coverage: {
    expected: number
    successful: number
    failed: number
    pct: number
  }
  benchmarks: Benchmark[]
  breadth: {
    advancing: number
    declining: number
    unchanged: number
    total: number
    positive_pct: number
    negative_pct: number
  }
  sectors: SectorHealth[]
  gainers: MarketRecord[]
  decliners: MarketRecord[]
  constituents: MarketRecord[]
}

const snapshot = marketSnapshot as MarketSnapshot

function formatSignedPercent(value: number) {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatUpdatedTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Latest market snapshot'
  }

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

function MoversCard({
  title,
  movers,
  direction,
}: {
  title: string
  movers: MarketRecord[]
  direction: 'up' | 'down'
}) {
  return (
    <section className={`movers-card movers-card-${direction}`}>
      <div className="movers-card-header">
        <div>
          <span className="movers-kicker">
            {direction === 'up' ? '▲ LEADERS' : '▼ LAGGARDS'}
          </span>

          <h2>{title}</h2>
        </div>

        <span className="movers-period">TODAY</span>
      </div>

      <div className="movers-column-labels">
        <span>STOCK</span>
        <span>PRICE</span>
        <span>MOVE</span>
      </div>

      <div className="movers-list">
        {movers.map((stock, index) => (
          <article className="mover-row" key={stock.ticker}>
            <span className="mover-rank">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="mover-logo" aria-hidden="true">
              {stock.ticker.slice(0, 1)}
            </div>

            <div className="mover-identity">
              <strong>{stock.ticker}</strong>
              <span>{stock.company}</span>
              <small>{stock.sector}</small>
            </div>

            <div className="mover-price">
              ${formatPrice(stock.price)}
            </div>

            <div className={`mover-change ${direction}`}>
              {formatSignedPercent(stock.change_pct)}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}



export default function StockMarketTodayPage() {
  const updatedTime = formatUpdatedTime(
    snapshot.generated_at_utc,
  )

  const marketIsOpen =
    snapshot.market_status.toLowerCase() === 'open'

  return (
    <>
      <nav
        className="market-today-subnav"
        aria-label="Stock Market Today"
      >
        <a
          href="/stock-market-today/"
          className="active"
          aria-current="page"
        >
          Overview
        </a>

        <a href="/stock-market-today/heatmap/">
          Heatmap
        </a>

        <a href="/stock-market-today/sector-health/">
          Sector Health
        </a>

        <a href="/stock-market-today/earnings-calendar/">
          Earnings Calendar
        </a>
      </nav>

      <main className="market-today-page">
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

            {marketIsOpen
              ? 'MARKET OPEN'
              : 'MARKET CLOSED'}

            <span>·</span>

            Updated {updatedTime}

            <span>·</span>

            {snapshot.coverage.successful}/
            {snapshot.coverage.expected} stocks
          </div>
        </section>

        <section
          className="market-index-strip"
          aria-label="Major market benchmarks"
        >
          {snapshot.benchmarks.map((benchmark) => {
            const change =
              benchmark.change_pct ?? 0

            return (
              <div
                className="market-index-card"
                key={benchmark.symbol}
              >
                <span>
                  {benchmark.name}
                </span>

                <strong>
                  {benchmark.symbol}
                </strong>

                {benchmark.available &&
                benchmark.price !== undefined ? (
                  <>
                    <b
                      className={
                        change > 0
                          ? 'positive'
                          : change < 0
                            ? 'negative'
                            : 'neutral'
                      }
                    >
                      {benchmark.symbol === 'VIX'
                        ? formatPrice(
                            benchmark.price,
                          )
                        : formatSignedPercent(
                            change,
                          )}
                    </b>

                    <small className="market-index-detail">
                      {benchmark.symbol === 'VIX'
                        ? formatSignedPercent(
                            change,
                          )
                        : `$${formatPrice(
                            benchmark.price,
                          )}`}
                    </small>
                  </>
                ) : (
                  <b className="neutral">
                    N/A
                  </b>
                )}
              </div>
            )
          })}
        </section>

        <section
          className="top-movers-intro"
          id="top-movers"
        >
          <span>
            S&amp;P 500 · DAILY PERFORMANCE
          </span>

          <h2>
            S&amp;P 500 Top Movers Today
          </h2>

          <p>
            The 10 strongest and 10 weakest S&amp;P 500 stocks
            by daily percentage change.
          </p>
        </section>

        <div className="top-movers-grid">
          <MoversCard
            title="Top 10 Gainers"
            movers={snapshot.gainers}
            direction="up"
          />

          <MoversCard
            title="Top 10 Decliners"
            movers={snapshot.decliners}
            direction="down"
          />
        </div>


        <section
          className="market-breadth"
          id="market-breadth"
        >
          <div>
            <span>MARKET BREADTH</span>
            <strong className="positive">
              {snapshot.breadth.advancing}
            </strong>
            <small>Advancing</small>
          </div>

          <div>
            <span>&nbsp;</span>
            <strong className="negative">
              {snapshot.breadth.declining}
            </strong>
            <small>Declining</small>
          </div>

          <div>
            <span>&nbsp;</span>
            <strong>
              {snapshot.breadth.unchanged}
            </strong>
            <small>Unchanged</small>
          </div>

          <div className="breadth-highlight">
            <span>S&amp;P 500 PARTICIPATION</span>

            <strong
              className={
                snapshot.breadth.positive_pct >= 50
                  ? 'positive'
                  : 'negative'
              }
            >
              {snapshot.breadth.positive_pct.toFixed(1)}%
            </strong>

            <small>Stocks higher today</small>
          </div>
        </section>

      </main>
    </>
  )
}
