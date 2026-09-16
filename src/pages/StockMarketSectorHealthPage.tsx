import SectorHealthBoard from '../components/market/SectorHealthBoard'

import '../components/market/StockMarketToday.css'

export default function StockMarketSectorHealthPage() {
  return (
    <main className="market-today-page">
      <nav
        className="market-today-subnav"
        aria-label="Stock Market Today sections"
      >
        <a href="/stock-market-today/">
          Overview
        </a>

        <a href="/stock-market-today/heatmap/">
          Heatmap
        </a>

        <a
          href="/stock-market-today/sector-health/"
          className="active"
          aria-current="page"
        >
          Sector Health
        </a>

        <a href="/stock-market-today/earnings-calendar/">
          Earnings Calendar
        </a>
      </nav>

      <section className="market-today-hero">
        <span className="market-today-eyebrow">
          STOCK MARKET TODAY
        </span>

        <h1 className="heatmap-page-title">
          S&amp;P 500 Sector Health Today
        </h1>
      </section>

      <SectorHealthBoard />
    </main>
  )
}
