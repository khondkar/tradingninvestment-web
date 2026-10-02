import {
  useEffect,
  useMemo,
  useRef,
} from 'react'

import {
  renderDrawdownComparisonChart,
} from '../../charts/tni/renderDrawdownComparisonChart'

import type {
  TNIDrawdownComparisonPoint,
} from '../../charts/tni/renderDrawdownComparisonChart'


export type DrawdownSummary = {
  max_drawdown_pct: number
  peak_date: string
  trough_date: string
  recovery_date: string | null
  calendar_days_peak_to_trough: number
  calendar_days_trough_to_recovery: number | null
  total_calendar_days_underwater: number | null
  current_drawdown_pct: number
}


export type LeveragedEtfDrawdownDataset = {
  dataset: string
  asset: string
  benchmark: string
  asset_type: string
  price_basis: string
  source: string
  methodology: string

  range: {
    first_date: string
    last_date: string
    daily_observations: number
  }

  asset_summary: DrawdownSummary
  benchmark_summary: DrawdownSummary

  data: TNIDrawdownComparisonPoint[]
}


type Props = {
  dataset: LeveragedEtfDrawdownDataset
}


const STARTING_VALUE = 10000


function formatPercent(
  value: number,
  digits = 2,
): string {
  return `${value.toFixed(digits)}%`
}


function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    },
  ).format(value)
}


function formatDate(
  value: string | null,
): string {
  if (!value) {
    return 'Not yet recovered'
  }

  const date =
    new Date(
      `${value}T00:00:00Z`,
    )

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    },
  ).format(date)
}


function valueAtTrough(
  maxDrawdownPct: number,
): number {
  return (
    STARTING_VALUE *
    (
      1 +
      maxDrawdownPct / 100
    )
  )
}


function recoveryGain(
  maxDrawdownPct: number,
): number {
  const remaining =
    1 +
    maxDrawdownPct / 100

  if (remaining <= 0) {
    return Infinity
  }

  return (
    (
      1 / remaining
    ) - 1
  ) * 100
}


export default function LeveragedEtfDrawdownComparison({
  dataset,
}: Props) {
  const chartRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  const analysis =
    useMemo(
      () => {
        const asset =
          dataset.asset_summary

        const benchmark =
          dataset.benchmark_summary

        return {
          asset,
          benchmark,

          assetTroughValue:
            valueAtTrough(
              asset.max_drawdown_pct,
            ),

          benchmarkTroughValue:
            valueAtTrough(
              benchmark.max_drawdown_pct,
            ),

          assetRecoveryGain:
            recoveryGain(
              asset.max_drawdown_pct,
            ),

          benchmarkRecoveryGain:
            recoveryGain(
              benchmark.max_drawdown_pct,
            ),
        }
      },
      [dataset],
    )

  useEffect(
    () => {
      const container =
        chartRef.current

      if (!container) {
        return
      }

      return renderDrawdownComparisonChart(
        container,
        {
          assetName:
            dataset.asset,

          benchmarkName:
            dataset.benchmark,

          data:
            dataset.data,

          height: 520,
        },
      )
    },
    [dataset],
  )

  return (
    <section className="tni-leveraged-drawdown">
      <div className="tni-leveraged-drawdown__header">
        <span className="tni-leveraged-drawdown__eyebrow">
          DRAWDOWN &amp; RECOVERY
        </span>

        <h2>
          {dataset.asset} vs {dataset.benchmark} Drawdowns
        </h2>

        <p className="tni-leveraged-drawdown__lede">
          Drawdown measures the decline from a previous
          investment peak. For a daily leveraged ETF,
          drawdown helps show how leverage, volatility and
          compounding can change the depth of losses and the
          time required to recover.
        </p>
      </div>

      <div className="tni-leveraged-drawdown__cards">
        <article className="tni-leveraged-drawdown__card is-asset">
          <span>
            {dataset.asset} MAX DRAWDOWN
          </span>

          <strong>
            {formatPercent(
              analysis.asset.max_drawdown_pct,
            )}
          </strong>

          <small>
            {formatDate(
              analysis.asset.peak_date,
            )}
            {' → '}
            {formatDate(
              analysis.asset.trough_date,
            )}
          </small>
        </article>

        <article className="tni-leveraged-drawdown__card">
          <span>
            {dataset.benchmark} MAX DRAWDOWN
          </span>

          <strong>
            {formatPercent(
              analysis.benchmark.max_drawdown_pct,
            )}
          </strong>

          <small>
            {formatDate(
              analysis.benchmark.peak_date,
            )}
            {' → '}
            {formatDate(
              analysis.benchmark.trough_date,
            )}
          </small>
        </article>
      </div>

      <div className="tni-leveraged-drawdown__severity">
        <h3>
          How severe can a {dataset.asset} drawdown be?
        </h3>

        <p>
          In this synchronized {dataset.asset}–{dataset.benchmark}
          {' '}dataset, {dataset.asset}'s maximum adjusted-close
          drawdown was{' '}
          <strong>
            {formatPercent(
              analysis.asset.max_drawdown_pct,
            )}
          </strong>
          , compared with{' '}
          <strong>
            {formatPercent(
              analysis.benchmark.max_drawdown_pct,
            )}
          </strong>
          {' '}for {dataset.benchmark}.
        </p>

        <p>
          A hypothetical {formatCurrency(STARTING_VALUE)}
          {' '}investment made at {dataset.asset}'s prior peak
          would have fallen to approximately{' '}
          <strong>
            {formatCurrency(
              analysis.assetTroughValue,
            )}
          </strong>
          {' '}at the trough. Recovering from that loss requires
          a subsequent gain of approximately{' '}
          <strong>
            {formatPercent(
              analysis.assetRecoveryGain,
              0,
            )}
          </strong>
          {' '}just to return to the previous peak.
        </p>

        <p>
          The same comparison for {dataset.benchmark} would
          reduce {formatCurrency(STARTING_VALUE)} to approximately{' '}
          <strong>
            {formatCurrency(
              analysis.benchmarkTroughValue,
            )}
          </strong>
          , requiring roughly{' '}
          <strong>
            {formatPercent(
              analysis.benchmarkRecoveryGain,
              0,
            )}
          </strong>
          {' '}to recover. This illustrates why the magnitude
          of a percentage loss matters: the gain required to
          recover becomes increasingly large as drawdowns deepen.
          For a different long-term equity perspective, see
          TNI&apos;s{" "}
          <a href="/look-berkshire-hathaway-stock-brk-b-berkshire-hathaway-performance-vs-sp-500/">
            Berkshire Hathaway historical returns
          </a>
          .
        </p>
      </div>

      <div
        className="tni-leveraged-drawdown__chart"
        ref={chartRef}
      />

      <div className="tni-leveraged-drawdown__recovery-grid">
        <article>
          <span>
            {dataset.asset} PEAK
          </span>

          <strong>
            {formatDate(
              analysis.asset.peak_date,
            )}
          </strong>
        </article>

        <article>
          <span>
            TROUGH
          </span>

          <strong>
            {formatDate(
              analysis.asset.trough_date,
            )}
          </strong>
        </article>

        <article>
          <span>
            RECOVERED
          </span>

          <strong>
            {formatDate(
              analysis.asset.recovery_date,
            )}
          </strong>
        </article>

        <article>
          <span>
            TIME UNDERWATER
          </span>

          <strong>
            {analysis.asset
              .total_calendar_days_underwater !== null
              ? `${analysis.asset.total_calendar_days_underwater.toLocaleString()} days`
              : 'Still underwater'}
          </strong>
        </article>
      </div>

      <p className="tni-leveraged-drawdown__interpretation">
        During the deepest {dataset.asset} drawdown in this
        dataset, the decline ran from{' '}
        <strong>
          {formatDate(
            analysis.asset.peak_date,
          )}
        </strong>
        {' '}to{' '}
        <strong>
          {formatDate(
            analysis.asset.trough_date,
          )}
        </strong>
        . The previous peak was{' '}
        {analysis.asset.recovery_date
          ? (
              <>
                recovered on{' '}
                <strong>
                  {formatDate(
                    analysis.asset.recovery_date,
                  )}
                </strong>
                , after{' '}
                <strong>
                  {analysis.asset
                    .total_calendar_days_underwater
                    ?.toLocaleString()}
                  {' '}calendar days underwater
                </strong>
                .
              </>
            )
          : (
              <>
                <strong>
                  not recovered by the end of the dataset
                </strong>
                .
              </>
            )}
      </p>

      <p className="tni-leveraged-drawdown__methodology">
        Source: {dataset.source}. Drawdowns are calculated
        from synchronized daily adjusted-close observations
        from {dataset.range.first_date} through{' '}
        {dataset.range.last_date}. Each series is measured
        from its own running peak over the identical comparison
        period. Past performance does not guarantee future
        results.
      </p>
    </section>
  )
}
