import SnxxWeekdayComparison from "../components/research/SnxxWeekdayComparison"
import LeveragedEtfMonthlyComparison from "../components/research/leveraged-etf/LeveragedEtfMonthlyComparison"
import { normalizeComparison } from "../research/leveraged-etf/normalizeComparison"
import growth from "../data/charts/snxxSndkGrowthComparison.json"
import risk from "../data/charts/snxxSndkRiskComparison.json"
import weekdays from "../data/charts/snxxSndkWeekdayComparison.json"
import monthly from "../data/charts/snxxSndkMonthlyComparison.json"
import SnxxGrowthComparison from "../components/research/SnxxGrowthComparison"
import SnxxRiskComparison from "../components/research/SnxxRiskComparison"
import LeveragedEtfVolatilityComparison from "../components/research/leveraged-etf/LeveragedEtfVolatilityComparison"
import volatility from "../data/charts/snxxSndkRollingVolatility.json"


const comparison = normalizeComparison({
  etfTicker: "SNXX",
  underlyingTicker: "SNDK",
  growth,
  drawdown: risk,
  weekdays,
  monthly
})

export default function SnxxResearchPage() {
  return (
    <main
      id="main-content"
      style={{
        maxWidth: 1080,
        fontSize: "clamp(18px, 2vw, 21px)",
        lineHeight: 1.85,
        margin: "0 auto",
        padding: "clamp(24px, 5vw, 64px) 16px 96px",
        color: "#172033",
      }}
    >
      <article>
        <header style={{ marginBottom: 80 }}>
          <p style={{
            fontSize: 23.5,
            fontWeight: 750,
            letterSpacing: "0.12em",
            color: "#087BFA",
          }}>
            TNI LEVERAGED ETF INTELLIGENCE
          </p>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 54px)",
            lineHeight: 1.12,
            letterSpacing: "-0.04em",
            margin: "16px 0 24px",
          }}>
            SNXX ETF: Monthly Returns, Weekday Performance
            &amp; SNDK Comparison (2026)
          </h1>

          <p style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            lineHeight: 1.8,
            color: "#263449",
            maxWidth: 760,
          }}>
            Explore the historical performance of the Tradr 2X Long
            SNDK Daily ETF (SNXX), including weekday return patterns,
            monthly performance, and comparisons with SanDisk (SNDK).
            The analysis uses available 2026 closing-price data.
          </p>
        </header>

        <section style={{ marginBottom: 80 }}>
          <h2 style={{
            fontSize: "clamp(24px, 3vw, 34px)",
            letterSpacing: "-0.03em",
          }}>
            Understanding SNXX
          </h2>

          <p style={{ lineHeight: 1.85, color: "#263449" }}>
            SNXX seeks leveraged daily exposure to SNDK.
            Its daily reset means that returns over multiple days
            can differ substantially from twice SNDK's cumulative
            performance. Volatility, compounding, financing costs,
            and fund expenses can affect investor outcomes.
          </p>
        </section>

        <SnxxWeekdayComparison />
        <LeveragedEtfMonthlyComparison
          etfTicker="SNXX"
          underlyingTicker="SNDK"
          months={comparison.months}
          periodLabel="January–October 2026"
          methodology="Source: Yahoo Finance adjusted closing prices. Both securities use synchronized trading dates. January is a partial launch period beginning January 27, 2026. October is month-to-date through October 15, 2026."
        />
        <SnxxGrowthComparison />
        <SnxxRiskComparison />

        <figure style={{
          margin: "28px 0 72px",
          padding: 0
        }}>
          <img
            src="/images/social/snxx-vs-sndk-drawdown-og.png"
            alt="TNI research chart comparing SNXX and SNDK historical drawdowns, including maximum drawdowns of 85.09% and 56.49% respectively"
            loading="lazy"
            decoding="async"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              borderRadius: 16,
              border: "1px solid #e2e8f0"
            }}
          />
          <figcaption style={{
            marginTop: 12,
            fontSize: 13,
            lineHeight: 1.6,
            color: "#64748b"
          }}>
            TNI Research · SNXX vs SNDK historical drawdowns · January–October 2026
          </figcaption>
        </figure>

        <a
          href="/images/social/snxx-vs-sndk-drawdown-og.png"
          download="TNI-SNXX-vs-SNDK-Drawdowns.png"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 18px",
            borderRadius: 10,
            background: "#07152f",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            marginBottom: 64
          }}
        >
          ↓ Download TNI Drawdown Chart
        </a>

        <LeveragedEtfVolatilityComparison
          etfTicker="SNXX"
          underlyingTicker="SNDK"
          data={volatility.data.map(p => ({
            date: p.date,
            etf: p.snxx,
            underlying: p.sndk
          }))}
        />

        <section
          id="snxx-daily-leverage"
          aria-labelledby="snxx-leverage-title"
          style={{ margin: "72px 0", maxWidth: 860 }}
        >
          <p style={{
            color: "#087BFA",
            fontSize: 23.5,
            fontWeight: 750,
            letterSpacing: ".12em",
          }}>
            06 / TNI INVESTOR EDUCATION
          </p>

          <h2
            id="snxx-leverage-title"
            style={{
              fontSize: "clamp(26px,4vw,38px)",
              letterSpacing: "-.035em",
            }}
          >
            How SNXX Daily 2× Leverage Works
          </h2>

          <p style={{ lineHeight: 1.85, color: "#263449" }}>
            SNXX targets approximately twice the daily performance
            of SNDK, before fees and expenses. Its leverage resets
            each trading day. The objective does not promise twice
            SNDK's cumulative return over a week, month, or year.
          </p>

          <h3 style={{ fontSize: 32.2, marginTop: 32 }}>
            Why Compounding Changes the Result
          </h3>

          <p style={{ lineHeight: 1.85, color: "#263449" }}>
            Imagine SNDK rises 10% on the first day, then falls
            approximately 9.09% on the second. SNDK returns to its
            starting value. An idealized daily 2× investment rises
            20%, then falls approximately 18.18%, finishing below
            its initial value.
          </p>

          <div style={{
            overflowX: "auto",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            margin: "24px 0",
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "right",
              minWidth: 320,
              fontVariantNumeric: "tabular-nums",
            }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th scope="col" style={{
                    padding: 14, textAlign: "left",
                  }}>Illustrative scenario</th>
                  <th scope="col" style={{
                    padding: 14, color: "#F59E0B",
                  }}>SNDK</th>
                  <th scope="col" style={{
                    padding: 14, color: "#087BFA",
                  }}>Daily 2×</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Starting value", "$100", "$100"],
                  ["Day 1", "+10%", "+20%"],
                  ["Day 2", "−9.09%", "−18.18%"],
                  ["Ending value", "$100.00", "$98.18"],
                  ["Cumulative return", "0.00%", "−1.82%"],
                ].map(([label, sndk, snxx]) => (
                  <tr key={label} style={{
                    borderTop: "1px solid #e2e8f0",
                  }}>
                    <th scope="row" style={{
                      padding: 14,
                      textAlign: "left",
                      fontWeight: 600,
                    }}>{label}</th>
                    <td style={{ padding: 14 }}>{sndk}</td>
                    <td style={{ padding: 14 }}>{snxx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{
            fontSize: 25.5,
            lineHeight: 1.8,
            color: "#334155",
          }}>
            Hypothetical illustration, not actual SNXX trading
            results. Rounded figures assume perfect daily 2×
            exposure and exclude fees, financing costs, tracking
            error, and distributions.
          </p>

          <h3 style={{ fontSize: 23, marginTop: 32 }}>
            Volatility Drag and Path Dependence
          </h3>

          <p style={{ lineHeight: 1.85, color: "#263449" }}>
            Leveraged returns depend on the sequence of daily price
            movements, not just the starting and ending prices.
            Repeated reversals can erode value, even when the
            underlying stock finishes near its starting level.
          </p>

          <p style={{ lineHeight: 1.85, color: "#263449" }}>
            Strong, persistent trends can produce favorable
            compounding, while volatile sideways markets can
            produce unfavorable compounding. Neither outcome
            is guaranteed. SNXX also carries concentrated
            single-stock exposure and leveraged downside risk.
          </p>
        </section>



        <section id="snxx-fund-facts"
          aria-labelledby="snxx-facts-title"
          style={{ margin: "72px 0", maxWidth: 860 }}>
          <p style={{ color: "#087BFA", fontSize: 23.5,
            fontWeight: 750, letterSpacing: ".12em" }}>
            07 / FUND REFERENCE
          </p>
          <h2 id="snxx-facts-title" style={{
            fontSize: "clamp(26px,4vw,38px)",
            letterSpacing: "-.035em"
          }}>
            SNXX ETF Fund Facts
          </h2>
          <p style={{ color: "#263449", lineHeight: 1.85 }}>
            SNXX seeks approximately twice the daily performance
            of SanDisk (SNDK), before fees and expenses. The daily
            leverage objective does not apply to longer periods.
          </p>
          <div style={{
            border: "1px solid #e2e8f0",
            borderRadius: 16, overflow: "hidden", marginTop: 24
          }}>
            {[
              ["Ticker", "SNXX"],
              ["Fund name", "Tradr 2X Long SNDK Daily ETF"],
              ["Underlying", "SanDisk (SNDK)"],
              ["Daily leverage objective", "2× long"],
              ["Historical sample", "Jan 27 – Oct 15, 2026"],
              ["Official inception", "Issuer verification pending"],
              ["Expense ratio", "Issuer verification pending"],
              ["Assets under management", "Issuer verification pending"],
            ].map(([label, value], index) => (
              <div key={label} style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) minmax(0,1.3fr)",
                gap: 12, padding: "14px 16px",
                borderTop: index ? "1px solid #e2e8f0" : "none",
                background: index % 2 ? "#f8fafc" : "#fff",
                fontSize: 19.6, lineHeight: 1.6
              }}>
                <strong style={{ color: "#334155" }}>{label}</strong>
                <span style={{
                  color: "#263449", overflowWrap: "anywhere"
                }}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="snxx-investment-risks"
          aria-labelledby="snxx-risks-title"
          style={{ margin: "72px 0", maxWidth: 860 }}>
          <p style={{ color: "#087BFA", fontSize: 23.5,
            fontWeight: 750, letterSpacing: ".12em" }}>
            08 / RISK INTELLIGENCE
          </p>
          <h2 id="snxx-risks-title" style={{
            fontSize: "clamp(26px,4vw,38px)",
            letterSpacing: "-.035em"
          }}>
            Key Risks of Holding SNXX
          </h2>
          {[
            ["Leveraged downside",
              "SNXX can magnify adverse daily moves in SNDK, creating the potential for substantial losses."],
            ["Volatility and compounding",
              "Multi-day results depend on the path of daily returns and can differ substantially from twice SNDK's cumulative performance."],
            ["Single-stock concentration",
              "Exposure is concentrated in SanDisk rather than a diversified basket of companies."],
            ["Tracking and financing",
              "Fees, financing, derivatives, and tracking differences can affect realized returns."],
            ["Trading liquidity",
              "Bid-ask spreads, trading volume, and market conditions can influence execution costs."],
          ].map(([heading, body]) => (
            <div key={heading} style={{
              padding: "18px 0",
              borderBottom: "1px solid #e2e8f0"
            }}>
              <h3 style={{ fontSize: 19, margin: "0 0 8px" }}>
                {heading}
              </h3>
              <p style={{
                color: "#263449", lineHeight: 1.85, margin: 0
              }}>{body}</p>
            </div>
          ))}
        </section>

        <section id="snxx-faq"
          aria-labelledby="snxx-faq-title"
          style={{ margin: "72px 0", maxWidth: 860 }}>
          <p style={{ color: "#087BFA", fontSize: 23.5,
            fontWeight: 750, letterSpacing: ".12em" }}>
            09 / INVESTOR QUESTIONS
          </p>
          <h2 id="snxx-faq-title" style={{
            fontSize: "clamp(26px,4vw,38px)",
            letterSpacing: "-.035em"
          }}>
            SNXX ETF: Frequently Asked Questions
          </h2>
          {[
            ["What does SNXX track?",
              "SNXX seeks approximately twice SNDK's daily performance, before fees and expenses."],
            ["Does SNXX return twice as much as SNDK each month?",
              "Not necessarily. Its 2× objective applies daily. Compounding can create substantial differences over longer periods."],
            ["Why compare SNXX and SNDK on the same dates?",
              "A synchronized period gives both investments the same starting and ending dates."],
            ["Can weekday patterns predict future returns?",
              "No. The statistics describe a limited historical sample, not a verified predictive trading strategy."],
            ["Does the $10,000 chart include dividends?",
              "The chart uses closing-price returns and does not independently reinvest distributions."],
            ["Why are annual returns not included?",
              "The available research sample begins in January 2026 and does not yet include a completed calendar year."],
          ].map(([question, answer]) => (
            <details key={question} style={{
              padding: "18px 0",
              borderBottom: "1px solid #e2e8f0"
            }}>
              <summary style={{
                cursor: "pointer", fontWeight: 750,
                color: "#172033", fontSize: 17,
                lineHeight: 1.6
              }}>{question}</summary>
              <p style={{
                color: "#263449", lineHeight: 1.85
              }}>{answer}</p>
            </details>
          ))}
        </section>

        <footer style={{
          marginTop: 64,
          borderTop: "1px solid #e5e7eb",
          paddingTop: 24,
          fontSize: 18.2,
          lineHeight: 1.8,
          color: "#334155",
        }}>
          <strong>Research methodology.</strong> Historical returns
          are calculated from available closing prices. January
          2026 represents a partial launch-period comparison;
          October 2026 is month-to-date through October 15.
          Historical patterns are descriptive, not predictive.
          Leveraged ETFs involve substantial risk.
        </footer>
      </article>
    </main>
  )
}
