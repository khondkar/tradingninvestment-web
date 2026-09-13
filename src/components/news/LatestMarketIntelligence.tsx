import { useEffect, useMemo, useState } from 'react'

/* ==========================================================================
   TNI PUBLIC WEBSITE — LATEST MARKET INTELLIGENCE
   Public delayed preview of verified TNI Live News intelligence.

   Product rules:
   - Uses the existing TNI production news API.
   - Shows only top-ranked eligible stories.
   - Enforces a minimum 2-hour public delay.
   - Displays a maximum of 3 stories.
   - Never invents fallback headlines or market data.
   - Every story routes visitors to TNI Live News.
   ========================================================================== */

const TNI_NEWS_API_URL =
  'https://quant-ai-agent.onrender.com/news/live'

const TNI_LIVE_NEWS_URL =
  'https://tni-frontend.onrender.com/live/news'

const PUBLIC_DELAY_MS = 2 * 60 * 60 * 1000
const MAX_PUBLIC_STORIES = 3

/* ==========================================================================
   TNI MARKET INTELLIGENCE — API TYPES
   Only fields required by the public intelligence preview are defined here.
   ========================================================================== */

type NewsDirection =
  | 'POSITIVE'
  | 'NEGATIVE'
  | 'NEUTRAL'
  | 'MIXED'
  | string

type LiveNewsStory = {
  headline?: string
  source?: string
  article_count?: number
  source_count?: number
  time_published?: string
  event_type?: string
  impact_score?: number
  impact_level?: string
  direction?: NewsDirection
  primary_ticker?: string
  affected_tickers?: string[]
  confidence_score?: number
  top_rank_eligible?: boolean
}

type LiveNewsResponse = {
  stories?: LiveNewsStory[]
}

/* ==========================================================================
   TNI MARKET INTELLIGENCE — TIMESTAMP PARSER
   Converts backend YYYYMMDDTHHMMSS timestamps into JavaScript Date objects.
   Backend timestamps are treated as UTC.
   ========================================================================== */

function parseNewsTimestamp(value?: string): Date | null {
  if (!value) {
    return null
  }

  const match = value.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/
  )

  if (!match) {
    return null
  }

  const [
    ,
    year,
    month,
    day,
    hour,
    minute,
    second,
  ] = match

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  )
}

/* ==========================================================================
   TNI MARKET INTELLIGENCE — DISPLAY TIME
   Shows browser-local publication time plus a concise relative age.
   ========================================================================== */

function formatStoryTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatRelativeAge(date: Date) {
  const elapsedMs = Math.max(
    0,
    Date.now() - date.getTime()
  )

  const totalMinutes = Math.floor(
    elapsedMs / (60 * 1000)
  )

  if (totalMinutes < 60) {
    return `${totalMinutes} MIN AGO`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours < 24) {
    return minutes > 0
      ? `${hours} HR ${minutes} MIN AGO`
      : `${hours} HR AGO`
  }

  const days = Math.floor(hours / 24)

  return days === 1
    ? '1 DAY AGO'
    : `${days} DAYS AGO`
}

/* ==========================================================================
   TNI MARKET INTELLIGENCE — LABEL HELPERS
   Keeps backend event taxonomy intact while improving public readability.
   ========================================================================== */

function formatEventType(value?: string) {
  if (!value) {
    return 'GENERAL'
  }

  return value
    .replace(/_/g, ' ')
    .replace(/\bAND\b/g, '&')
}

function formatAffectedTickers(story: LiveNewsStory) {
  const affected =
    story.affected_tickers?.filter(Boolean) ?? []

  if (affected.length > 0) {
    return affected.join(', ')
  }

  return story.primary_ticker || 'MARKET'
}

function directionClass(direction?: string) {
  const normalized =
    direction?.toUpperCase() || 'NEUTRAL'

  if (normalized === 'POSITIVE') {
    return 'is-positive'
  }

  if (normalized === 'NEGATIVE') {
    return 'is-negative'
  }

  if (normalized === 'MIXED') {
    return 'is-mixed'
  }

  return 'is-neutral'
}

/* ==========================================================================
   TNI MARKET INTELLIGENCE — COMPONENT
   ========================================================================== */

export default function LatestMarketIntelligence() {
  const [stories, setStories] =
    useState<LiveNewsStory[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [hasError, setHasError] =
    useState(false)

  /* ========================================================================
     TNI MARKET INTELLIGENCE — FETCH VERIFIED LIVE NEWS
     ======================================================================== */

  useEffect(() => {
    let isMounted = true

    async function loadMarketIntelligence() {
      try {
        const response = await fetch(
          TNI_NEWS_API_URL,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(
            `News API returned ${response.status}`
          )
        }

        const data =
          (await response.json()) as LiveNewsResponse

        if (!isMounted) {
          return
        }

        setStories(
          Array.isArray(data.stories)
            ? data.stories
            : []
        )

        setHasError(false)
      } catch (error) {
        console.error(
          'TNI PUBLIC MARKET INTELLIGENCE ERROR:',
          error
        )

        if (isMounted) {
          setStories([])
          setHasError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMarketIntelligence()

    return () => {
      isMounted = false
    }
  }, [])

  /* ========================================================================
     TNI MARKET INTELLIGENCE — PUBLIC DELAY + QUALITY FILTER
     Nothing newer than the public delay threshold can appear here.
     ======================================================================== */

  const publicStories = useMemo(() => {
    const publicCutoff =
      Date.now() - PUBLIC_DELAY_MS

    return stories
      .map((story) => ({
        story,
        publishedAt: parseNewsTimestamp(
          story.time_published
        ),
      }))
      .filter(
        (
          item
        ): item is {
          story: LiveNewsStory
          publishedAt: Date
        } =>
          item.story.top_rank_eligible === true &&
          item.publishedAt !== null &&
          item.publishedAt.getTime() <=
            publicCutoff
      )
      .sort(
        (a, b) =>
          b.publishedAt.getTime() -
          a.publishedAt.getTime()
      )
      .slice(0, MAX_PUBLIC_STORIES)
  }, [stories])

  /* ========================================================================
     TNI MARKET INTELLIGENCE — NO FAKE FALLBACK CONTENT
     If the API is unavailable or there are no qualifying stories, we do not
     manufacture headlines. The conversion CTA remains available.
     ======================================================================== */

  return (
    <section
      className="latest-market-intelligence"
      aria-labelledby="latest-market-intelligence-title"
    >
      <div className="market-intelligence-header">
        <div>
          <div className="market-intelligence-eyebrow">
            <span
              className="market-intelligence-live-dot"
              aria-hidden="true"
            />

            <span>MARKET INTELLIGENCE</span>

            <span className="market-intelligence-delay-badge">
              DELAYED
            </span>
          </div>

          <h2 id="latest-market-intelligence-title">
            Latest Market Intelligence
          </h2>

          <p>
            Selected market-moving developments
            identified by TNI.
          </p>
        </div>

        <a
          className="market-intelligence-top-link"
          href={TNI_LIVE_NEWS_URL}
          target="_blank"
          rel="noreferrer"
        >
          View Live Intelligence
          <span aria-hidden="true">→</span>
        </a>
      </div>

      {/* ==================================================================
          TNI MARKET INTELLIGENCE — DESKTOP COLUMN LABELS
          ================================================================== */}

      <div
        className="market-intelligence-columns"
        aria-hidden="true"
      >
        <span>TIME</span>
        <span>STORY</span>
        <span>IMPACT</span>
        <span>AFFECTED</span>
      </div>

      {/* ==================================================================
          TNI MARKET INTELLIGENCE — STORIES
          Entire intelligence row opens the complete TNI Live News channel.
          ================================================================== */}

      <div className="market-intelligence-list">
        {isLoading && (
          <div className="market-intelligence-status">
            Loading latest market intelligence…
          </div>
        )}

        {!isLoading &&
          !hasError &&
          publicStories.length === 0 && (
            <div className="market-intelligence-status">
              No delayed market intelligence is
              currently available.
            </div>
          )}

        {!isLoading &&
          hasError && (
            <div className="market-intelligence-status">
              Market intelligence is temporarily
              unavailable.
            </div>
          )}

        {!isLoading &&
          publicStories.map(
            ({ story, publishedAt }, index) => {
              const ticker =
                story.primary_ticker || 'MARKET'

              const direction =
                story.direction?.toUpperCase() ||
                'NEUTRAL'

              return (
                <a
                  className="market-intelligence-row"
                  href={TNI_LIVE_NEWS_URL}
                  target="_blank"
                  rel="noreferrer"
                  key={`${story.time_published}-${ticker}-${index}`}
                >
                  {/* ======================================================
                      TIME
                      ====================================================== */}

                  <div className="market-intelligence-time">
                    <strong>
                      {formatStoryTime(
                        publishedAt
                      )}
                    </strong>

                    <span>
                      {formatRelativeAge(
                        publishedAt
                      )}
                    </span>
                  </div>

                  {/* ======================================================
                      STORY
                      ====================================================== */}

                  <div className="market-intelligence-story">
                    <div className="market-intelligence-ticker">
                      {ticker}
                    </div>

                    <h3>
                      {story.headline ||
                        'Market intelligence update'}
                    </h3>

                    <div className="market-intelligence-meta">
                      <span>
                        {story.impact_level ||
                          'GENERAL'}{' '}
                        IMPACT
                      </span>

                      <span>
                        {ticker} ·{' '}
                        {formatEventType(
                          story.event_type
                        )}
                      </span>

                      <span>
                        {story.article_count ?? 1}{' '}
                        ARTICLE
                      </span>

                      <span>
                        {story.source_count ?? 1}{' '}
                        SOURCE
                      </span>

                      {typeof story.confidence_score ===
                        'number' && (
                        <span>
                          CONFIDENCE{' '}
                          {story.confidence_score}
                        </span>
                      )}

                      {story.source && (
                        <span>{story.source}</span>
                      )}
                    </div>
                  </div>

                  {/* ======================================================
                      IMPACT / DIRECTION
                      ====================================================== */}

                  <div className="market-intelligence-impact">
                    {typeof story.impact_score ===
                      'number' && (
                      <strong>
                        {story.impact_score}
                      </strong>
                    )}

                    <span
                      className={directionClass(
                        direction
                      )}
                    >
                      {direction}
                    </span>
                  </div>

                  {/* ======================================================
                      AFFECTED TICKERS
                      ====================================================== */}

                  <div className="market-intelligence-affected">
                    <strong>
                      {formatAffectedTickers(
                        story
                      )}
                    </strong>

                    <span aria-hidden="true">→</span>
                  </div>
                </a>
              )
            }
          )}
      </div>

      {/* ==================================================================
          TNI MARKET INTELLIGENCE — CONVERSION FOOTER
          Delay is intentionally disclosed without publishing the duration.
          ================================================================== */}

      <div className="market-intelligence-footer">
        <p>
          Selected intelligence is intentionally
          delayed on TradingNInvestment.
        </p>

        <a
          href={TNI_LIVE_NEWS_URL}
          target="_blank"
          rel="noreferrer"
        >
          Access real-time intelligence in TNI
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}
