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
    </main>
  )
}
