// ============================================================================
// TNI S&P 500 DRAWDOWN CHART RENDERER
// Interactive peak-to-trough drawdown research visualization
// ============================================================================

import * as d3 from "d3"

import { tniChartTheme } from "./tniChartTheme"

// ============================================================================
// TYPES
// ============================================================================

export type TNIDrawdownPoint = {
  date: string
  close: number
  drawdown_pct: number
}

export type TNIDrawdownEvent = {
  event: number
  classification: "correction" | "bear_market"
  peak_date: string
  peak_close: number
  correction_threshold_date: string
  bear_market_threshold_date: string | null
  trough_date: string
  trough_close: number
  drawdown_pct: number
  trading_days_peak_to_correction: number
  calendar_days_peak_to_correction: number
  trading_days_peak_to_trough: number
  calendar_days_peak_to_trough: number
  recovery_date: string | null
  recovery_close: number | null
  trading_days_trough_to_recovery: number | null
  calendar_days_trough_to_recovery: number | null
  total_trading_days_underwater: number | null
  total_calendar_days_underwater: number | null
  recovered: boolean
}

export type TNIForwardReturnObservation = {
  event: number
  threshold_date: string
  threshold_close: number
  target_date: string
  observation_date: string
  observation_close: number
  forward_return_pct: number
}

export type TNIForwardReturnHorizon = {
  months: number
  n: number
  average_return_pct: number | null
  median_return_pct: number | null
  positive_count: number
  positive_pct: number | null
  observations: TNIForwardReturnObservation[]
}

export type TNIForwardReturnGroup = {
  "3m": TNIForwardReturnHorizon
  "6m": TNIForwardReturnHorizon
  "1y": TNIForwardReturnHorizon
  "3y": TNIForwardReturnHorizon
  "5y": TNIForwardReturnHorizon
}

export type TNIDrawdownDataset = {
  symbol: string
  ticker: string
  name: string
  source: string
  methodology: string
  range: {
    first_date: string
    last_date: string
    daily_observations: number
  }
  thresholds: {
    correction_pct: number
    bear_market_pct: number
  }
  current_drawdown: {
    date: string
    close: number
    all_time_closing_high_date: string
    all_time_closing_high: number
    drawdown_from_all_time_closing_high_pct: number
  }
  summary: Record<string, number | null>
  recovery_extremes: {
    fastest: {
      event: number
      peak_date: string
      trough_date: string
      recovery_date: string
      calendar_days_trough_to_recovery: number
    }
    longest: {
      event: number
      peak_date: string
      trough_date: string
      recovery_date: string
      calendar_days_trough_to_recovery: number
    }
  }
  forward_returns: {
    methodology: string
    after_10pct_decline: TNIForwardReturnGroup
    after_20pct_decline: TNIForwardReturnGroup
  }
  series: TNIDrawdownPoint[]
  events: TNIDrawdownEvent[]
}

type RangeKey =
  | "ALL"
  | "20Y"
  | "10Y"
  | "5Y"
  | "1Y"

type ParsedPoint = TNIDrawdownPoint & {
  parsedDate: Date
  peakDate: Date
  peakClose: number
}

type ParsedEvent = TNIDrawdownEvent & {
  peakDate: Date
  troughDate: Date
  recoveryDate: Date | null
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MOBILE_BREAKPOINT = 720

const RANGE_OPTIONS: RangeKey[] = [
  "ALL",
  "20Y",
  "10Y",
  "5Y",
  "1Y",
]

// ============================================================================
// FORMATTERS
// ============================================================================

const parseDate = d3.utcParse("%Y-%m-%d")
const formatDate = d3.utcFormat("%b %d, %Y")
const formatYear = d3.utcFormat("%Y")

function formatPct(value: number): string {
  if (Math.abs(value) < 0.005) {
    return "0.00%"
  }

  return `${value.toFixed(2)}%`
}

function formatIndex(value: number): string {
  return d3.format(",.2f")(value)
}

function parseIsoDate(value: string): Date {
  const parsed = parseDate(value)

  if (!parsed) {
    throw new Error(
      `Invalid TNI drawdown date: ${value}`,
    )
  }

  return parsed
}

// ============================================================================
// RANGE FILTER
// ============================================================================

function rangeStartDate(
  latest: Date,
  range: RangeKey,
): Date | null {
  if (range === "ALL") {
    return null
  }

  const years = Number.parseInt(range, 10)

  return d3.utcYear.offset(
    latest,
    -years,
  )
}

// ============================================================================
// YEAR TICKS
//
// Desktop:
// approximately one label per decade for the full history.
//
// Mobile:
// maximum four labels, including first and latest.
//
// This intentionally mirrors the readability philosophy of the existing
// TNI annual-return chart rather than shrinking desktop typography.
// ============================================================================

function getYearTicks(
  domainStart: Date,
  domainEnd: Date,
  width: number,
): Date[] {
  const isMobile =
    width < MOBILE_BREAKPOINT

  const startYear =
    domainStart.getUTCFullYear()

  const endYear =
    domainEnd.getUTCFullYear()

  if (isMobile) {
    const span =
      Math.max(
        1,
        endYear - startYear,
      )

    const years = [
      startYear,
      Math.round(
        startYear + span / 3,
      ),
      Math.round(
        startYear + (span * 2) / 3,
      ),
      endYear,
    ]

    return Array.from(
      new Set(years),
    ).map(
      (year) =>
        new Date(
          Date.UTC(year, 0, 1),
        ),
    )
  }

  const span =
    endYear - startYear

  let step = 1

  if (span > 70) {
    step = 10
  } else if (span > 35) {
    step = 5
  } else if (span > 15) {
    step = 2
  }

  const ticks: Date[] = []

  const firstAlignedYear =
    Math.ceil(startYear / step) * step

  for (
    let year = firstAlignedYear;
    year <= endYear;
    year += step
  ) {
    ticks.push(
      new Date(
        Date.UTC(year, 0, 1),
      ),
    )
  }

  return ticks
}

// ============================================================================
// MAIN RENDERER
// ============================================================================

export function renderDrawdownChart(
  container: HTMLElement,
  dataset: TNIDrawdownDataset,
): () => void {
  const theme = tniChartTheme

  const CORRECTION_LEVEL =
    -Math.abs(
      dataset.thresholds.correction_pct,
    )

  const BEAR_LEVEL =
    -Math.abs(
      dataset.thresholds.bear_market_pct,
    )

  d3
    .select(container)
    .selectAll("*")
    .remove()

  container.style.position = "relative"
  container.style.width = "100%"
  container.style.minWidth = "0"
  container.style.fontFamily =
    theme.typography.fontFamily

  // ==========================================================================
  // CONTROLS
  // ==========================================================================

  const controls = d3
    .select(container)
    .append("div")
    .attr(
      "class",
      "tni-drawdown-controls",
    )
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("gap", "8px")
    .style("align-items", "center")
    .style(
      "margin",
      "0 0 14px 0",
    )

  const rangeLabel = controls
    .append("span")
    .text("Range")
    .style(
      "font-size",
      "12px",
    )
    .style(
      "font-weight",
      "700",
    )
    .style(
      "color",
      theme.colors.textSecondary,
    )
    .style(
      "margin-right",
      "2px",
    )

  rangeLabel.attr(
    "aria-hidden",
    "true",
  )

  let activeRange: RangeKey =
    "ALL"

  const buttons = controls
    .selectAll<
      HTMLButtonElement,
      RangeKey
    >("button")
    .data(RANGE_OPTIONS)
    .join("button")
    .attr("type", "button")
    .text((range) => range)
    .style(
      "font-family",
      theme.typography.fontFamily,
    )
    .style(
      "font-size",
      "12px",
    )
    .style(
      "font-weight",
      "700",
    )
    .style(
      "min-width",
      "44px",
    )
    .style(
      "min-height",
      "38px",
    )
    .style(
      "padding",
      "7px 10px",
    )
    .style(
      "border-radius",
      "999px",
    )
    .style(
      "cursor",
      "pointer",
    )
    .style(
      "transition",
      "background 120ms ease, color 120ms ease, border-color 120ms ease",
    )

  // ==========================================================================
  // CHART HOST
  // ==========================================================================

  const chartHost = d3
    .select(container)
    .append("div")
    .style(
      "position",
      "relative",
    )
    .style(
      "width",
      "100%",
    )
    .style(
      "min-width",
      "0",
    )

  // ==========================================================================
  // TOOLTIP
  // ==========================================================================

  const tooltip = d3
    .select(container)
    .append("div")
    .attr(
      "class",
      "tni-drawdown-tooltip",
    )
    .style(
      "position",
      "absolute",
    )
    .style(
      "pointer-events",
      "none",
    )
    .style(
      "opacity",
      "0",
    )
    .style(
      "z-index",
      "30",
    )
    .style(
      "max-width",
      "270px",
    )
    .style(
      "padding",
      "11px 13px",
    )
    .style(
      "border-radius",
      "8px",
    )
    .style(
      "background",
      theme.colors.tooltipBackground,
    )
    .style(
      "color",
      theme.colors.tooltipText,
    )
    .style(
      "font-family",
      theme.typography.fontFamily,
    )
    .style(
      "font-size",
      `${theme.typography.tooltipSize}px`,
    )
    .style(
      "line-height",
      "1.45",
    )
    .style(
      "box-shadow",
      "0 8px 24px rgba(0,0,0,.14)",
    )

  // ==========================================================================
  // PARSE ONCE
  // ==========================================================================

  const orderedSeries =
    dataset.series
      .map((point) => ({
        ...point,
        parsedDate:
          parseIsoDate(point.date),
      }))
      .sort(
        (a, b) =>
          a.parsedDate.getTime() -
          b.parsedDate.getTime(),
      )

  let runningPeakClose =
    orderedSeries[0]?.close ?? 0

  let runningPeakDate =
    orderedSeries[0]?.parsedDate ??
    new Date(0)

  const parsedSeries: ParsedPoint[] =
    orderedSeries.map((point) => {
      if (
        point.close >=
        runningPeakClose
      ) {
        runningPeakClose =
          point.close

        runningPeakDate =
          point.parsedDate
      }

      return {
        ...point,
        peakDate:
          runningPeakDate,
        peakClose:
          runningPeakClose,
      }
    })

  const parsedEvents: ParsedEvent[] =
    dataset.events.map((event) => ({
      ...event,
      peakDate:
        parseIsoDate(event.peak_date),
      troughDate:
        parseIsoDate(event.trough_date),
      recoveryDate:
        event.recovery_date
          ? parseIsoDate(
              event.recovery_date,
            )
          : null,
    }))

  if (parsedSeries.length === 0) {
    chartHost
      .append("div")
      .text(
        "No drawdown observations are available.",
      )
      .style(
        "padding",
        "32px 0",
      )
      .style(
        "color",
        theme.colors.textSecondary,
      )

    return () => {
      tooltip.remove()
      controls.remove()
      chartHost.remove()
    }
  }

  // ==========================================================================
  // RENDER STATE
  // ==========================================================================

  let selectedPoint:
    | ParsedPoint
    | null = null

  let lastWidth = 0

  function updateButtons() {
    buttons
      .style(
        "background",
        (range) =>
          range === activeRange
            ? theme.colors.textPrimary
            : theme.colors.background,
      )
      .style(
        "color",
        (range) =>
          range === activeRange
            ? "#FFFFFF"
            : theme.colors.textSecondary,
      )
      .style(
        "border",
        (range) =>
          range === activeRange
            ? `1px solid ${theme.colors.textPrimary}`
            : `1px solid ${theme.colors.border}`,
      )
      .attr(
        "aria-pressed",
        (range) =>
          range === activeRange
            ? "true"
            : "false",
      )
  }

  updateButtons()

  // ==========================================================================
  // TOOLTIP CONTENT
  // ==========================================================================

  function eventForPoint(
    point: ParsedPoint,
  ): ParsedEvent | null {
    const time =
      point.parsedDate.getTime()

    return (
      parsedEvents.find(
        (event) => {
          const start =
            event.peakDate.getTime()

          const end =
            (
              event.recoveryDate ??
              parsedSeries[
                parsedSeries.length - 1
              ].parsedDate
            ).getTime()

          return (
            time >= start &&
            time <= end
          )
        },
      ) ?? null
    )
  }

  function tooltipHtml(
    point: ParsedPoint,
  ): string {
    const event =
      eventForPoint(point)

    const classification =
      point.drawdown_pct <=
      BEAR_LEVEL
        ? "Bear-market territory"
        : point.drawdown_pct <=
            CORRECTION_LEVEL
          ? "Correction territory"
          : "Below prior high"

    let eventHtml = ""

    if (event) {
      const eventType =
        event.classification ===
        "bear_market"
          ? "Bear market"
          : "Correction"

      const recovery =
        event.recoveryDate
          ? formatDate(
              event.recoveryDate,
            )
          : "Not yet recovered"

      eventHtml = `
        <div style="margin-top:8px;padding-top:7px;border-top:1px solid rgba(255,255,255,.16)">
          <div><strong>Episode:</strong> ${eventType}</div>
          <div><strong>Peak:</strong> ${formatDate(event.peakDate)}</div>
          <div><strong>Trough:</strong> ${formatDate(event.troughDate)} (${formatPct(event.drawdown_pct)})</div>
          <div><strong>Recovery:</strong> ${recovery}</div>
        </div>
      `
    }

    return `
      <div style="font-weight:750;font-size:14px">
        ${formatDate(point.parsedDate)}
      </div>

      <div style="margin-top:4px">
        <strong>Drawdown:</strong>
        ${formatPct(point.drawdown_pct)}
      </div>

      <div>
        <strong>S&amp;P 500:</strong>
        ${formatIndex(point.close)}
      </div>

      <div>
        <strong>Prior high:</strong>
        ${formatIndex(point.peakClose)}
        · ${formatDate(point.peakDate)}
      </div>

      <div style="margin-top:4px;opacity:.82">
        ${classification}
      </div>

      ${eventHtml}
    `
  }

  // ==========================================================================
  // DRAW
  // ==========================================================================

  function draw() {
    chartHost
      .selectAll("*")
      .remove()

    const measuredWidth =
      chartHost.node()?.clientWidth ??
      container.clientWidth ??
      900

    const width =
      Math.max(
        320,
        measuredWidth,
      )

    lastWidth = width

    const isMobile =
      width < MOBILE_BREAKPOINT

    const height =
      isMobile
        ? 470
        : 560

    // Same responsive typography philosophy as the current annual chart.
    const axisFontSize =
      isMobile
        ? 22
        : 15

    const yearFontSize =
      isMobile
        ? 20
        : 15

    const margin =
      isMobile
        ? {
            top: 20,
            right: 12,
            bottom: 124,
            left: 66,
          }
        : {
            top: 32,
            right: 28,
            bottom: 80,
            left: 68,
          }

    const innerWidth =
      Math.max(
        1,
        width -
          margin.left -
          margin.right,
      )

    const innerHeight =
      Math.max(
        1,
        height -
          margin.top -
          margin.bottom,
      )

    const latest =
      parsedSeries[
        parsedSeries.length - 1
      ].parsedDate

    const start =
      rangeStartDate(
        latest,
        activeRange,
      )

    let visibleSeries =
      start === null
        ? parsedSeries
        : parsedSeries.filter(
            (point) =>
              point.parsedDate >=
              start,
          )

    if (visibleSeries.length < 2) {
      visibleSeries =
        parsedSeries.slice(-2)
    }

    const domainStart =
      visibleSeries[0].parsedDate

    const domainEnd =
      visibleSeries[
        visibleSeries.length - 1
      ].parsedDate

    const visibleEvents =
      parsedEvents.filter(
        (event) =>
          event.troughDate >=
            domainStart &&
          event.peakDate <=
            domainEnd,
      )

    const minimumDrawdown =
      d3.min(
        visibleSeries,
        (point) =>
          point.drawdown_pct,
      ) ?? -20

    const yFloor =
      Math.min(
        -25,
        Math.floor(
          minimumDrawdown / 10,
        ) * 10,
      )

    const svg = chartHost
      .append("svg")
      .attr(
        "width",
        "100%",
      )
      .attr(
        "height",
        height,
      )
      .attr(
        "viewBox",
        `0 0 ${width} ${height}`,
      )
      .attr(
        "role",
        "img",
      )
      .attr(
        "aria-label",
        `S&P 500 historical drawdowns from ${formatYear(domainStart)} to ${formatYear(domainEnd)}. Drawdowns are measured from prior closing highs.`,
      )
      .style(
        "display",
        "block",
      )
      .style(
        "overflow",
        "visible",
      )

    svg
      .append("title")
      .text(
        "S&P 500 Historical Drawdowns",
      )

    svg
      .append("desc")
      .text(
        "Daily S&P 500 closing-price drawdowns from prior closing highs. The chart marks correction territory at minus 10 percent and bear-market territory at minus 20 percent.",
      )

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.top})`,
      )

    // ========================================================================
    // SCALES
    // ========================================================================

    const xScale = d3
      .scaleUtc()
      .domain([
        domainStart,
        domainEnd,
      ])
      .range([
        0,
        innerWidth,
      ])

    const yScale = d3
      .scaleLinear()
      .domain([
        yFloor,
        0,
      ])
      .nice()
      .range([
        innerHeight,
        0,
      ])

    // ========================================================================
    // Y GRID / AXIS
    // ========================================================================

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(
        isMobile
          ? 5
          : 7,
      )
      .tickSize(
        -innerWidth,
      )
      .tickFormat(
        (value) =>
          `${value}%`,
      )

    const yGroup = chart
      .append("g")
      .call(yAxis)

    yGroup
      .select(".domain")
      .remove()

    yGroup
      .selectAll(".tick line")
      .attr(
        "stroke",
        theme.colors.grid,
      )
      .attr(
        "stroke-width",
        1,
      )

    yGroup
      .selectAll(".tick text")
      .attr(
        "fill",
        theme.colors.textSecondary,
      )
      .attr(
        "font-family",
        theme.typography.fontFamily,
      )
      .attr(
        "font-size",
        axisFontSize,
      )
      .attr(
        "font-weight",
        isMobile
          ? 650
          : 600,
      )

    // ========================================================================
    // X AXIS
    // ========================================================================

    const yearTicks =
      getYearTicks(
        domainStart,
        domainEnd,
        width,
      )

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(yearTicks)
      .tickSizeOuter(0)
      .tickFormat(
        (value) =>
          formatYear(
            value as Date,
          ),
      )

    const xGroup = chart
      .append("g")
      .attr(
        "transform",
        `translate(0,${innerHeight})`,
      )
      .call(xAxis)

    xGroup
      .select(".domain")
      .attr(
        "stroke",
        theme.colors.border,
      )

    xGroup
      .selectAll(".tick line")
      .attr(
        "stroke",
        theme.colors.border,
      )

    xGroup
      .selectAll(".tick text")
      .attr(
        "fill",
        theme.colors.textSecondary,
      )
      .attr(
        "font-family",
        theme.typography.fontFamily,
      )
      .attr(
        "font-size",
        yearFontSize,
      )
      .attr(
        "font-weight",
        isMobile
          ? 650
          : 600,
      )
      .attr(
        "dy",
        isMobile
          ? "1.05em"
          : "1.1em",
      )

    // ========================================================================
    // TERRITORY BANDS
    // ========================================================================

    if (yFloor < CORRECTION_LEVEL) {
      chart
        .append("rect")
        .attr("x", 0)
        .attr(
          "y",
          yScale(CORRECTION_LEVEL),
        )
        .attr(
          "width",
          innerWidth,
        )
        .attr(
          "height",
          Math.max(
            0,
            yScale(
              Math.max(
                BEAR_LEVEL,
                yFloor,
              ),
            ) -
              yScale(
                CORRECTION_LEVEL,
              ),
          ),
        )
        .attr(
          "fill",
          theme.colors.negative,
        )
        .attr(
          "opacity",
          0.035,
        )
    }

    if (yFloor < BEAR_LEVEL) {
      chart
        .append("rect")
        .attr("x", 0)
        .attr(
          "y",
          yScale(BEAR_LEVEL),
        )
        .attr(
          "width",
          innerWidth,
        )
        .attr(
          "height",
          innerHeight -
            yScale(BEAR_LEVEL),
        )
        .attr(
          "fill",
          theme.colors.negative,
        )
        .attr(
          "opacity",
          0.065,
        )
    }

    // ========================================================================
    // THRESHOLD LINES
    // ========================================================================

    function thresholdLine(
      value: number,
      label: string,
      color: string,
    ) {
      if (value < yFloor) {
        return
      }

      const y =
        yScale(value)

      chart
        .append("line")
        .attr("x1", 0)
        .attr(
          "x2",
          innerWidth,
        )
        .attr("y1", y)
        .attr("y2", y)
        .attr(
          "stroke",
          color,
        )
        .attr(
          "stroke-width",
          2,
        )
        .attr(
          "stroke-dasharray",
          "8 5",
        )
        .attr(
          "opacity",
          1,
        )

      chart
        .append("text")
        .attr(
          "x",
          innerWidth - 4,
        )
        .attr(
          "y",
          y - 7,
        )
        .attr(
          "text-anchor",
          "end",
        )
        .attr(
          "fill",
          color,
        )
        .attr(
          "font-family",
          theme.typography.fontFamily,
        )
        .attr(
          "font-size",
          isMobile
            ? 13
            : 13,
        )
        .attr(
          "font-weight",
          750,
        )
        .text(label)
    }

    thresholdLine(
      CORRECTION_LEVEL,
      "−10% CORRECTION",
      "#2563EB",
    )

    thresholdLine(
      BEAR_LEVEL,
      "−20% BEAR MARKET",
      "#344054",
    )

    // ========================================================================
    // AREA + LINE
    // ========================================================================

    const area = d3
      .area<ParsedPoint>()
      .defined(
        (point) =>
          Number.isFinite(
            point.drawdown_pct,
          ),
      )
      .x(
        (point) =>
          xScale(
            point.parsedDate,
          ),
      )
      .y0(
        yScale(0),
      )
      .y1(
        (point) =>
          yScale(
            point.drawdown_pct,
          ),
      )
      .curve(
        d3.curveLinear,
      )

    const line = d3
      .line<ParsedPoint>()
      .defined(
        (point) =>
          Number.isFinite(
            point.drawdown_pct,
          ),
      )
      .x(
        (point) =>
          xScale(
            point.parsedDate,
          ),
      )
      .y(
        (point) =>
          yScale(
            point.drawdown_pct,
          ),
      )
      .curve(
        d3.curveLinear,
      )

    chart
      .append("path")
      .datum(visibleSeries)
      .attr(
        "fill",
        theme.colors.negative,
      )
      .attr(
        "fill-opacity",
        0.13,
      )
      .attr(
        "d",
        area,
      )

    chart
      .append("path")
      .datum(visibleSeries)
      .attr(
        "fill",
        "none",
      )
      .attr(
        "stroke",
        theme.colors.negative,
      )
      .attr(
        "stroke-width",
        isMobile
          ? 1.7
          : 1.6,
      )
      .attr(
        "stroke-linejoin",
        "round",
      )
      .attr(
        "stroke-linecap",
        "round",
      )
      .attr(
        "d",
        line,
      )

    // ========================================================================
    // EVENT TROUGHS
    // ========================================================================

    chart
      .selectAll<
        SVGCircleElement,
        ParsedEvent
      >(".tni-drawdown-trough")
      .data(visibleEvents)
      .join("circle")
      .attr(
        "class",
        "tni-drawdown-trough",
      )
      .attr(
        "cx",
        (event) =>
          xScale(
            event.troughDate,
          ),
      )
      .attr(
        "cy",
        (event) =>
          yScale(
            event.drawdown_pct,
          ),
      )
      .attr(
        "r",
        isMobile
          ? 3.5
          : 3,
      )
      .attr(
        "fill",
        theme.colors.background,
      )
      .attr(
        "stroke",
        theme.colors.negative,
      )
      .attr(
        "stroke-width",
        1.5,
      )

    // ========================================================================
    // DATA-DRIVEN ANNOTATIONS
    //
    // No historical event coordinates are hard-coded.
    //
    // The deepest events in the selected range are automatically selected.
    // Desktop gets more context; mobile deliberately gets fewer annotations.
    // ========================================================================

    const annotationLimit =
      isMobile
        ? 0
        : activeRange === "ALL"
          ? 4
          : 4

    const annotatedEvents =
      [...visibleEvents]
        .sort(
          (a, b) =>
            a.drawdown_pct -
            b.drawdown_pct,
        )
        .slice(
          0,
          annotationLimit,
        )
        .sort(
          (a, b) =>
            a.troughDate.getTime() -
            b.troughDate.getTime(),
        )

    const annotationLayer =
      chart
        .append("g")
        .attr(
          "class",
          "tni-drawdown-annotations",
        )

    annotatedEvents.forEach(
      (event, index) => {
        const x =
          xScale(
            event.troughDate,
          )

        const y =
          yScale(
            event.drawdown_pct,
          )

        const direction =
          x >
          innerWidth * 0.72
            ? -1
            : 1

        const dx =
          direction *
          (
            isMobile
              ? 22
              : 34
          )

        const verticalLift =
          isMobile
            ? 22 + index % 2 * 18
            : 26 + index % 3 * 18

        const labelX =
          Math.max(
            4,
            Math.min(
              innerWidth - 4,
              x + dx,
            ),
          )

        const labelY =
          Math.max(
            16,
            y - verticalLift,
          )

        annotationLayer
          .append("line")
          .attr("x1", x)
          .attr("y1", y)
          .attr(
            "x2",
            labelX,
          )
          .attr(
            "y2",
            labelY + 4,
          )
          .attr(
            "stroke",
            theme.colors.textSecondary,
          )
          .attr(
            "stroke-width",
            1,
          )
          .attr(
            "opacity",
            0.62,
          )

        const label =
          annotationLayer
            .append("text")
            .attr(
              "x",
              labelX,
            )
            .attr(
              "y",
              labelY,
            )
            .attr(
              "text-anchor",
              direction < 0
                ? "end"
                : "start",
            )
            .attr(
              "fill",
              theme.colors.textPrimary,
            )
            .attr(
              "font-family",
              theme.typography.fontFamily,
            )
            .attr(
              "font-size",
              isMobile
                ? 11
                : 12,
            )
            .attr(
              "font-weight",
              750,
            )

        label
          .append("tspan")
          .text(
            `${formatYear(event.troughDate)}  ${formatPct(event.drawdown_pct)}`,
          )

        if (!isMobile) {
          label
            .append("tspan")
            .attr(
              "x",
              labelX,
            )
            .attr(
              "dy",
              "1.25em",
            )
            .attr(
              "fill",
              theme.colors.textSecondary,
            )
            .attr(
              "font-size",
              11,
            )
            .attr(
              "font-weight",
              600,
            )
            .text(
              event.classification ===
              "bear_market"
                ? "Bear market"
                : "Correction",
            )
        }
      },
    )

    // ========================================================================
    // CROSSHAIR + ACTIVE POINT
    // ========================================================================

    const focus = chart
      .append("g")
      .style(
        "display",
        "none",
      )

    const focusLine = focus
      .append("line")
      .attr("y1", 0)
      .attr(
        "y2",
        innerHeight,
      )
      .attr(
        "stroke",
        theme.colors.textSecondary,
      )
      .attr(
        "stroke-width",
        1,
      )
      .attr(
        "stroke-dasharray",
        "3 4",
      )
      .attr(
        "opacity",
        0.65,
      )

    const focusDot = focus
      .append("circle")
      .attr(
        "r",
        isMobile
          ? 5
          : 4.5,
      )
      .attr(
        "fill",
        theme.colors.background,
      )
      .attr(
        "stroke",
        theme.colors.negative,
      )
      .attr(
        "stroke-width",
        2,
      )

    const bisectDate =
      d3.bisector<ParsedPoint, Date>(
        (point) =>
          point.parsedDate,
      ).center

    function nearestPoint(
      pointerX: number,
    ): ParsedPoint {
      const date =
        xScale.invert(
          pointerX,
        )

      const index =
        bisectDate(
          visibleSeries,
          date,
        )

      return visibleSeries[
        Math.max(
          0,
          Math.min(
            visibleSeries.length - 1,
            index,
          ),
        )
      ]
    }

    function positionTooltip(
      point: ParsedPoint,
      pointerY?: number,
    ) {
      const pointX =
        margin.left +
        xScale(
          point.parsedDate,
        )

      const tooltipNode =
        tooltip.node()

      const tooltipWidth =
        tooltipNode?.offsetWidth ??
        250

      let left =
        pointX + 14

      if (
        left +
          tooltipWidth >
        width - 8
      ) {
        left =
          pointX -
          tooltipWidth -
          14
      }

      left =
        Math.max(
          8,
          left,
        )

      const chartTop =
        controls.node()
          ?.getBoundingClientRect()
          .height ?? 0

      const desiredTop =
        chartTop +
        margin.top +
        (
          pointerY ??
          yScale(
            point.drawdown_pct,
          )
        ) -
        58

      tooltip
        .style(
          "left",
          `${left}px`,
        )
        .style(
          "top",
          `${Math.max(48, desiredTop)}px`,
        )
    }

    function showPoint(
      point: ParsedPoint,
      pointerY?: number,
    ) {
      const x =
        xScale(
          point.parsedDate,
        )

      const y =
        yScale(
          point.drawdown_pct,
        )

      focus
        .style(
          "display",
          null,
        )

      focusLine
        .attr("x1", x)
        .attr("x2", x)

      focusDot
        .attr("cx", x)
        .attr("cy", y)

      tooltip
        .html(
          tooltipHtml(point),
        )
        .style(
          "opacity",
          "1",
        )

      positionTooltip(
        point,
        pointerY,
      )
    }

    function hidePoint() {
      if (
        isMobile &&
        selectedPoint
      ) {
        return
      }

      focus.style(
        "display",
        "none",
      )

      tooltip.style(
        "opacity",
        "0",
      )
    }

    // ========================================================================
    // INTERACTION OVERLAY
    // ========================================================================

    const overlay = chart
      .append("rect")
      .attr(
        "class",
        "tni-drawdown-overlay",
      )
      .attr("x", 0)
      .attr("y", 0)
      .attr(
        "width",
        innerWidth,
      )
      .attr(
        "height",
        innerHeight,
      )
      .attr(
        "fill",
        "transparent",
      )
      .style(
        "cursor",
        isMobile
          ? "pointer"
          : "crosshair",
      )
      .style(
        "touch-action",
        "pan-y",
      )

    if (isMobile) {
      overlay.on(
        "click",
        function (event) {
          const [
            pointerX,
            pointerY,
          ] = d3.pointer(
            event,
            this,
          )

          const point =
            nearestPoint(
              pointerX,
            )

          selectedPoint =
            point

          showPoint(
            point,
            pointerY,
          )
        },
      )
    } else {
      overlay
        .on(
          "mouseenter",
          function (event) {
            const [
              pointerX,
              pointerY,
            ] = d3.pointer(
              event,
              this,
            )

            showPoint(
              nearestPoint(
                pointerX,
              ),
              pointerY,
            )
          },
        )
        .on(
          "mousemove",
          function (event) {
            const [
              pointerX,
              pointerY,
            ] = d3.pointer(
              event,
              this,
            )

            showPoint(
              nearestPoint(
                pointerX,
              ),
              pointerY,
            )
          },
        )
        .on(
          "mouseleave",
          () => {
            selectedPoint = null
            hidePoint()
          },
        )
    }

    // Restore mobile selection after a resize/redraw when possible.
    if (
      isMobile &&
      selectedPoint &&
      selectedPoint.parsedDate >=
        domainStart &&
      selectedPoint.parsedDate <=
        domainEnd
    ) {
      showPoint(
        selectedPoint,
      )
    } else if (
      selectedPoint &&
      (
        selectedPoint.parsedDate <
          domainStart ||
        selectedPoint.parsedDate >
          domainEnd
      )
    ) {
      selectedPoint = null
      tooltip.style(
        "opacity",
        "0",
      )
    }

    // ========================================================================
    // FOOTER — SOURCE + WATERMARK
    // ========================================================================

    svg
      .append("text")
      .attr(
        "x",
        margin.left,
      )
      .attr(
        "y",
        isMobile
          ? height - 44
          : height - 18,
      )
      .attr(
        "fill",
        theme.colors.textSecondary,
      )
      .attr(
        "font-family",
        theme.typography.fontFamily,
      )
      .attr(
        "font-size",
        12,
      )
      .attr(
        "font-weight",
        500,
      )
      .text(
        `Source: ${dataset.source}`,
      )

    svg
      .append("text")
      .attr(
        "x",
        isMobile
          ? margin.left
          : width - margin.right,
      )
      .attr(
        "y",
        isMobile
          ? height - 16
          : height - 18,
      )
      .attr(
        "text-anchor",
        isMobile
          ? "start"
          : "end",
      )
      .attr(
        "fill",
        theme.colors.watermark,
      )
      .attr(
        "font-family",
        theme.typography.fontFamily,
      )
      .attr(
        "font-size",
        isMobile
          ? 13
          : theme.typography.watermarkSize,
      )
      .attr(
        "font-weight",
        700,
      )
      .text(
        "TradingNInvestment",
      )
  }

  // ==========================================================================
  // RANGE BUTTON EVENTS
  // ==========================================================================

  buttons.on(
    "click",
    (
      _event,
      range,
    ) => {
      activeRange = range
      selectedPoint = null

      tooltip.style(
        "opacity",
        "0",
      )

      updateButtons()
      draw()
    },
  )

  // ==========================================================================
  // INITIAL DRAW
  // ==========================================================================

  draw()

  // ==========================================================================
  // RESPONSIVE REDRAW
  //
  // The React wrapper does not need viewport logic.
  // The chart responds to its actual parent width.
  // ==========================================================================

  let resizeFrame:
    number | null = null

  const resizeObserver =
    new ResizeObserver(
      (entries) => {
        const width =
          entries[0]
            ?.contentRect
            .width ?? 0

        if (
          width <= 0 ||
          Math.abs(
            width - lastWidth,
          ) < 2
        ) {
          return
        }

        if (
          resizeFrame !== null
        ) {
          cancelAnimationFrame(
            resizeFrame,
          )
        }

        resizeFrame =
          requestAnimationFrame(
            () => {
              resizeFrame = null
              draw()
            },
          )
      },
    )

  resizeObserver.observe(
    container,
  )

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  return () => {
    resizeObserver.disconnect()

    if (
      resizeFrame !== null
    ) {
      cancelAnimationFrame(
        resizeFrame,
      )
    }

    tooltip.remove()
    controls.remove()
    chartHost.remove()
  }
}
