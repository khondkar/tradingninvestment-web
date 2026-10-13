import SP500DailyHeatmap from '../components/market/SP500DailyHeatmap'
import '../components/market/StockMarketToday.css'

export default function StockMarketHeatmapPage() {
  return (
    <main className="stock-market-today-page">
      <nav
        className="market-today-subnav"
        aria-label="Stock Market Today"
      >
        <a href="/stock-market-today/">
          Overview
        </a>

        <a
          href="/stock-market-today/heatmap/"
          className="active"
          aria-current="page"
        >
          Heatmap
        </a>

        <a href="/stock-market-today/sector-health/">
          Sector Health
        </a>

        <a href="/stock-market-today/earnings-calendar/">
          Earnings Calendar
        </a>
      </nav>

      <section className="market-today-hero">
        <div>
          <span className="market-today-eyebrow">
            STOCK MARKET TODAY
          </span>

          <h1 className="heatmap-page-title">
            S&amp;P 500 Stock Components Heatmap Today
          </h1>
        </div>
      </section>

      <SP500DailyHeatmap />

      <section className="market-guide" aria-labelledby="heatmap-guide-title">
        <h2 id="heatmap-guide-title">How to Read the S&amp;P 500 Heatmap</h2>
        <p>
          Explore daily stock performance across the S&amp;P 500.
          The heatmap helps identify market leaders, laggards, and
          concentrations of strength or weakness.
        </p>

        <h3>Understand the Colors</h3>
        <p>
          Green indicates positive price performance, while red indicates
          negative performance. Stronger color intensity generally
          represents larger price changes.
        </p>

        <h3>Explore Individual Stocks</h3>
        <p>
          Hover over any stock tile to view its ticker symbol,
          latest available stock price, price change, sector, and industry.
        </p>

        <h3>Identify Market Trends</h3>
        <p>
          Compare stocks within sectors to identify broad market participation
          or concentrated leadership. Look for clusters of advancing and
          declining companies.
        </p>

        <p className="market-guide-note">
          Market data may be delayed. Price movements do not constitute
          investment recommendations.
        </p>
      </section>

    </main>
  )
}
