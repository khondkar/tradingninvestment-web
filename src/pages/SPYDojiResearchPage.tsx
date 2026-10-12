import DojiReversalContinuation from '../components/research/doji/DojiReversalContinuation'
import { useEffect } from 'react'
import {
  DojiDecadeChart,
  DojiContextChart,
  DojiBootstrapChart,
  DojiUnconditionalChart,
  DojiConfirmationChart,
  DojiStatisticalChart,
} from '../components/research/doji/SPYDojiCharts'

import '../components/research/doji/SPYDojiCharts.css'
import './SPYDojiResearchPage.css'

const canonicalPath = '/research/doji-candlestick-spy-26-year-study/'

export default function SPYDojiResearchPage() {
  useEffect(() => {
    document.title =
      'Does the Doji Candlestick Really Work? A 26-Year SPY Study | TradingNInvestment'

    let canonical =
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]')

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }

    canonical.href = `https://tradingninvestment.com${canonicalPath}`

    let description =
      document.querySelector<HTMLMetaElement>('meta[name="description"]')

    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.appendChild(description)
    }

    description.content =
      'A 26-year empirical study of Doji candlestick patterns using 6,726 SPY trading sessions, market context, confirmation signals, and bootstrap validation.'
  }, [])

  return (
    <main className="spy-doji-research">
      <nav className="spy-doji-breadcrumb" aria-label="Breadcrumb">
        <a href="/research/">Research</a>
        <span>›</span>
        <a href="/research/trading/">Technical Analysis</a>
        <span>›</span>
        <span>Doji Empirical Study</span>
      </nav>

      <article>
        <header className="spy-doji-hero">
          <span className="spy-doji-eyebrow">
            TNI ORIGINAL RESEARCH / TECHNICAL ANALYSIS
          </span>

          <h1>
            Does the Doji Candlestick Really Work?
            <span> A 26-Year SPY Study</span>
          </h1>

          <p className="spy-doji-dek">
            We tested one of technical analysis's most recognizable
            candlestick patterns against more than two decades of
            S&amp;P 500 ETF trading history. The evidence suggests
            that market context matters more than the pattern alone.
          </p>

          <p className="spy-doji-byline">
            By <a href="/about/" rel="author">Kamal Khondkar</a>
            {' · '}TradingNInvestment Research
            {' · '}Data through September 30, 2026
          </p>
        </header>

        <section className="spy-doji-key-findings" aria-label="Key findings">
          <div>
            <span>HISTORICAL SAMPLE</span>
            <strong>6,726</strong>
            <p>SPY daily trading sessions</p>
          </div>

          <div>
            <span>QUALIFYING DOJI</span>
            <strong>676</strong>
            <p>10% body-to-range definition</p>
          </div>

          <div>
            <span>NEUTRAL-MARKET ADVANTAGE</span>
            <strong>+7.35 pp</strong>
            <p>10-day positive-return frequency</p>
          </div>
        </section>

        <div className="spy-doji-article-body">
          <section>
            <h2>The question behind the Doji</h2>

            <p>
              The Doji candlestick forms when a security closes near its
              opening price. In traditional technical analysis, this
              narrow real body is interpreted as a sign of indecision
              between buyers and sellers.
            </p>

            <figure className="spy-doji-definition-figure">
              <img
                src="/wp-content/uploads/2016/02/doji.png"
                alt="Doji candlestick illustration showing the narrow real body and upper and lower shadows"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                Doji candlestick anatomy. Original TradingNInvestment
                educational illustration (2016).
              </figcaption>
            </figure>

            <p>
              Traders frequently associate Doji patterns with potential
              trend reversals. But an attractive chart pattern does not
              necessarily imply a statistically reliable trading signal.
              To investigate, we examined SPY daily prices from January
              2000 through September 2026.
            </p>

            <p>
              For the traditional pattern explanation and annotated
              trading examples, see our original article:
              {' '}
              <a href="/magic-doji-or-myth-and-how-to-use-doji-for-stock-trading/">
                Magic Doji or Myth: How to Use Doji for Stock Trading
              </a>.
            </p>
          </section>

          <section>
            <h2>How we defined and tested a Doji</h2>

            <p>
              A qualifying Doji was defined as a trading session where
              the absolute difference between the opening and closing
              price was no more than 10% of the session's high-low range.
              Zero-range sessions were excluded.
            </p>

            <div className="spy-doji-formula">
              Doji body ratio = |Close − Open| / (High − Low) ≤ 0.10
            </div>

            <p>
              This identified 676 Doji sessions among 6,726 daily SPY
              observations, or approximately 10.05% of the sample.
              We evaluated subsequent close-to-close price returns
              over 1, 3, 5, and 10 trading sessions.
            </p>

            <p>
              We also separated observations according to SPY's
              preceding five-session return: declines exceeding 2%,
              neutral moves within ±2%, and advances exceeding 2%.
              This allowed us to investigate whether a Doji's apparent
              predictive value changes with the preceding market trend.
            </p>
          </section>

          <section>
            <h2>First, does the Doji alone provide an advantage?</h2>

            <p>
              Across the full sample, Doji sessions showed only small
              differences from the broader market at short horizons.
              The largest observed directional difference appeared
              over 10 trading sessions.
            </p>

            <DojiUnconditionalChart />

            <p>
              These comparisons include Dojis in the all-session
              baseline. They describe historical outcomes, not
              independent trading signals.
            </p>
          </section>

          <section>
            <h2>Finding 1: Market context matters</h2>

            <p>
              A Doji does not have a uniform historical interpretation.
              The direction of the preceding market movement changes
              the distribution of subsequent outcomes.
            </p>

            <DojiContextChart />

            <p>
              The strongest directional result in our exploratory
              analysis appeared after Doji sessions in relatively
              neutral markets. However, the chart above compares
              Dojis with all sessions in the same market category,
              including other Dojis. It is descriptive rather than
              an independent non-Doji control test.
            </p>
          </section>

          <section>
            <h2>Finding 2: The neutral-market result persisted across decades</h2>

            <p>
              To examine historical stability, we compared qualifying
              neutral-market Dojis with neutral-market sessions that
              did not meet our Doji definition.
            </p>

            <p>
              Across the full eligible sample, 494 neutral-market Doji
              observations with complete 10-day outcomes had a
              positive-return frequency approximately 7.35 percentage
              points higher than the corresponding non-Doji control.
            </p>

            <DojiDecadeChart />

            <p>
              The directional advantage appeared in all three
              historical periods, but decreased from approximately
              9.56 percentage points in 2000–2009 to 3.48 percentage
              points in 2020–September 2026.
            </p>

            <p>
              Importantly, a higher frequency of positive outcomes
              does not necessarily mean a higher average return.
              In the most recent period, neutral-market Dojis had a
              higher positive-return frequency but a lower average
              10-day return than non-Doji sessions.
            </p>
          </section>

          <section>
            <h2>Finding 3: The result survived several bootstrap specifications</h2>

            <p>
              Forward 10-day returns overlap, meaning adjacent
              observations cannot reasonably be treated as fully
              independent. We therefore used moving-block bootstrap
              resampling to examine the uncertainty around the
              neutral-market directional advantage.
            </p>

            <DojiBootstrapChart />

            <p>
              The tested 10-, 20-, and 40-session bootstrap block
              lengths produced confidence intervals above zero.
              This supports the historical association under the
              tested specifications, but does not establish a
              profitable or independently validated trading strategy.
            </p>
          </section>

          <section>
            <h2>Does waiting for confirmation help?</h2>

            <p>
              We also tested whether a breakout beyond the previous
              Doji's high or low improved subsequent directional
              outcomes. Returns were measured from the confirmation
              session's closing price.
            </p>

            <DojiConfirmationChart />

            <p>
              Bullish confirmations showed mixed results across
              holding periods. Bearish confirmations were particularly
              unconvincing at the five-day horizon, where fewer
              observations subsequently produced negative returns
              than the broader downside-breakout comparison.
            </p>

            <p>
              This challenges the assumption that a Doji followed
              by a downside breakout necessarily produces a reliable
              bearish signal.
            </p>
          </section>

          <section>
            <h2>Which findings remain statistically distinguishable?</h2>

            <p>
              We compared selected Doji outcomes with eligible
              non-Doji controls using moving-block bootstrap
              resampling. The results varied substantially
              depending on the signal definition.
            </p>

            <DojiStatisticalChart />

            <p>
              The neutral-market 10-day positive-return advantage
              had a confidence interval above zero. The bullish
              one-day confirmation interval crossed zero, while
              the bearish five-day downside-frequency comparison
              was negative.
            </p>

            <p>
              These exploratory tests were selected after examining
              multiple specifications. Their confidence intervals
              should not be interpreted as confirmatory evidence
              without adjustment and independent validation.
            </p>
          </section>

          <section>
            <h2>Does a Doji predict reversal or continuation?</h2>

            <p>
              A Doji is frequently interpreted as a potential turning point.
              But a reversal requires more than a candle's appearance.
              We tested whether Doji sessions were followed by a directional
              change or continuation more often than comparable non-Doji sessions.
            </p>

            <p>
              We classified the preceding trend using the prior five-session
              SPY return. An increase greater than 2% defined an uptrend,
              while a decline greater than 2% defined a downtrend.
              Each Doji was compared with non-Doji sessions from the same
              preceding-trend category.
            </p>

            <DojiReversalContinuation />

            <p>
              At the ten-day horizon, bullish reversals showed a
              2.35-percentage-point disadvantage, while bearish reversals
              showed a 1.03-point advantage. Neither result was statistically
              distinguishable from zero under the exploratory bootstrap.
            </p>

            <p>
              Continuation outcomes were similarly inconclusive.
              These classifications measure the direction of the forward
              return, not whether a sustained new market trend developed.
              Reversal and continuation outcomes are also closely related,
              rather than four independent tests.
            </p>

            <h2>What this study does not establish</h2>

            <p>
              These results are exploratory. Multiple Doji thresholds,
              forward horizons, market regimes, and confirmation
              definitions were examined. Reported bootstrap
              probabilities and confidence intervals have not been
              adjusted for this broader search.
            </p>

            <p>
              The analysis uses unadjusted SPY daily prices and
              close-to-close price returns, excluding dividends.
              It does not include commissions, bid-ask spreads,
              slippage, short-sale constraints, or portfolio-level
              position sizing. No untouched out-of-sample trading
              period was reserved for final validation.
            </p>

            <p>
              Consequently, the observed association should be
              treated as a research hypothesis rather than evidence
              that Doji trading alone produces excess returns.
            </p>
          </section>

          <section className="spy-doji-conclusion">
            <h2>The bottom line</h2>

            <p>
              The evidence does not support treating every Doji as
              an automatic reversal signal. Instead, the historical
              results suggest that preceding market conditions
              influence how the pattern relates to subsequent
              SPY returns.
            </p>

            <p>
              Our most interesting finding is the higher frequency
              of positive 10-day returns following Dojis in
              neutral-market conditions. Its declining advantage
              across decades, however, reinforces the need for
              caution and independent prospective testing.
            </p>
          </section>

          <footer className="spy-doji-research-footer">
            <h2>Data sources &amp; licensing</h2>

            <p>
              <strong>Market data source:</strong> Yahoo Finance
              historical SPY daily open, high, low, and close prices,
              January 3, 2000–September 30, 2026.
            </p>

            <p>
              <strong>Original research:</strong> TradingNInvestment
              conducted the Doji classification, forward-return
              calculations, regime comparisons, statistical analysis,
              and research visualizations.
            </p>

            <p>
              <strong>Data &amp; research licensing:</strong> See the{' '}
              <a href="/research-license/">
                TNI Research &amp; Data License
              </a>
              {' '}for information about using our original research
              and visualizations. Underlying third-party market data
              remains subject to its provider's applicable terms.
            </p>

            <p>
              <strong>Research notice:</strong> Historical findings
              are not investment advice. Past statistical
              relationships may not persist.
            </p>

            <a href="/magic-doji-or-myth-and-how-to-use-doji-for-stock-trading/">
              Explore the original Doji candlestick guide →
            </a>
          </footer>
        </div>
      </article>
    </main>
  )
}
