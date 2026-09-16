import EarningsCalendar from '../components/market/EarningsCalendar'

import '../components/market/StockMarketToday.css'

export default function StockMarketEarningsCalendarPage() {
  return (
    <main className="stock-market-today-page earnings-calendar-page">
      <nav
        className="market-today-subnav"
        aria-label="Stock Market Today"
      >
        <a href="/stock-market-today/">
          Overview
        </a>

        <a href="/stock-market-today/heatmap/">
          Heatmap
        </a>

        <a href="/stock-market-today/sector-health/">
          Sector Health
        </a>

        <a
          href="/stock-market-today/earnings-calendar/"
          className="active"
          aria-current="page"
        >
          Earnings Calendar
        </a>
      </nav>

      <section className="market-today-hero">
        <div>
          <span className="market-today-eyebrow">
            STOCK MARKET TODAY
          </span>

          <h1 className="earnings-page-title">
            <span>
              Earnings Calendar
            </span>

            <small>
              S&amp;P 500 · SPY · VOO · IWM · QQQ · DIA · DJIA
            </small>
          </h1>

          <p>
            Upcoming earnings, EPS estimates
            and confirmed reporting times.
          </p>
        </div>
      </section>

      <EarningsCalendar />
    </main>
  )
}
