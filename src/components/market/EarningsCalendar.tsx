import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import earningsData from '../../data/market-today/earnings-calendar.json'

import './EarningsCalendar.css'

type EarningsEvent = {
  ticker: string
  company: string
  sector: string
  industry: string
  report_date: string
  fiscal_date_ending: string | null
  eps_estimate: number | null
  currency: string
  timing:
    | 'pre-market'
    | 'post-market'
    | 'unspecified'
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000'

type TniNewsStory = {
  headline: string
  summary: string
  source: string
  source_quality: number | null
  url: string
  time_published: string
  event_type: string
  impact_score: number
  impact_level: string
  direction: string
  primary_ticker: string
  affected_tickers: string[]
  confidence_score: number
  top_rank_eligible: boolean
}

type TniNewsResponse = {
  count: number
  stories: TniNewsStory[]
}

type EarningsSnapshot = {
  generated_at_et: string
  summary: {
    events: number
    pre_market: number
    post_market: number
    unspecified_time: number
    with_eps_estimate: number
  }
  earnings: EarningsEvent[]
}

const snapshot =
  earningsData as EarningsSnapshot

type RangeKey = 'week' | 'next' | 'all'

function parseLocalDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function startOfWeek(date: Date) {
  const result = new Date(date)
  const day = result.getDay()

  const distance =
    day === 0 ? -6 : 1 - day

  result.setDate(
    result.getDate() + distance,
  )

  result.setHours(12, 0, 0, 0)

  return result
}

function addDays(
  date: Date,
  days: number,
) {
  const result = new Date(date)

  result.setDate(
    result.getDate() + days,
  )

  return result
}

function formatDayHeading(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    },
  ).format(
    parseLocalDate(value),
  )
}

function formatGenerated(
  value: string,
) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone:
        'America/New_York',
      timeZoneName: 'short',
    },
  ).format(date)
}

function formatEPS(
  event: EarningsEvent,
) {
  if (event.eps_estimate === null) {
    return '—'
  }

  const value =
    event.eps_estimate.toFixed(2)

  if (event.currency === 'USD') {
    return `$${value}`
  }

  return `${value} ${event.currency}`
}

function timingLabel(
  timing: EarningsEvent['timing'],
) {
  if (timing === 'pre-market') {
    return 'Before Open'
  }

  if (timing === 'post-market') {
    return 'After Close'
  }

  return 'Time Not Specified'
}

function timingClass(
  timing: EarningsEvent['timing'],
) {
  if (timing === 'pre-market') {
    return 'before'
  }

  if (timing === 'post-market') {
    return 'after'
  }

  return 'unknown'
}

export default function EarningsCalendar() {
  const [range, setRange] =
    useState<RangeKey>('week')

  const [
    selectedEvent,
    setSelectedEvent,
  ] = useState<EarningsEvent | null>(
    null,
  )

  const [
    newsStories,
    setNewsStories,
  ] = useState<TniNewsStory[]>([])

  const [
    newsLoading,
    setNewsLoading,
  ] = useState(false)

  const [
    newsError,
    setNewsError,
  ] = useState<string | null>(null)

  const generated =
    new Date(snapshot.generated_at_et)

  const generatedDate =
    Number.isNaN(generated.getTime())
      ? new Date()
      : generated

  const today =
    new Date(generatedDate)

  today.setHours(12, 0, 0, 0)

  const thisWeekStart =
    startOfWeek(today)

  const thisWeekEnd =
    addDays(thisWeekStart, 6)

  const nextWeekStart =
    addDays(thisWeekStart, 7)

  const nextWeekEnd =
    addDays(nextWeekStart, 6)

  const visibleEvents =
    useMemo(() => {
      return snapshot.earnings.filter(
        (event) => {
          const eventDate =
            parseLocalDate(
              event.report_date,
            )

          if (range === 'week') {
            return (
              eventDate >=
                thisWeekStart &&
              eventDate <=
                thisWeekEnd
            )
          }

          if (range === 'next') {
            return (
              eventDate >=
                nextWeekStart &&
              eventDate <=
                nextWeekEnd
            )
          }

          return eventDate >= today
        },
      )
    }, [
      range,
      thisWeekStart.getTime(),
      thisWeekEnd.getTime(),
      nextWeekStart.getTime(),
      nextWeekEnd.getTime(),
      today.getTime(),
    ])

  useEffect(() => {
    if (!selectedEvent) {
      setNewsStories([])
      setNewsLoading(false)
      setNewsError(null)
      return
    }

    const controller =
      new AbortController()

    async function loadTickerNews() {
      try {
        setNewsLoading(true)
        setNewsError(null)
        setNewsStories([])

        const ticker =
          encodeURIComponent(
            selectedEvent!.ticker,
          )

        const response =
          await fetch(
            `${API_BASE_URL}/news/live?ticker=${ticker}&limit=3`,
            {
              signal:
                controller.signal,
            },
          )

        if (!response.ok) {
          throw new Error(
            `News request failed: ${response.status}`,
          )
        }

        const data =
          (await response.json()) as
            TniNewsResponse

        if (!controller.signal.aborted) {
          setNewsStories(
            Array.isArray(data.stories)
              ? data.stories
              : [],
          )
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return
        }

        console.error(
          'TNI earnings news error:',
          error,
        )

        if (!controller.signal.aborted) {
          setNewsError(
            'TNI intelligence is temporarily unavailable.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setNewsLoading(false)
        }
      }
    }

    loadTickerNews()

    return () => {
      controller.abort()
    }
  }, [selectedEvent])

  const grouped =
    useMemo(() => {
      const map =
        new Map<
          string,
          EarningsEvent[]
        >()

      for (
        const event of visibleEvents
      ) {
        const existing =
          map.get(event.report_date) ??
          []

        existing.push(event)

        map.set(
          event.report_date,
          existing,
        )
      }

      return [...map.entries()].sort(
        ([a], [b]) =>
          a.localeCompare(b),
      )
    }, [visibleEvents])



  return (
    <div className="earnings-calendar">
      <section className="earnings-toolbar">
        <div className="earnings-range-tabs">
          <button
            type="button"
            className={
              range === 'week'
                ? 'active'
                : ''
            }
            onClick={() =>
              setRange('week')
            }
          >
            This Week
          </button>

          <button
            type="button"
            className={
              range === 'next'
                ? 'active'
                : ''
            }
            onClick={() =>
              setRange('next')
            }
          >
            Next Week
          </button>

          <button
            type="button"
            className={
              range === 'all'
                ? 'active'
                : ''
            }
            onClick={() =>
              setRange('all')
            }
          >
            Upcoming
          </button>
        </div>

        <div className="earnings-updated">
          <span>DATA UPDATED</span>

          <strong>
            {formatGenerated(
              snapshot.generated_at_et,
            )}
          </strong>
        </div>
      </section>



      {grouped.length === 0 ? (
        <section className="earnings-empty">
          <strong>
            No S&amp;P 500 earnings
            scheduled in this period.
          </strong>

          <span>
            Select another date range
            to view upcoming reports.
          </span>
        </section>
      ) : (
        <div className="earnings-days">
          {grouped.map(
            ([date, events]) => {
              const isToday =
                date === dateKey(today)

              return (
                <section
                  className={[
                    'earnings-day',
                    isToday
                      ? 'today'
                      : '',
                  ].join(' ')}
                  key={date}
                >
                  <header className="earnings-day-header">
                    <div>
                      <span>
                        {isToday
                          ? 'TODAY'
                          : 'EARNINGS'}
                      </span>

                      <h2>
                        {formatDayHeading(
                          date,
                        )}
                      </h2>
                    </div>

                    <strong>
                      {events.length}{' '}
                      {events.length === 1
                        ? 'company'
                        : 'companies'}
                    </strong>
                  </header>

                  <div className="earnings-list">
                    {events.map(
                      (event) => (
                        <button
                          type="button"
                          className="earnings-company"
                          key={`${event.report_date}-${event.ticker}`}
                          aria-label={`Open ${event.ticker} earnings intelligence`}
                          onClick={() =>
                            setSelectedEvent(
                              event,
                            )
                          }
                        >
                          <div className="earnings-symbol">
                            <div className="earnings-ticker">
                              {event.ticker}
                            </div>

                            <div>
                              <strong>
                                {event.company}
                              </strong>

                              <span>
                                {event.sector}
                              </span>
                            </div>
                          </div>

                          <div className="earnings-metric">
                            <span>
                              EPS EST.
                            </span>

                            <strong>
                              {formatEPS(event)}
                            </strong>
                          </div>

                          <div
                            className={[
                              'earnings-timing',
                              timingClass(
                                event.timing,
                              ),
                            ].join(' ')}
                          >
                            <i />

                            <span>
                              {timingLabel(
                                event.timing,
                              )}
                            </span>
                          </div>

                          <span
                            className="earnings-open"
                            aria-hidden="true"
                          >
                            ›
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </section>
              )
            },
          )}
        </div>
      )}

      <section className="earnings-methodology">
        <strong>
          S&amp;P 500 Earnings Calendar
        </strong>

        <p>
          Upcoming earnings dates are
          filtered against the current
          TNI S&amp;P 500 constituent
          universe. EPS estimates and
          reporting times are displayed
          when available from the source.
          Earnings dates and times may
          change.
        </p>

        <span>
          Source: Alpha Vantage ·
          Cached by TradingNInvestment
        </span>
      </section>
      {selectedEvent && (
        <div
          className="earnings-drawer-layer"
          role="presentation"
        >
          <button
            type="button"
            className="earnings-drawer-backdrop"
            aria-label="Close earnings intelligence"
            onClick={() =>
              setSelectedEvent(null)
            }
          />

          <aside
            className="earnings-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedEvent.ticker} earnings intelligence`}
          >
            <header className="earnings-drawer-header">
              <div>
                <span>
                  EARNINGS INTELLIGENCE
                </span>

                <strong>
                  TNI
                </strong>
              </div>

              <button
                type="button"
                className="earnings-drawer-close"
                aria-label="Close earnings intelligence"
                onClick={() =>
                  setSelectedEvent(null)
                }
              >
                ×
              </button>
            </header>

            <div className="earnings-drawer-company">
              <div className="earnings-drawer-ticker">
                {selectedEvent.ticker}
              </div>

              <div>
                <h2>
                  {selectedEvent.company}
                </h2>

                <p>
                  {selectedEvent.sector}
                </p>
              </div>
            </div>

            <section className="earnings-drawer-event">
              <span className="earnings-drawer-section-label">
                UPCOMING EARNINGS
              </span>

              <div className="earnings-drawer-event-grid">
                <div>
                  <span>REPORT DATE</span>

                  <strong>
                    {formatDayHeading(
                      selectedEvent.report_date,
                    )}
                  </strong>
                </div>

                <div>
                  <span>REPORTING TIME</span>

                  <strong>
                    {timingLabel(
                      selectedEvent.timing,
                    )}
                  </strong>
                </div>

                <div>
                  <span>EPS ESTIMATE</span>

                  <strong className="earnings-drawer-eps">
                    {formatEPS(
                      selectedEvent,
                    )}
                  </strong>
                </div>

                <div>
                  <span>SECTOR</span>

                  <strong>
                    {selectedEvent.sector}
                  </strong>
                </div>
              </div>
            </section>

            <section className="earnings-drawer-news">
              <div className="earnings-drawer-news-heading">
                <div>
                  <span className="earnings-drawer-section-label">
                    TNI NEWS INTELLIGENCE
                  </span>

                  <h3>
                    What matters before earnings
                  </h3>
                </div>

                <span className="earnings-drawer-live">
                  LIVE
                </span>
              </div>

              {newsLoading ? (
                <div className="earnings-drawer-news-state">
                  <strong>
                    Loading TNI Intelligence...
                  </strong>

                  <p>
                    Analyzing recent news for{' '}
                    {selectedEvent.ticker}.
                  </p>
                </div>
              ) : newsError ? (
                <div className="earnings-drawer-news-state">
                  <strong>
                    Intelligence unavailable
                  </strong>

                  <p>
                    {newsError}
                  </p>
                </div>
              ) : newsStories.length === 0 ? (
                <div className="earnings-drawer-news-state">
                  <strong>
                    No recent TNI intelligence
                  </strong>

                  <p>
                    No recent market-moving TNI
                    news was found for{' '}
                    {selectedEvent.ticker}.
                  </p>
                </div>
              ) : (
                <div className="earnings-drawer-story-list">
                  {newsStories.map(
                    (story, index) => (
                      <article
                        className="earnings-drawer-story"
                        key={`${story.url}-${index}`}
                      >
                        <div className="earnings-drawer-story-assessment">
                          <span
                            className={[
                              'earnings-news-direction',
                              story.direction
                                .toLowerCase(),
                            ].join(' ')}
                          >
                            {story.direction}
                          </span>

                          <span className="earnings-news-impact">
                            {story.impact_level}
                            {' '}
                            IMPACT
                          </span>
                        </div>

                        <div className="earnings-drawer-story-scores">
                          <span>
                            IMPACT
                            <strong>
                              {story.impact_score}
                            </strong>
                          </span>

                          <span>
                            CONFIDENCE
                            <strong>
                              {story.confidence_score}%
                            </strong>
                          </span>

                          <span>
                            EVENT
                            <strong>
                              {story.event_type}
                            </strong>
                          </span>
                        </div>

                        <h4>
                          {story.headline}
                        </h4>

                        <p>
                          {story.summary}
                        </p>

                        <footer className="earnings-drawer-story-footer">
                          <span>
                            {story.source}
                          </span>

                          {story.url && (
                            <a
                              href={story.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              READ SOURCE →
                            </a>
                          )}
                        </footer>
                      </article>
                    ),
                  )}
                </div>
              )}
            </section>

            <footer className="earnings-drawer-footer">
              <span>
                TRADINGNINVESTMENT
              </span>

              <small>
                Agentic Investment Intelligence
              </small>
            </footer>
          </aside>
        </div>
      )}

    </div>
  )
}
