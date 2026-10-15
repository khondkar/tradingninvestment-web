import { useState } from "react"
import data from "../../data/charts/snxxSndkMonthlyComparison.json"

type View = "heatmap" | "compare"
type Ticker = "SNXX" | "SNDK"

const colors = {
  SNXX: "#087BFA",
  SNDK: "#F59E0B",
}

const months = data.months

function formatReturn(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
}

export default function SnxxMonthlyComparison() {
  const [view, setView] = useState<View>("heatmap")
  const [ticker, setTicker] = useState<Ticker>("SNXX")

  const maxAbs = Math.max(
    1,
    ...months.flatMap(m => [
      Math.abs(m.snxx_return_pct),
      Math.abs(m.sndk_return_pct),
    ])
  )

  return (
    <section
      aria-labelledby="snxx-monthly-heading"
      style={{
        margin: "36px 0",
        padding: "clamp(16px, 4vw, 30px)",
        background: "#fff",
        border: "1px solid #e4e8ee",
        borderRadius: 16,
      }}
    >
      <p style={{
        margin: "0 0 8px",
        color: "#334155",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: ".09em",
      }}>
        03 / TNI HISTORICAL PERFORMANCE
      </p>

      <h2 id="snxx-monthly-heading" style={{
        margin: "0 0 8px",
        color: "#10233f",
        fontSize: "clamp(21px, 4vw, 28px)",
      }}>
        SNXX Monthly Returns & SNDK Comparison
      </h2>

      <p style={{
        color: "#334155",
        lineHeight: 1.6,
        margin: "0 0 20px",
      }}>
        January–October 2026 · Synchronized closing-price returns
      </p>

      <div style={{
        display: "flex",
        padding: 4,
        gap: 4,
        background: "#f0f3f7",
        borderRadius: 12,
        marginBottom: 18,
      }}>
        {([
          ["heatmap", "Monthly Heatmap"],
          ["compare", "Compare Both"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => setView(value)}
            style={{
              flex: 1,
              minHeight: 44,
              padding: "8px 10px",
              border: 0,
              borderRadius: 9,
              background: view === value ? "#10233f" : "transparent",
              color: view === value ? "#fff" : "#526174",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "heatmap" ? (
        <>
          <div style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
          }}>
            {(["SNXX", "SNDK"] as const).map(value => (
              <button
                key={value}
                type="button"
                aria-pressed={ticker === value}
                onClick={() => setTicker(value)}
                style={{
                  flex: 1,
                  minHeight: 44,
                  border: `2px solid ${colors[value]}`,
                  borderRadius: 10,
                  background: ticker === value ? colors[value] : "#fff",
                  color: ticker === value ? "#fff" : "#10233f",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {value}
              </button>
            ))}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          }}>
            {months.map(row => {
              const value = ticker === "SNXX"
                ? row.snxx_return_pct
                : row.sndk_return_pct

              const intensity = Math.min(
                1,
                Math.abs(value) / 80
              )

              const background = value >= 0
                ? `rgba(22, 134, 107, ${0.12 + intensity * 0.78})`
                : `rgba(209, 91, 91, ${0.12 + intensity * 0.78})`

              const darkText = intensity < 0.55

              return (
                <div key={row.month} style={{
                  minHeight: 96,
                  padding: 14,
                  borderRadius: 12,
                  background,
                  color: darkText ? "#10233f" : "#fff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 18.2, fontWeight: 700 }}>
                    {row.label}
                  </span>

                  <strong style={{
                    fontSize: "clamp(20px, 5vw, 26px)",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {formatReturn(value)}
                  </strong>

                  {row.status !== "completed" && (
                    <span style={{ fontSize: 11, fontWeight: 700 }}>
                      {row.status === "launch_partial"
                        ? "Partial launch"
                        : "Month to date"}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {months.map(row => (
            <div key={row.month}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 9,
              }}>
                <strong style={{ color: "#10233f" }}>
                  {row.label}
                </strong>
                {row.status !== "completed" && (
                  <span style={{
                    color: "#334155",
                    fontSize: 12,
                  }}>
                    {row.status === "launch_partial"
                      ? "Partial launch"
                      : "MTD"}
                  </span>
                )}
              </div>

              {([
                ["SNXX", row.snxx_return_pct],
                ["SNDK", row.sndk_return_pct],
              ] as const).map(([symbol, value]) => (
                <div key={symbol} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 8,
                }}>
                  <span style={{
                    width: 40,
                    fontSize: 11,
                    fontWeight: 800,
                    color: colors[symbol],
                  }}>
                    {symbol}
                  </span>

                  <div style={{
                    flex: 1,
                    height: 16,
                    background: "#edf0f3",
                    borderRadius: 5,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.abs(value) / maxAbs * 100}%`,
                      background: colors[symbol],
                      borderRadius: 5,
                    }} />
                  </div>

                  <strong style={{
                    width: 78,
                    fontSize: 12,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    color: value < 0 ? "#b54747" : "#10233f",
                  }}>
                    {formatReturn(value)}
                  </strong>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <p style={{
        margin: "24px 0 0",
        paddingTop: 16,
        borderTop: "1px solid #e8ecf0",
        color: "#334155",
        fontSize: 23.5,
        lineHeight: 1.7,
      }}>
        Source: Yahoo Finance historical closing prices.
        SNXX and SNDK use synchronized trading dates.
        January begins January 27, 2026, and is a partial
        launch period. October is month-to-date through
        October 15, 2026.
        <span style={{ display: "block", marginTop: 14 }}>
          Leveraged ETF monthly returns are not necessarily
          twice the underlying stock's monthly returns.
        </span>
      </p>
    </section>
  )
}
