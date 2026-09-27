import { useEffect } from 'react'
import './StockMarketCrash1929Page.css'

const federalReserve =
  'https://www.federalreservehistory.org/essays/stock-market-crash-of-1929'

const historySource =
  'https://www.history.com/this-day-in-history/october-29/stock-market-crashes'

const timeline = [
  [
    'August 1921–September 1929',
    'The Dow rose from about 63 to 381 during the Roaring Twenties.',
    'The market’s long rise set the stage for the historic peak before the crash.',
  ],
  [
    'September 3, 1929',
    'The Dow closed at its peak of 381.17.',
    'This became the reference point for measuring the subsequent decline.',
  ],
  [
    'October 24, 1929',
    'Black Thursday',
    'Heavy selling marked the start of the late-October crash.',
  ],
  [
    'October 28, 1929',
    'Black Monday',
    'The Dow suffered another sharp decline as selling intensified.',
  ],
  [
    'October 29, 1929',
    'Black Tuesday',
    'A further selloff deepened the crash and shook confidence in the market.',
  ],
  [
    'July 8, 1932',
    'The Dow closed at 41.22.',
    'It had fallen about 89% from its September 1929 peak.',
  ],
  [
    'By 1933',
    'Bank failures and unemployment had spread across the country.',
    'The financial crisis had become part of a much wider economic depression.',
  ],
  [
    'November 1954',
    'The Dow regained its 1929 closing high.',
    'The recovery took more than 25 years from the 1929 peak.',
  ],
]

export default function StockMarketCrash1929Page() {
  useEffect(() => {
    document.title = 'Stock Market Crash of 1929 | TradingNInvestment'

    let canonical =
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]')

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }

    canonical.href =
      'https://tradingninvestment.com/stock-market-crash-of-1929/'
  }, [])

  return (
    <main className="crash1929-page">
      <nav className="crash1929-breadcrumb" aria-label="Breadcrumb">
        <a href="/research/">Research</a>
        <span>›</span>
        <a href="/research/indexes/dow/">Dow Jones Research</a>
        <span>›</span>
        <span>Stock Market Crash of 1929</span>
      </nav>

      <article>
        <header className="crash1929-header">
          <h1>Stock Market Crash of 1929</h1>

          <p className="crash1929-author">
            By <a href="/about/" rel="author">Kamal Khondkar</a>
            {' · '}Quant Researcher
          </p>

          <nav className="crash1929-categories" aria-label="Article categories">
            <a href="/research/indexes/dow/">Dow Jones</a>
            <a href="/research/market-crashes/">Market Crashes</a>
          </nav>
        </header>

        <p>
          During the Roaring Twenties, the U.S. economy and stock market
          expanded rapidly, while buying stocks on margin let investors
          take on greater risk. The Dow Jones Industrial Average reached
          381.17 on September 3, 1929. After the sharp selloffs known as
          Black Thursday, Black Monday, and Black Tuesday, it continued
          falling until July 8, 1932, when it closed at 41.22—about 89%
          below its peak. The Wall Street crash of 1929, also called the
          Great Crash, was a major turning point at the beginning of the
          Great Depression, though it was not the only cause of the
          economic crisis. This chart places the 1929 stock market crash
          in the context of the Roaring Twenties boom and the prolonged
          decline that followed.
        </p>

        <p className="crash1929-source">
          Source:{' '}
          <a href={federalReserve} target="_blank" rel="noreferrer">
            Federal Reserve History — Stock Market Crash of 1929
          </a>
        </p>

        <figure className="crash1929-chart">
          <a href="/wp-content/uploads/2016/03/Dow-Jones-History-1920-to-1940.jpg">
            <img
              src="/wp-content/uploads/2016/03/Dow-Jones-History-1920-to-1940.jpg"
              alt="Dow Jones history from 1920 to 1940"
            />
          </a>
        </figure>

        <section aria-labelledby="crash1929-roaring">
          <h2 id="crash1929-roaring">The Roaring Twenties and the Dow</h2>

          <p>
            The Roaring Twenties roared loudest and longest on the New
            York Stock Exchange. Share prices rose to unprecedented
            heights. The Dow Jones Industrial Average increased six-fold
            from sixty-three in August 1921 to 381 in September 1929.
          </p>

          <p className="crash1929-source">
            Source:{' '}
            <a href={federalReserve} target="_blank" rel="noreferrer">
              Federal Reserve History — Stock Market Crash of 1929
            </a>
          </p>
        </section>

        <section aria-labelledby="crash1929-timeline">
          <h2 id="crash1929-timeline">1929 Crash Timeline</h2>

          <div
            className="crash1929-table-scroll"
            role="region"
            aria-labelledby="crash1929-timeline"
            tabIndex={0}
          >
            <table className="crash1929-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Event</th>
                  <th scope="col">Consequence</th>
                </tr>
              </thead>

              <tbody>
                {timeline.map(([date, event, consequence]) => (
                  <tr key={date}>
                    <th scope="row">{date}</th>
                    <td>{event}</td>
                    <td>{consequence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="crash1929-consequences">
          <h2 id="crash1929-consequences">The Crash and Its Consequences</h2>

          <p>
            By 1933, nearly half of America’s banks had failed, and
            unemployment was approaching 15 million people, or 30 percent
            of the workforce. It would take{' '}
            <a
              href="https://www.history.com/topics/world-war-ii"
              target="_blank"
              rel="noreferrer"
            >
              World War II
            </a>
            , and the massive level of armaments production taken on by
            the United States, to finally bring the country out of the
            Depression after a decade of suffering.
          </p>

          <p className="crash1929-source">
            Source:{' '}
            <a href={historySource} target="_blank" rel="noreferrer">
              HISTORY — Stock Market Crashes on Black Tuesday
            </a>
          </p>
        </section>

        <aside className="crash1929-author-bio">
          <h2>About the Author</h2>
          <p>
            <a href="/about/" rel="author">Kamal Khondkar</a>
            {' — '}Quant Researcher
          </p>
          <p>
            Independent quantitative researcher focused on historical
            market data, investment analysis, and risk.
          </p>
        </aside>
      </article>
    </main>
  )
}
