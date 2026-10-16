import { useState } from "react"
import data from "../../data/charts/snxxHourlyWeekdayReturns.json"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const
type Day = typeof days[number]

const pct = (value: number | null, signed = true) =>
  value == null ? "—" : `${signed && value > 0 ? "+" : ""}${value.toFixed(2)}%`

export default function SnxxHourlyReturns() {
  const [selected, setSelected] = useState<Day>("Monday")
  const current = data.weekdays[selected]
  const count = current.sampleSize

  return (
    <section
      id="snxx-hourly-returns"
      aria-labelledby="snxx-hourly-title"
      style={{
        margin: "72px 0",
        maxWidth: 860,
        fontFamily: "inherit",
        fontSize: "clamp(18px, 2vw, 21px)",
        lineHeight: 1.85,
        color: "#172033"
      }}
    >
      <p style={{
        color: "#087BFA", fontSize: "clamp(18px, 2vw, 21px)",
        fontWeight: 750, letterSpacing: ".12em"
      }}>
        TNI INTRADAY RESEARCH
      </p>

      <h2 id="snxx-hourly-title" style={{
        fontSize: "clamp(26px,4vw,38px)",
        letterSpacing: "-.035em", lineHeight: 1.2
      }}>
        SNXX Hourly Return Patterns
      </h2>

      <p style={{
        color: "#263449", fontSize: "clamp(18px,2vw,21px)", lineHeight: 1.85
      }}>
        Historical intraday performance across seven trading intervals.
        Select a weekday to compare positive and negative sessions.
      </p>

      <div role="group" aria-label="Select weekday" style={{
        display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))",
        gap: 6, margin: "28px 0 18px"
      }}>
        {days.map(day => (
          <button
            key={day}
            type="button"
            aria-pressed={selected === day}
            onClick={() => setSelected(day)}
            style={{
              minWidth: 0, minHeight: 48, fontFamily: "inherit",
              border: selected === day
                ? "3px solid #087BFA"
                : "2px solid #087BFA",
              borderRadius: 10,
              background: selected === day ? "#eff6ff" : "#fff",
              color: selected === day ? "#075bb8" : "#334155",
              fontWeight: selected === day ? 750 : 600,
              fontSize: "clamp(18px, 2vw, 21px)",
              cursor: "pointer"
            }}
          >
            <span aria-hidden="true">{day.slice(0, 3)}</span>
            <span className="sr-only">{day}</span>
          </button>
        ))}
      </div>

      <p aria-live="polite" style={{
        color: "#263449", fontSize: "clamp(18px, 2vw, 21px)", marginBottom: 24
      }}>
        {selected} · {count} complete sessions ·
        {" "}{current.firstDate ?? "—"} to {current.lastDate ?? "—"}
      </p>

      <div style={{
        display: "flex", gap: 20, flexWrap: "wrap",
        fontSize: "clamp(18px, 2vw, 21px)", marginBottom: 24
      }}>
        <span><span style={{ color: "#159461" }}>●</span> Positive sessions</span>
        <span><span style={{ color: "#d94c55" }}>●</span> Negative sessions</span>
      </div>

      <div style={{ display: "grid", gap: 24 }}>
        {current.intervals.map((interval, i) => {
          const positive = count ? interval.positiveCount / count * 100 : 0
          const negative = count ? interval.negativeCount / count * 100 : 0
          const neutral = count ? interval.neutralCount / count * 100 : 0

          return (
            <div key={interval.start} style={{
              borderBottom: i === 6 ? "none" : "1px solid #edf1f5",
              paddingBottom: 18
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "baseline", gap: 12, flexWrap: "wrap",
                marginBottom: 8
              }}>
                <strong style={{ fontSize: "clamp(18px, 2vw, 21px)" }}>
                  {interval.start}–{interval.end} ET
                </strong>
                <span style={{ fontSize: "clamp(18px, 2vw, 21px)", color: "#263449" }}>
                  Overall avg: <strong style={{
                    color: interval.averageReturnPct == null
                      ? "#475569"
                      : interval.averageReturnPct >= 0 ? "#16845b" : "#cb424e"
                  }}>
                    {pct(interval.averageReturnPct)}
                  </strong>
                </span>
              </div>

              <div
                role="img"
                aria-label={`${interval.positiveCount} positive, ${interval.negativeCount} negative and ${interval.neutralCount} neutral sessions`}
                style={{
                  height: 22, display: "flex",
                  overflow: "hidden", borderRadius: 5,
                  background: "#edf1f5"
                }}
              >
                <div style={{ width: `${positive}%`, background: "#159461" }} />
                <div style={{ width: `${negative}%`, background: "#d94c55" }} />
                <div style={{ width: `${neutral}%`, background: "#cbd5e1" }} />
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between",
                gap: 12, marginTop: 8, fontSize: "clamp(18px, 2vw, 21px)", flexWrap: "wrap"
              }}>
                <span style={{ color: "#16845b" }}>
                  {interval.positiveCount}/{count} positive ({positive.toFixed(0)}%)
                </span>
                <span style={{ color: "#cb424e" }}>
                  {interval.negativeCount}/{count} negative ({negative.toFixed(0)}%)
                </span>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between",
                gap: 12, marginTop: 6, fontSize: "clamp(18px, 2vw, 21px)", flexWrap: "wrap"
              }}>
                <span>Avg gain: <strong style={{ color: "#16845b" }}>
                  {pct(interval.averageGainPct)}
                </strong></span>
                <span>Avg loss: <strong style={{ color: "#cb424e" }}>
                  {pct(interval.averageLossPct)}
                </strong></span>
              </div>
            </div>
          )
        })}
      </div>

      <p style={{
        marginTop: 28, paddingTop: 18,
        borderTop: "1px solid #e2e8f0",
        fontSize: "clamp(18px, 2vw, 21px)", lineHeight: 1.85, color: "#263449"
      }}>
        Source: Yahoo Finance, 30-minute intraday OHLC.
        Each interval return uses its opening price and final
        30-minute candle closing price. Results use up to 20
        available complete sessions per weekday; actual sample
        counts are shown. Returns are descriptive, not predictive.
        No trading costs or slippage are included.
      </p>
    </section>
  )
}
