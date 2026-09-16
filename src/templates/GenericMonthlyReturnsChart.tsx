import type {
  MonthlyReturnStatistic,
} from "../research/monthly-returns/types"


interface Props {
  statistics: MonthlyReturnStatistic[]
  name: string
}


function formatReturn(
  value: number,
) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}


export default function GenericMonthlyReturnsChart({
  statistics,
  name,
}: Props) {

  const maxMagnitude =
    Math.max(
      ...statistics.map(
        (row) =>
          Math.abs(
            row.average_return_pct,
          ),
      ),
      1,
    )

  return (
    <section
      className="tni-monthly-chart-card"
      aria-label={`${name} average return by calendar month`}
    >
      <div className="tni-monthly-section-header">
        <div>
          <div className="tni-monthly-section-kicker">
            MONTH-BY-MONTH PERFORMANCE
          </div>

          <h2>
            Average Return by Calendar Month
          </h2>

          <p>
            Historical average price return for
            each calendar month.
          </p>
        </div>
      </div>

      <div className="tni-monthly-bar-chart">
        {statistics.map((row) => {

          const value =
            row.average_return_pct

          const magnitude =
            Math.max(
              4,
              Math.abs(value) /
                maxMagnitude *
                100,
            )

          return (
            <div
              className="tni-monthly-bar-column"
              key={row.month}
            >
              <div className="tni-monthly-bar-value">
                {formatReturn(value)}
              </div>

              <div className="tni-monthly-bar-track">
                <div
                  className={
                    value >= 0
                      ? "tni-monthly-bar tni-monthly-bar-positive"
                      : "tni-monthly-bar tni-monthly-bar-negative"
                  }
                  style={{
                    height:
                      `${magnitude}%`,
                  }}
                  title={
                    `${row.month_name}: ${formatReturn(value)} average return`
                  }
                />
              </div>

              <div className="tni-monthly-bar-label">
                {row.month_name.slice(
                  0,
                  3,
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
