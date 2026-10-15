import { useState } from "react"
import risk from "../../data/charts/snxxSndkRiskComparison.json"

const BLUE = "#087BFA"
const AMBER = "#F59E0B"

const points = risk.data
const W = 900
const H = 340
const LEFT = 82
const RIGHT = 20
const TOP = 20
const BOTTOM = 48
const CW = W - LEFT - RIGHT
const CH = H - TOP - BOTTOM

const lowest = Math.min(
  -10,
  ...points.flatMap(p => [p.snxx, p.sndk])
)
const floor = Math.floor(lowest / 20) * 20

const x = (i: number) =>
  LEFT + (i / Math.max(points.length - 1, 1)) * CW

const y = (v: number) =>
  TOP + (-v / -floor) * CH

const path = (ticker: "snxx" | "sndk") =>
  points.map((p, i) =>
    `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(p[ticker]).toFixed(2)}`
  ).join(" ")

const percent = (v: number) => `${v.toFixed(2)}%`

export default function SnxxRiskComparison() {
  const [selected, setSelected] = useState(points.length - 1)
  const active = points[selected]

  const selectFromPointer = (
    event: React.PointerEvent<SVGRectElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const fraction = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width)
    )
    setSelected(Math.round(fraction * (points.length - 1)))
  }

  return (
    <section
      aria-labelledby="snxx-risk-title"
      style={{ margin: "72px 0" }}
    >
      <p style={{
        color: BLUE,
        fontSize: 23.5,
        fontWeight: 750,
        letterSpacing: ".12em"
      }}>
        05 / TNI QUANTITATIVE RESEARCH
      </p>

      <h2
        id="snxx-risk-title"
        style={{
          fontSize: "clamp(26px,4vw,38px)",
          letterSpacing: "-.035em"
        }}
      >
        SNXX vs SNDK: Drawdowns &amp; Volatility
      </h2>

      <p style={{ color: "#334155", lineHeight: 1.75 }}>
        Historical declines from previous closing-price peaks,
        compared across the same trading dates.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
        gap: 12,
        margin: "24px 0"
      }}>
        {(["snxx", "sndk"] as const).map(ticker => {
          const stats = risk.summary[ticker]
          const color = ticker === "snxx" ? BLUE : AMBER

          return (
            <div key={ticker} style={{
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 16,
              minWidth: 0
            }}>
              <strong style={{ color }}>
                {ticker.toUpperCase()}
              </strong>

              <div style={{
                fontSize: "clamp(20px,3vw,29px)",
                fontWeight: 800,
                color: "#dc2626",
                marginTop: 12
              }}>
                {percent(stats.max_drawdown_pct)}
              </div>

              <div style={{
                color: "#334155",
                fontSize: 12
              }}>
                Maximum drawdown
              </div>

              <div style={{
                fontSize: 28.0,
                fontWeight: 750,
                marginTop: 16,
                color: "#172033"
              }}>
                {percent(stats.annualized_volatility_pct)}
              </div>

              <div style={{
                color: "#334155",
                fontSize: 12
              }}>
                Annualized volatility
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: "18px 12px"
      }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
          fontSize: 14,
          fontWeight: 750,
          marginBottom: 14
        }}>
          <span style={{ color: BLUE }}>● SNXX</span>
          <span style={{ color: AMBER }}>● SNDK</span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label="Interactive historical drawdown comparison between SNXX and SNDK"
          style={{ display: "block", touchAction: "pan-y" }}
        >
          {Array.from({ length: 5 }, (_, i) => {
            const value = floor * i / 4
            const yy = y(value)

            return (
              <g key={i}>
                <line
                  x1={LEFT}
                  x2={W - RIGHT}
                  y1={yy}
                  y2={yy}
                  stroke="#e2e8f0"
                  strokeDasharray="4 6"
                />
                <text
                  x={LEFT - 12}
                  y={yy + 5}
                  textAnchor="end"
                  fontSize="18"
                  fill="#64748b"
                >
                  {value.toFixed(0)}%
                </text>
              </g>
            )
          })}

          <path
            d={path("snxx")}
            stroke={BLUE}
            strokeWidth="3.5"
            fill="none"
            strokeLinejoin="round"
          />

          <path
            d={path("sndk")}
            stroke={AMBER}
            strokeWidth="3.5"
            fill="none"
            strokeLinejoin="round"
          />

          <line
            x1={x(selected)}
            x2={x(selected)}
            y1={TOP}
            y2={H - BOTTOM}
            stroke="#64748b"
            strokeDasharray="5 5"
          />

          <circle
            cx={x(selected)}
            cy={y(active.snxx)}
            r="6"
            fill={BLUE}
            stroke="#fff"
            strokeWidth="2"
          />

          <circle
            cx={x(selected)}
            cy={y(active.sndk)}
            r="6"
            fill={AMBER}
            stroke="#fff"
            strokeWidth="2"
          />

          <rect
            x={LEFT}
            y={TOP}
            width={CW}
            height={CH}
            fill="transparent"
            onPointerDown={selectFromPointer}
            onPointerMove={event => {
              if (event.buttons === 1) selectFromPointer(event)
            }}
          />

          <text
            x={LEFT}
            y={H - 10}
            fontSize="17"
            fill="#64748b"
          >
            {risk.start_date}
          </text>

          <text
            x={W - RIGHT}
            y={H - 10}
            fontSize="17"
            textAnchor="end"
            fill="#64748b"
          >
            {risk.end_date}
          </text>
        </svg>

        <input
          type="range"
          min={0}
          max={points.length - 1}
          value={selected}
          onChange={e => setSelected(Number(e.target.value))}
          aria-label="Select historical trading date"
          style={{
            width: "100%",
            minHeight: 44,
            accentColor: BLUE,
            cursor: "pointer"
          }}
        />

        <div style={{
          textAlign: "center",
          fontSize: 14,
          lineHeight: 1.8,
          color: "#334155"
        }}>
          <strong>{active.date}</strong>
          <div>
            <span style={{ color: BLUE }}>
              SNXX: {percent(active.snxx)}
            </span>
            {" · "}
            <span style={{ color: AMBER }}>
              SNDK: {percent(active.sndk)}
            </span>
          </div>
        </div>
      </div>

      <p style={{
        color: "#334155",
        fontSize: 25.5,
        lineHeight: 1.8,
        marginTop: 18
      }}>
        Drawdowns are calculated from prior closing-price peaks.
        Annualized realized volatility uses the standard deviation
        of daily returns multiplied by the square root of 252.
        Historical measurements do not predict future risk.
      </p>
    </section>
  )
}
