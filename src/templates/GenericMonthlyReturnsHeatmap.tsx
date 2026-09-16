import type {
  MonthlyReturnRecord,
} from "../research/monthly-returns/types"


interface Props {
  data: MonthlyReturnRecord[]
  name: string
}


const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]


function formatReturn(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}


function cellClass(value: number) {
  const magnitude = Math.abs(value)

  let strength = "soft"

  if (magnitude >= 10) {
    strength = "strong"
  } else if (magnitude >= 5) {
    strength = "medium"
  }

  if (value > 0) {
    return `tni-heatmap-positive tni-heatmap-${strength}`
  }

  if (value < 0) {
    return `tni-heatmap-negative tni-heatmap-${strength}`
  }

  return "tni-heatmap-flat"
}


export default function GenericMonthlyReturnsHeatmap({
  data,
  name,
}: Props) {

  const years =
    Array.from(
      new Set(
        data.map(
          (row) => row.year,
        ),
      ),
    ).sort(
      (a, b) => b - a,
    )

  const lookup =
    new Map(
      data.map(
        (row) => [
          `${row.year}-${row.month}`,
          row,
        ],
      ),
    )

  return (
    <section className="tni-monthly-history">

      <div className="tni-monthly-section-header">
        <div>

          <div className="tni-monthly-section-kicker">
            MONTHLY RETURN HISTORY
          </div>

          <h2>
            {name} Monthly Returns by Year
          </h2>

          <p>
            Calendar-month price returns across
            the complete available history.
          </p>

        </div>
      </div>


      <div className="tni-monthly-heatmap-scroll">

        <table className="tni-monthly-heatmap">

          <thead>
            <tr>
              <th>Year</th>

              {MONTHS.map(
                (month) => (
                  <th key={month}>
                    {month}
                  </th>
                ),
              )}
            </tr>
          </thead>


          <tbody>

            {years.map(
              (year) => (

                <tr key={year}>

                  <th>
                    {year}
                  </th>

                  {MONTHS.map(
                    (_, index) => {

                      const month =
                        index + 1

                      const row =
                        lookup.get(
                          `${year}-${month}`,
                        )

                      return (
                        <td
                          key={
                            `${year}-${month}`
                          }
                          className={
                            row
                              ? cellClass(
                                  row.value,
                                )
                              : "tni-heatmap-empty"
                          }
                          title={
                            row
                              ? `${row.month_name} ${year}: ${formatReturn(row.value)}`
                              : undefined
                          }
                        >
                          {row
                            ? formatReturn(
                                row.value,
                              )
                            : "—"}
                        </td>
                      )
                    },
                  )}

                </tr>

              ),
            )}

          </tbody>

        </table>

      </div>

    </section>
  )
}
