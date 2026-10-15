import { useState } from "react"
import data from "../../data/charts/snxxSndkWeekdayComparison.json"

type Ticker = "SNXX" | "SNDK"
type Metric = "frequency" | "return"

const green = "#16866b"
const red = "#d15b5b"
const tickerColors = { SNXX: "#087BFA", SNDK: "#F59E0B" } as const

export default function SnxxWeekdayComparison() {
  const [ticker, setTicker] = useState<Ticker>("SNXX")
  const [metric, setMetric] = useState<Metric>("frequency")

  const rows = data.tickers[ticker]
  const maxReturn = Math.max(
    1,
    ...rows.map(row => Math.abs(row.average_return_pct ?? 0))
  )

  const buttonStyle = (active: boolean) => ({
    flex: 1,
    minHeight: 44,
    border: "none",
    borderRadius: 9,
    background: active ? "#10233f" : "transparent",
    color: active ? "#fff" : "#526174",
    fontWeight: 700,
    cursor: "pointer",
  })

  return (
    <section
      aria-labelledby="snxx-weekday-heading"
      style={{
        margin: "36px 0",
        padding: "clamp(16px, 4vw, 30px)",
        border: "1px solid #e4e8ee",
        borderRadius: 16,
        background: "#fff",
      }}
    >
      <p style={{
        margin: "0 0 8px",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: ".09em",
        color: "#334155",
      }}>
        02 / TNI QUANTITATIVE RESEARCH
      </p>

      <h2 id="snxx-weekday-heading" style={{
        margin: "0 0 8px",
        fontSize: "clamp(21px, 4vw, 28px)",
        color: "#10233f",
      }}>
        SNXX vs SNDK: Which Weekdays Perform Best?
      </h2>

      <p style={{ color: "#334155", lineHeight: 1.6 }}>
        181 synchronized daily returns · January 28–October 15, 2026
      </p>

      <div style={{
        display: "flex",
        padding: 4,
        gap: 4,
        borderRadius: 12,
        background: "#f0f3f7",
        marginBottom: 12,
      }}>
        {(["SNXX", "SNDK"] as const).map(value => (
          <button
            key={value}
            type="button"
            aria-pressed={ticker === value}
            onClick={() => setTicker(value)}
            style={{
              ...buttonStyle(ticker === value),
              background: ticker === value ? tickerColors[value] : "#fff",
              color: ticker === value ? "#fff" : "#10233f",
              border: `2px solid ${tickerColors[value]}`,
              fontSize: 21.0,
            }}
          >
            {value}
            <span style={{
              display: "block",
              fontSize: 10,
              fontWeight: 500,
              marginTop: 3,
            }}>
              {value === "SNXX" ? "2× Leveraged ETF" : "Underlying Stock"}
            </span>
          </button>
        ))}
      </div>

      <div style={{
        display: "flex",
        padding: 4,
        gap: 4,
        borderRadius: 12,
        background: "#f0f3f7",
        marginBottom: 24,
      }}>
        {([
          ["frequency", "Up / Down %"],
          ["return", "Avg Daily Return"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={metric === value}
            onClick={() => setMetric(value)}
            style={buttonStyle(metric === value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 22 }}>
        {rows.map(row => {
          const average = row.average_return_pct ?? 0
          return (
            <div key={row.day}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 9,
              }}>
                <strong style={{ color: "#10233f" }}>
                  {row.day}
                </strong>
                <span style={{
                  fontSize: 13,
                  color: "#334155",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}>
                  {metric === "frequency"
                    ? `${row.up_pct?.toFixed(1)}% up · ${row.down_pct?.toFixed(1)}% down`
                    : `${average >= 0 ? "+" : ""}${average.toFixed(2)}% avg`}
                </span>
              </div>

              {metric === "frequency" ? (
                <div
                  role="img"
                  aria-label={`${row.day}: ${row.up_pct?.toFixed(1)}% positive, ${row.down_pct?.toFixed(1)}% negative`}
                  style={{
                    display: "flex",
                    height: 30,
                    overflow: "hidden",
                    borderRadius: 7,
                    background: "#d7dce2",
                  }}
                >
                  <div style={{
                    width: `${row.up_pct ?? 0}%`,
                    background: green,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 0,
                  }}>
                    <span style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {row.up_pct?.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{
                    width: `${row.down_pct ?? 0}%`,
                    background: red,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 0,
                  }}>
                    <span style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {row.down_pct?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  height: 17,
                  overflow: "hidden",
                  borderRadius: 5,
                  background: "#e7ebef",
                }}>
                  <div style={{
                    width: `${Math.abs(average) / maxReturn * 100}%`,
                    height: "100%",
                    background: tickerColors[ticker],
                    borderRadius: 5,
                  }} />
                </div>
              )}

              <p style={{
                margin: "8px 0 0",
                fontSize: 23.5,
                color: "#334155",
                lineHeight: 1.6,
              }}>
                {row.observations} sessions · Avg gain:{" "}
                {row.average_positive_return_pct?.toFixed(2) ?? "—"}%
                {" · "}Avg loss:{" "}
                {row.average_negative_return_pct?.toFixed(2) ?? "—"}%
              </p>
            </div>
          )
        })}
      </div>

      <div style={{
        marginTop: 24,
        padding: "16px 0",
        borderTop: "1px solid #e8ecf0",
      }}>
        <strong style={{ color: "#10233f", fontSize: 14 }}>
          What does the data show?
        </strong>
        <p style={{ color: "#334155", fontSize: 25.5, lineHeight: 1.7 }}>
          Thursday has the highest average daily return for both
          SNXX (+3.31%) and SNDK (+1.66%). Tuesday has the lowest
          average for both. These historical averages are descriptive,
          not predictions of future performance.
        </p>
      </div>

      <p style={{
        margin: "0",
        paddingTop: 16,
        borderTop: "1px solid #e8ecf0",
        fontSize: 23.5,
        color: "#334155",
        lineHeight: 1.7,
      }}>
        Source: Yahoo Finance daily closing prices. Both securities
        use identical trading dates. Up/down percentages exclude
        unchanged sessions from those categories. Limited historical
        observations do not establish a reliable weekday trading edge.
      </p>
    </section>
  )
}
