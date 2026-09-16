import marketSnapshot from '../../data/market-today/snapshot.json'

import './SectorHealthBoard.css'

type SectorRecord = {
  sector: string
  stocks: number
  advancing: number
  declining: number
  unchanged: number
  positive_pct: number
  negative_pct: number
  average_change_pct: number
  median_change_pct: number
}

type Horizon = {
  label: string
  description: string
  refresh: string
  updated_at_et: string
  sectors: SectorRecord[]
}

type Snapshot = {
  generated_at_et: string
  sector_horizons: {
    methodology: string
    daily: Horizon
    weekly: Horizon
    monthly: Horizon
    ytd: Horizon
  }
}

const snapshot = marketSnapshot as Snapshot

function formatReturn(value: number) {
  const sign = value > 0 ? '+' : ''

  return `${sign}${value.toFixed(2)}%`
}

function formatTimestamp(
  value: string,
  intraday: boolean,
) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  if (intraday) {
    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
        timeZoneName: 'short',
      },
    ).format(date)
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York',
    },
  ).format(date)
}

const sections = [
  {
    key: 'daily',
    eyebrow: 'DAILY RETURN',
    title: "What's happening today",
    freshness: 'INTRADAY',
    variant: 'live',
  },
  {
    key: 'weekly',
    eyebrow: 'WEEKLY RETURN',
    title: 'Short-term sector leadership',
    freshness: 'SHORT-TERM',
    variant: 'light',
  },
  {
    key: 'monthly',
    eyebrow: 'MONTHLY RETURN',
    title: 'Medium-term sector trend',
    freshness: 'MONTH-TO-DATE',
    variant: 'panel',
  },
  {
    key: 'ytd',
    eyebrow: 'YEAR-TO-DATE',
    title: 'Longer-term sector leadership',
    freshness: 'YTD',
    variant: 'light',
  },
] as const

export default function SectorHealthBoard() {
  const horizons = snapshot.sector_horizons

  return (
    <div className="sector-horizon-board">
      {sections.map((config, index) => {
        const horizon = horizons[config.key]

        const sectors = [...horizon.sectors].sort(
          (a, b) =>
            b.average_change_pct -
            a.average_change_pct,
        )

        const maxAbs = Math.max(
          1,
          ...sectors.map((sector) =>
            Math.abs(
              sector.average_change_pct,
            ),
          ),
        )

        const positive = sectors.filter(
          (sector) =>
            sector.average_change_pct > 0,
        ).length

        const negative = sectors.filter(
          (sector) =>
            sector.average_change_pct < 0,
        ).length

        const leader = sectors[0]
        const laggard =
          sectors[sectors.length - 1]

        const intraday =
          config.key === 'daily' ||
          config.key === 'weekly'

        return (
          <section
            className={[
              'sector-horizon-section',
              `sector-horizon-${config.variant}`,
            ].join(' ')}
            key={config.key}
          >
            <div className="sector-horizon-number">
              {String(index + 1).padStart(2, '0')}
            </div>

            <header className="sector-horizon-header">
              <div>
                <span className="sector-horizon-eyebrow">
                  {config.eyebrow}
                </span>

                <h2>{config.title}</h2>
              </div>

              <div className="sector-horizon-freshness">
                <strong>
                  {config.freshness}
                </strong>

                <span>
                  {intraday
                    ? 'Updated '
                    : 'Through '}
                  {formatTimestamp(
                    horizon.updated_at_et,
                    intraday,
                  )}
                </span>
              </div>
            </header>

            <div className="sector-bars">
              {sectors.map((sector) => {
                const value =
                  sector.average_change_pct

                const magnitude = Math.max(
                  2,
                  Math.abs(value) /
                    maxAbs *
                    100,
                )

                const direction =
                  value > 0
                    ? 'positive'
                    : value < 0
                      ? 'negative'
                      : 'neutral'

                return (
                  <div
                    className="sector-bar-row"
                    key={sector.sector}
                  >
                    <div className="sector-bar-name">
                      <strong>
                        {sector.sector}
                      </strong>

                      <span>
                        {sector.stocks} stocks
                      </span>
                    </div>

                    <div className="sector-bar-value">
                      <strong
                        className={direction}
                      >
                        {formatReturn(value)}
                      </strong>
                    </div>

                    <div className="sector-bar-track">
                      <div className="sector-bar-zero" />

                      <div
                        className={[
                          'sector-bar-fill',
                          direction,
                        ].join(' ')}
                        style={{
                          width: `${magnitude / 2}%`,
                          [value >= 0
                            ? 'left'
                            : 'right']: '50%',
                        }}
                      />
                    </div>

                    <div className="sector-bar-breadth">
                      <span>
                        {sector.advancing}↑
                      </span>

                      <span>
                        {sector.declining}↓
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <footer className="sector-horizon-summary">
              <div>
                <span>LEADER</span>
                <strong>
                  {leader.sector}
                </strong>
                <b className="positive">
                  {formatReturn(
                    leader.average_change_pct,
                  )}
                </b>
              </div>

              <div>
                <span>LAGGARD</span>
                <strong>
                  {laggard.sector}
                </strong>
                <b className="negative">
                  {formatReturn(
                    laggard.average_change_pct,
                  )}
                </b>
              </div>

              <div className="sector-participation">
                <span>SECTOR PARTICIPATION</span>
                <strong>
                  <b className="positive">
                    {positive} positive
                  </b>

                  <i />

                  <b className="negative">
                    {negative} negative
                  </b>
                </strong>
              </div>
            </footer>
          </section>
        )
      })}

      <p className="sector-health-methodology">
        Equal-weight average constituent returns across
        the 11 GICS sectors represented in the S&amp;P
        500. Sector Health measures constituent
        performance and is not an official S&amp;P
        sector-index return.
      </p>
    </div>
  )
}
