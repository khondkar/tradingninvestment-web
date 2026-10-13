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

      <section className="market-guide" aria-labelledby="sector-guide-title">
        <h2 id="sector-guide-title">How to Interpret Sector Health</h2>
        <p>
          Compare S&amp;P 500 sector leadership across four time horizons
          to understand daily performance and longer-term market rotation.
        </p>

        <h3>What's Happening Today — Daily Performance</h3>
        <p>
          Identify which sectors are leading and lagging during today's
          trading session.
        </p>

        <h3>Short-Term Sector Leadership — Weekly Performance</h3>
        <p>
          Compare sector returns for the week to identify short-term
          leaders and laggards.
        </p>

        <h3>Medium-Term Sector Leadership — Monthly Performance</h3>
        <p>
          Examine monthly returns to identify sustained sector strength,
          weakness, and potential rotation.
        </p>

        <h3>Long-Term Sector Leadership — Year-to-Date Performance</h3>
        <p>
          Compare returns since the beginning of the calendar year to
          identify longer-term sector leaders and laggards.
        </p>

        <h3>Compare the Four Horizons</h3>
        <p>
          Leadership across multiple periods may indicate more persistent
          momentum than strength limited to a single trading session.
        </p>

        <p className="market-guide-note">
          Sector rankings depend on the selected performance period.
          Past performance does not guarantee future results.
        </p>
      </section>

    </main>
  )
}
