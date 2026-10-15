import { useState } from "react"
import type { ComparisonPoint } from "../../../research/leveraged-etf/normalizeComparison"

const BLUE = "#087BFA"
const AMBER = "#F59E0B"
type Props = {
  etfTicker: string
  underlyingTicker: string
  data: ComparisonPoint[]
}
const W = 900, H = 350
const L = 100, R = 24, T = 22, B = 48
const PW = W - L - R, PH = H - T - B

type Range = "1M" | "3M" | "ALL"

export default function LeveragedEtfVolatilityComparison({
  etfTicker,
  underlyingTicker,
  data
}: Props) {
  const [range, setRange] = useState<Range>("ALL")
  const [selected, setSelected] = useState(data.length - 1)

  const endDate = new Date(`${data[data.length - 1].date}T12:00:00Z`)
  const cutoff = new Date(endDate)
  if (range === "1M") cutoff.setUTCMonth(cutoff.getUTCMonth() - 1)
  if (range === "3M") cutoff.setUTCMonth(cutoff.getUTCMonth() - 3)

  const start = range === "ALL" ? 0 :
    Math.max(0, data.findIndex(p => p.date >= cutoff.toISOString().slice(0, 10)))
  const visible = data.slice(start)
  const currentIndex = Math.max(start, Math.min(selected, data.length - 1))
  const active = data[currentIndex]

  const maximum = Math.max(0, ...visible.flatMap(p => [p.etf, p.underlying]))
  const minimum = Math.min(0, ...visible.flatMap(p => [p.etf, p.underlying]))
  const span = Math.max(maximum - minimum, 1)
  const pad = span * 0.08
  const bottom = Math.max(0, minimum - pad)
  const top = maximum + pad
  const y = (v: number) => T + ((top - v) / (top - bottom)) * PH
  const x = (i: number) => L + (i / Math.max(visible.length - 1, 1)) * PW
  const line = (ticker: "etf" | "underlying") =>
    visible.map((p, i) =>
      `${i ? "L" : "M"}${x(i).toFixed(2)},${y(p[ticker]).toFixed(2)}`
    ).join(" ")

  const localIndex = currentIndex - start
  const selectPointer = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setSelected(start + Math.round(fraction * (visible.length - 1)))
  }

  return (
    <section aria-labelledby="leveraged-etf-volatility-title" style={{ margin: "72px 0" }}>
      <p style={{ color: BLUE, fontSize: 23.5, fontWeight: 750, letterSpacing: ".12em" }}>
        05 / TNI RISK INTELLIGENCE
      </p>
      <h2 id="leveraged-etf-volatility-title" style={{
        fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-.035em"
      }}>
        20-Day Rolling Volatility: {etfTicker} vs {underlyingTicker}
      </h2>
      <p style={{ color: "#334155", lineHeight: 1.75 }}>
        Compare historical 20-day rolling annualized volatility.
        Tap the chart or move the slider to inspect any trading date.
      </p>

      <div style={{
        display: "flex", gap: 8, margin: "20px 0",
        flexWrap: "wrap"
      }}>
        {(["1M", "3M", "ALL"] as const).map(r => (
          <button key={r} type="button"
            onClick={() => {
              setRange(r)
              setSelected(data.length - 1)
            }}
            aria-pressed={range === r}
            style={{
              minWidth: 62, minHeight: 44, padding: "8px 16px",
              borderRadius: 10, cursor: "pointer",
              border: "1px solid #dbe3ec",
              background: range === r ? "#172033" : "#fff",
              color: range === r ? "#fff" : "#172033",
              fontWeight: 750
            }}>
            {r === "ALL" ? "All" : r}
          </button>
        ))}
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))",
        gap: 12, marginBottom: 20
      }}>
        {(["etf", "underlying"] as const).map(ticker => {
          const v = active[ticker]
          const color = ticker === "etf" ? BLUE : AMBER
          return (
            <div key={ticker} style={{
              minWidth: 0, border: "1px solid #e2e8f0",
              borderRadius: 16, padding: "14px 12px"
            }}>
              <div style={{ color, fontSize: 18.2, fontWeight: 800 }}>
                {ticker === "etf" ? etfTicker : underlyingTicker}
              </div>
              <div style={{
                fontSize: "clamp(17px,3.5vw,29px)",
                fontWeight: 800, letterSpacing: "-.035em",
                marginTop: 8, overflowWrap: "anywhere"
              }}>
                {v.toFixed(2)}%
              </div>
              <div style={{
                color: v >= 10000 ? "#15803d" : "#dc2626",
                fontSize: 13, fontWeight: 700, marginTop: 4
              }}>
                20-day annualized realized volatility
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        border: "1px solid #e2e8f0", borderRadius: 18,
        padding: "18px 12px"
      }}>
        <div style={{
          display: "flex", gap: 18, marginBottom: 12,
          fontSize: 14, fontWeight: 750
        }}>
          <span style={{ color: BLUE }}>● {etfTicker}</span>
          <span style={{ color: AMBER }}>● {underlyingTicker}</span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} width="100%"
          role="img"
          aria-label={`Interactive rolling volatility comparison of ${etfTicker} and ${underlyingTicker}`}
          style={{ display: "block", touchAction: "pan-y" }}>
          {Array.from({ length: 5 }, (_, i) => {
            const value = bottom + (top - bottom) * (4 - i) / 4
            const yy = y(value)
            return (
              <g key={i}>
                <line x1={L} x2={W - R} y1={yy} y2={yy}
                  stroke="#e2e8f0" strokeDasharray="4 6" />
                <text x={L - 12} y={yy + 5} textAnchor="end"
                  fontSize="18" fill="#64748b">
                  {value.toFixed(0)}%
                </text>
              </g>
            )
          })}

          <path d={line("etf")} stroke={BLUE} strokeWidth="3.5"
            fill="none" strokeLinejoin="round" />
          <path d={line("underlying")} stroke={AMBER} strokeWidth="3.5"
            fill="none" strokeLinejoin="round" />

          <line x1={x(localIndex)} x2={x(localIndex)}
            y1={T} y2={H - B} stroke="#64748b"
            strokeDasharray="5 5" />

          {(["etf", "underlying"] as const).map(ticker => (
            <circle key={ticker}
              cx={x(localIndex)} cy={y(active[ticker])} r="6"
              fill={ticker === "etf" ? BLUE : AMBER}
              stroke="#fff" strokeWidth="2" />
          ))}

          <rect x={L} y={T} width={PW} height={PH}
            fill="transparent"
            onPointerDown={selectPointer}
            onPointerMove={e => {
              if (e.buttons === 1) selectPointer(e)
            }} />

          <text x={L} y={H - 10} fontSize="17" fill="#64748b">
            {visible[0].date}
          </text>
          <text x={W - R} y={H - 10} fontSize="17"
            textAnchor="end" fill="#64748b">
            {visible[visible.length - 1].date}
          </text>
        </svg>

        <input type="range" min={start} max={data.length - 1}
          value={currentIndex}
          onChange={e => setSelected(Number(e.target.value))}
          aria-label="Select comparison trading date"
          style={{
            width: "100%", minHeight: 44,
            accentColor: BLUE, cursor: "pointer"
          }} />

        <div style={{
          textAlign: "center", color: "#334155",
          fontSize: 14, lineHeight: 1.8
        }}>
          <strong>{active.date}</strong>
          <div>
            <span style={{ color: BLUE }}>{etfTicker} {active.etf.toFixed(2)}%</span>
            {" · "}
            <span style={{ color: AMBER }}>{underlyingTicker} {active.underlying.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <p style={{
        color: "#334155", fontSize: 25.5,
        lineHeight: 1.8, marginTop: 18
      }}>
        Annualized realized volatility is the sample standard deviation
        of 20 daily adjusted-close returns multiplied by the square root
        of 252. Values are historical measurements, not forecasts.
      </p>
    </section>
  )
}
