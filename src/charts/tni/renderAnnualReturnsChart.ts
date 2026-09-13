// ============================================================
// TNI ANNUAL RETURNS CHART RENDERER
// Reusable D3 renderer for annual return bar charts
// ============================================================

import * as d3 from "d3";

import { tniChartTheme } from "./tniChartTheme";

import type {
  TNIAnnualReturnsChartConfig,
  TNIChartThemeOverrides,
} from "./tniChartTypes";


// ============================================================
// TNI RESOLVED THEME
// Combines global TNI defaults with chart-specific overrides
// ============================================================

function resolveTheme(overrides?: TNIChartThemeOverrides) {
  return {
    colors: {
      ...tniChartTheme.colors,
      ...(overrides?.colors ?? {}),
    },

    typography: {
      ...tniChartTheme.typography,
    },

    spacing: {
      ...tniChartTheme.spacing,
    },

    chart: {
      ...tniChartTheme.chart,
      ...(overrides?.chart ?? {}),
    },
  };
}


// ============================================================
// TNI VALUE FORMATTER
// Standard percentage formatting for annual return values
// ============================================================

function formatReturn(value: number): string {
  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(2)}%`;
}


// ============================================================
// TNI RESPONSIVE YEAR LABEL INTERVAL
// Prevents overcrowded x-axis labels on long historical series
// ============================================================

function getYearLabelInterval(
  dataLength: number,
  width: number
): number {
  // ==========================================================
  // TNI RESPONSIVE YEAR LABEL DENSITY
  // Prioritize readable labels over maximum label count
  // ==========================================================

  if (width < 720) {
    if (dataLength > 80) return 30;
    if (dataLength > 50) return 20;
    if (dataLength > 25) return 10;

    return 5;
  }

  if (dataLength > 80) return 10;
  if (dataLength > 50) return 5;
  if (dataLength > 25) return 2;

  return 1;
}


// ============================================================
// TNI ANNUAL RETURNS RENDERER
// Renders the chart into any supplied HTML container
//
// Returns a cleanup function so React or another consumer can
// safely destroy the chart and tooltip when unmounted.
// ============================================================

export function renderAnnualReturnsChart(
  container: HTMLElement,
  config: TNIAnnualReturnsChartConfig
): () => void {
  const theme = resolveTheme(config.themeOverrides);

  // ==========================================================
  // CLEAN EXISTING CHART
  // Prevent duplicate SVGs when the chart is re-rendered
  // ==========================================================

  d3.select(container).selectAll("*").remove();


  // ==========================================================
  // CHART DIMENSIONS
  // Responsive width comes from the parent container
  // ==========================================================

  const containerWidth =
    container.clientWidth > 0
      ? container.clientWidth
      : 900;

  const width = containerWidth;

  // ==========================================================
  // TNI RESPONSIVE CHART MODE
  // Mobile and desktop receive dedicated spacing and typography
  // ==========================================================

  const isMobile =
    width < 720;

  // ==========================================================
  // TNI RESPONSIVE CHART HEIGHT
  // Mobile remains compact while reserving a clean footer zone
  // ==========================================================

  const height =
    isMobile
      ? 420
      : config.height ??
        theme.chart.defaultHeight;

  // ==========================================================
  // TNI RESPONSIVE CHART MARGINS
  //
  // IMPORTANT:
  // Extra bottom space is intentional.
  // It separates:
  //   1. Year labels
  //   2. Source attribution
  //   3. TradingNInvestment watermark
  // ==========================================================

  const margin =
    isMobile
      ? {
          top: 34,
          right: 12,
          bottom: 124,
          left: 58,
        }
      : {
          ...theme.spacing,
          bottom:
            theme.spacing.bottom + 24,
        };

  // ==========================================================
  // TNI RESPONSIVE AXIS TYPOGRAPHY
  //
  // Desktop is larger than the original chart.
  // Mobile remains substantially larger but avoids overlap.
  // ==========================================================

  const axisFontSize =
    isMobile
      ? 22
      : 15;

  const yearFontSize =
    isMobile
      ? 20
      : 15;

  const innerWidth =
    Math.max(
      0,
      width -
        margin.left -
        margin.right
    );

  const innerHeight =
    Math.max(
      0,
      height -
        margin.top -
        margin.bottom
    );


  // ==========================================================
  // DATA VALIDATION
  // Ignore malformed observations instead of breaking chart
  // ==========================================================

  const data = config.data
    .filter(
      (point) =>
        Number.isFinite(point.year) &&
        Number.isFinite(point.value)
    )
    .sort(
      (a, b) =>
        a.year - b.year
    );

  if (data.length === 0) {
    const emptyState =
      document.createElement("div");

    emptyState.textContent =
      "No verified chart data available.";

    emptyState.style.padding =
      "32px";

    emptyState.style.fontFamily =
      theme.typography.fontFamily;

    emptyState.style.color =
      theme.colors.textSecondary;

    container.appendChild(
      emptyState
    );

    return () => {
      container.innerHTML = "";
    };
  }


  // ==========================================================
  // ROOT CONTAINER
  // Establish positioning for the SVG and HTML tooltip
  // ==========================================================

  container.style.position =
    "relative";

  container.style.fontFamily =
    theme.typography.fontFamily;


  // ==========================================================
  // SVG ROOT
  // ==========================================================

  const svg = d3
    .select(container)
    .append("svg")
    .attr(
      "width",
      "100%"
    )
    .attr(
      "height",
      height
    )
    .attr(
      "viewBox",
      `0 0 ${width} ${height}`
    )
    .attr(
      "preserveAspectRatio",
      "xMidYMid meet"
    )
    .attr(
      "role",
      "img"
    )
    .attr(
      "aria-label",
      `${config.title}. ${config.subtitle ?? ""}`
    )
    .style(
      "display",
      "block"
    )
    .style(
      "background",
      theme.colors.background
    );


  // ==========================================================
  // CHART TITLE
  // ==========================================================

  svg
    .append("text")
    .attr(
      "x",
      margin.left
    )
    .attr(
      "y",
      29
    )
    .attr(
      "fill",
      theme.colors.textPrimary
    )
    .attr(
      "font-size",
      theme.typography.titleSize
    )
    .attr(
      "font-weight",
      700
    )
    .text(
      config.title
    );


  // ==========================================================
  // CHART SUBTITLE
  // ==========================================================

  if (config.subtitle) {
    svg
      .append("text")
      .attr(
        "x",
        margin.left
      )
      .attr(
        "y",
        51
      )
      .attr(
        "fill",
        theme.colors.textSecondary
      )
      .attr(
        "font-size",
        theme.typography.subtitleSize
      )
      .text(
        config.subtitle
      );
  }


  // ==========================================================
  // MAIN CHART GROUP
  // ==========================================================

  const chart = svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left},${margin.top})`
    );


  // ==========================================================
  // X SCALE
  // One band for every year
  // ==========================================================

  const xScale = d3
    .scaleBand<number>()
    .domain(
      data.map(
        (point) =>
          point.year
      )
    )
    .range([
      0,
      innerWidth,
    ])
    .padding(
      theme.chart.barGapRatio
    );


  // ==========================================================
  // Y SCALE
  // Always includes zero so positive and negative years
  // are visually comparable
  // ==========================================================

  const minValue =
    d3.min(
      data,
      (point) =>
        point.value
    ) ?? 0;

  const maxValue =
    d3.max(
      data,
      (point) =>
        point.value
    ) ?? 0;

  const lowerBound =
    Math.min(
      0,
      minValue
    );

  const upperBound =
    Math.max(
      0,
      maxValue
    );

  const range =
    upperBound -
    lowerBound || 1;

  const yScale = d3
    .scaleLinear()
    .domain([
      lowerBound -
        range * 0.08,
      upperBound +
        range * 0.08,
    ])
    .nice()
    .range([
      innerHeight,
      0,
    ]);


  // ==========================================================
  // Y AXIS GRIDLINES
  // ==========================================================

  const yAxisGrid =
    d3
      .axisLeft(yScale)
      .ticks(6)
      .tickSize(
        -innerWidth
      )
      .tickFormat(
        (value) =>
          `${value}%`
      );

  const yGrid = chart
    .append("g")
    .call(
      yAxisGrid
    );

  yGrid
    .select(".domain")
    .remove();

  yGrid
    .selectAll(".tick line")
    .attr(
      "stroke",
      theme.colors.grid
    )
    .attr(
      "stroke-width",
      1
    );

  yGrid
    .selectAll(".tick text")
    .attr(
      "fill",
      theme.colors.textSecondary
    )
    .attr(
      "font-size",
      axisFontSize
    )
    .attr(
      "font-weight",
      isMobile
        ? 650
        : 600
    );


  // ==========================================================
  // X AXIS
  // Dynamically reduces visible labels for long histories
  // ==========================================================

  const yearInterval =
    getYearLabelInterval(
      data.length,
      width
    );

  const firstYear =
    data[0].year;

  const lastYear =
    data[data.length - 1].year;

  // ==========================================================
  // TNI MOBILE YEAR LABEL CONTROL
  //
  // Mobile:
  // - Maximum 4 visible year labels
  // - Always keep first year
  // - Always keep latest year
  // - Suppress the year immediately before latest
  //   when enough observations exist
  //
  // Desktop:
  // - Preserve existing interval-based behavior
  // ==========================================================

  const allYears =
    data.map(
      (point) =>
        point.year
    );

  let visibleYears: number[];

  if (isMobile) {
    if (allYears.length <= 4) {
      visibleYears =
        [...allYears];
    } else {
      const interiorYears =
        allYears.slice(
          1,
          -2
        );

      const firstInterior =
        interiorYears[
          Math.floor(
            interiorYears.length / 3
          )
        ];

      const secondInterior =
        interiorYears[
          Math.floor(
            (interiorYears.length * 2) / 3
          )
        ];

      visibleYears = [
        firstYear,
        firstInterior,
        secondInterior,
        lastYear,
      ].filter(
        (
          year,
          index,
          years
        ) =>
          Number.isFinite(year) &&
          years.indexOf(year) === index
      );
    }
  } else {
    visibleYears =
      allYears.filter(
        (year) =>
          year === firstYear ||
          year === lastYear ||
          (
            year !== 1930 &&
            year % yearInterval === 0
          )
      );
  }

  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(
      visibleYears
    )
    .tickSizeOuter(0);

  const xAxisGroup =
    chart
      .append("g")
      .attr(
        "transform",
        `translate(0,${innerHeight})`
      )
      .call(
        xAxis
      );

  xAxisGroup
    .select(".domain")
    .attr(
      "stroke",
      theme.colors.border
    );

  xAxisGroup
    .selectAll(".tick line")
    .attr(
      "stroke",
      theme.colors.border
    );

  xAxisGroup
    .selectAll(".tick text")
    .attr(
      "fill",
      theme.colors.textSecondary
    )
    .attr(
      "font-size",
      yearFontSize
    )
    .attr(
      "font-weight",
      isMobile
        ? 650
        : 600
    )
    .attr(
      "dy",
      isMobile
        ? "1.05em"
        : "1.1em"
    );


  // ==========================================================
  // ZERO REFERENCE LINE
  // ==========================================================

  if (
    config.showZeroLine !== false
  ) {
    chart
      .append("line")
      .attr(
        "x1",
        0
      )
      .attr(
        "x2",
        innerWidth
      )
      .attr(
        "y1",
        yScale(0)
      )
      .attr(
        "y2",
        yScale(0)
      )
      .attr(
        "stroke",
        theme.colors.zeroLine
      )
      .attr(
        "stroke-width",
        1.4
      );
  }


  // ==========================================================
  // HTML TOOLTIP
  // Shared premium tooltip style
  // ==========================================================

  const tooltip = d3
    .select(container)
    .append("div")
    .style(
      "position",
      "absolute"
    )
    .style(
      "pointer-events",
      "none"
    )
    .style(
      "opacity",
      "0"
    )
    .style(
      "z-index",
      "20"
    )
    .style(
      "padding",
      "10px 12px"
    )
    .style(
      "border-radius",
      "8px"
    )
    .style(
      "background",
      theme.colors.tooltipBackground
    )
    .style(
      "color",
      theme.colors.tooltipText
    )
    .style(
      "font-size",
      `${theme.typography.tooltipSize}px`
    )
    .style(
      "line-height",
      "1.4"
    )
    .style(
      "box-shadow",
      "0 8px 24px rgba(0, 0, 0, 0.14)"
    );


  // ==========================================================
  // RETURN BARS
  // Positive = TNI positive color
  // Negative = TNI negative color
  // ==========================================================

  const bars = chart
    .selectAll<
      SVGRectElement,
      (typeof data)[number]
    >(".tni-return-bar")
    .data(data)
    .join("rect")
    .attr(
      "class",
      "tni-return-bar"
    )
    .attr(
      "x",
      (point) =>
        xScale(
          point.year
        ) ?? 0
    )
    .attr(
      "width",
      xScale.bandwidth()
    )
    .attr(
      "rx",
      theme.chart.barRadius
    )
    .attr(
      "ry",
      theme.chart.barRadius
    )
    .attr(
      "fill",
      (point) =>
        point.value >= 0
          ? theme.colors.positive
          : theme.colors.negative
    )
    .attr(
      "y",
      yScale(0)
    )
    .attr(
      "height",
      0
    );


  // ==========================================================
  // BAR HOVER INTERACTIONS
  // ==========================================================

  bars
    .on(
      "mouseenter",
      function (
        _event,
        point
      ) {
        d3
          .select(this)
          .attr(
            "opacity",
            0.78
          );

        const returnLabel =
          formatReturn(
            point.value
          );

        const noteHtml =
          point.note
            ? `<div style="margin-top:4px;opacity:.8">${point.note}</div>`
            : "";

        tooltip
          .html(
            `
              <div style="font-weight:700">
                ${point.label ?? point.year}
              </div>

              <div style="margin-top:2px">
                ${config.metricLabel}: ${returnLabel}
              </div>

              ${noteHtml}
            `
          )
          .style(
            "opacity",
            "1"
          );
      }
    )
    .on(
      "mousemove",
      function (
        event
      ) {
        const bounds =
          container.getBoundingClientRect();

        const tooltipNode =
          tooltip.node();

        const tooltipWidth =
          tooltipNode?.offsetWidth ??
          140;

        const desiredLeft =
          event.clientX -
          bounds.left +
          14;

        const maxLeft =
          width -
          tooltipWidth -
          8;

        const left =
          Math.min(
            Math.max(
              8,
              desiredLeft
            ),
            maxLeft
          );

        const top =
          event.clientY -
          bounds.top -
          52;

        tooltip
          .style(
            "left",
            `${left}px`
          )
          .style(
            "top",
            `${Math.max(8, top)}px`
          );
      }
    )
    .on(
      "mouseleave",
      function () {
        d3
          .select(this)
          .attr(
            "opacity",
            1
          );

        tooltip
          .style(
            "opacity",
            "0"
          );
      }
    );


  // ==========================================================
  // BAR ENTRANCE ANIMATION
  // ==========================================================

  bars
    .transition()
    .duration(
      theme.chart.animationMs
    )
    .ease(
      d3.easeCubicOut
    )
    .attr(
      "y",
      (point) =>
        point.value >= 0
          ? yScale(
              point.value
            )
          : yScale(0)
    )
    .attr(
      "height",
      (point) =>
        Math.abs(
          yScale(
            point.value
          ) -
            yScale(0)
        )
    );


  // ==========================================================
  // TNI WATERMARK
  // Maintains attribution on screenshots and embedded charts
  // ==========================================================

  if (
    config.showWatermark !== false
  ) {
    svg
      .append("text")
      .attr(
        "x",
        isMobile
          ? margin.left
          : width - margin.right
      )
      .attr(
        "y",
        isMobile
          ? height - 16
          : height - 14
      )
      .attr(
        "text-anchor",
        isMobile
          ? "start"
          : "end"
      )
      .attr(
        "fill",
        theme.colors.watermark
      )
      .attr(
        "font-size",
        isMobile
          ? 13
          : theme.typography.watermarkSize
      )
      .attr(
        "font-weight",
        700
      )
      .text(
        config.branding.watermarkText
      );
  }


  // ==========================================================
  // SOURCE ATTRIBUTION
  // Displays only when a source has been supplied
  // ==========================================================

  if (
    config.showSource !== false &&
    config.branding.sourceLabel
  ) {
    svg
      .append("text")
      .attr(
        "x",
        margin.left
      )
      .attr(
        "y",
        isMobile
          ? height - 44
          : height - 14
      )
      .attr(
        "fill",
        theme.colors.textSecondary
      )
      .attr(
        "font-size",
        isMobile
          ? 12
          : 12
      )
      .attr(
        "font-weight",
        500
      )
      .text(
        `Source: ${config.branding.sourceLabel}`
      );
  }


  // ==========================================================
  // CLEANUP
  // Allows safe React unmount/re-render behavior
  // ==========================================================

  return () => {
    tooltip.remove();
    svg.remove();
  };
}
