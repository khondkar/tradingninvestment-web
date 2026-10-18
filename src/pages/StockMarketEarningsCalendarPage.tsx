import MarketBenchmarkStrip from '../components/market/MarketBenchmarkStrip'
import { useMarketTodaySnapshot } from '../hooks/useMarketTodaySnapshot'
import { MarketPageLayout } from '../components/market/MarketSectionNavigation'
import EarningsCalendar from '../components/market/EarningsCalendar'

import '../components/market/StockMarketToday.css'

export default function StockMarketEarningsCalendarPage() {
  const marketSnapshot = useMarketTodaySnapshot()
  return (
    <MarketPageLayout active="/stock-market-today/earnings-calendar/"><main className="stock-market-today-page earnings-calendar-page">
      <MarketBenchmarkStrip benchmarks={marketSnapshot.benchmarks} />


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
    </main></MarketPageLayout>
  )
}
