import * as d3 from 'd3'

import {
  tniChartTheme,
} from './tniChartTheme'

export type TNIDividendCompoundingPoint = {
  year: number
  priceWealth: number
  totalWealth: number
  contribution: number
  contributionPct: number
}

export type TNIDividendCompoundingChartConfig = {
  title: string
  subtitle: string
  data: TNIDividendCompoundingPoint[]
  height?: number
}

const dividendChartColors = {
  price: '#2563EB',
  total: '#123B73',
  contribution: '#D9468F',
} as const

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

function formatCompactCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    },
  ).format(value)
}

export function renderDividendCompoundingChart(
  container: HTMLElement,
  config: TNIDividendCompoundingChartConfig,
): () => void {
  d3
    .select(container)
    .selectAll('*')
    .remove()

  const data =
    [...config.data]
      .filter(
        (point) =>
          Number.isFinite(point.year) &&
          Number.isFinite(
            point.priceWealth,
          ) &&
          Number.isFinite(
            point.totalWealth,
          ),
      )
      .sort(
        (a, b) =>
          a.year - b.year,
      )

  if (data.length < 2) {
    container.textContent =
      'No verified compounding data available.'

    return () => {
      container.innerHTML = ''
    }
  }

  const width =
    container.clientWidth > 0
      ? container.clientWidth
      : 900

  const isMobile =
    width < 720

  const height =
    isMobile
      ? 420
      : config.height ?? 540

  /*
   * Match the responsive typography and spacing
   * already proven on the TNI S&P 500 annual-return chart.
   */
  const margin =
    isMobile
      ? {
          top: 82,
          right: 30,
          bottom: 124,
          left: 58,
        }
      : {
          top: 88,
          right: 34,
          bottom: 80,
          left: 82,
        }

  const axisFontSize =
    isMobile
      ? 22
      : 15

  const yearFontSize =
    isMobile
      ? 20
      : 15

  const innerWidth =
    Math.max(
      0,
      width -
        margin.left -
        margin.right,
    )

  const innerHeight =
    Math.max(
      0,
      height -
        margin.top -
        margin.bottom,
    )

  container.style.position =
    'relative'

  container.style.fontFamily =
    tniChartTheme.typography
      .fontFamily

  const svg =
    d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr(
        'viewBox',
        `0 0 ${width} ${height}`,
      )
      .attr(
        'preserveAspectRatio',
        'xMidYMid meet',
      )
      .attr('role', 'img')
      .attr(
        'aria-label',
        `${config.title}. ${config.subtitle}`,
      )
      .style('display', 'block')
      .style(
        'background',
        tniChartTheme.colors
          .background,
      )

  svg
    .append('text')
    .attr('x', margin.left)
    .attr('y', 30)
    .attr(
      'fill',
      tniChartTheme.colors
        .textPrimary,
    )
    .attr(
      'font-size',
      isMobile
        ? 18
        : tniChartTheme.typography
            .titleSize,
    )
    .attr('font-weight', 700)
    .text(config.title)

  svg
    .append('text')
    .attr('x', margin.left)
    .attr('y', 54)
    .attr(
      'fill',
      tniChartTheme.colors
        .textSecondary,
    )
    .attr(
      'font-size',
      isMobile
        ? 11
        : tniChartTheme.typography
            .subtitleSize,
    )
    .text(config.subtitle)

  const chart =
    svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left},${margin.top})`,
      )

  const firstYear =
    data[0].year

  const lastYear =
    data[data.length - 1].year

  const xScale =
    d3
      .scaleLinear()
      .domain([
        firstYear,
        lastYear,
      ])
      .range([
        0,
        innerWidth,
      ])

  const maxWealth =
    d3.max(
      data,
      (point) =>
        point.totalWealth,
    ) ?? 1

  /*
   * Linear wealth scale intentionally
   * starts at zero. The vertical distance
   * between the two paths therefore has
   * a direct dollar interpretation.
   */
  const yScale =
    d3
      .scaleLinear()
      .domain([
        0,
        maxWealth * 1.08,
      ])
      .nice()
      .range([
        innerHeight,
        0,
      ])

  const yAxis =
    d3
      .axisLeft(yScale)
      .ticks(
        isMobile
          ? 4
          : 6,
      )
      .tickSize(
        -innerWidth,
      )
      .tickFormat(
        (value) =>
          formatCompactCurrency(
            Number(value),
          ),
      )

  const yAxisGroup =
    chart
      .append('g')
      .call(yAxis)

  yAxisGroup
    .select('.domain')
    .remove()

  yAxisGroup
    .selectAll('.tick line')
    .attr(
      'stroke',
      tniChartTheme.colors.grid,
    )

  yAxisGroup
    .selectAll('.tick text')
    .attr(
      'fill',
      tniChartTheme.colors
        .textSecondary,
    )
    .attr(
      'font-size',
      axisFontSize,
    )
    .attr(
      'font-weight',
      isMobile
        ? 650
        : 600,
    )

  const allYears =
    data.map(
      (point) =>
        point.year,
    )

  let visibleYears: number[]

  /*
   * Same mobile philosophy as the TNI S&P 500 chart:
   * maximum four visible year labels while preserving
   * the beginning and latest observations.
   */
  if (isMobile) {
    if (allYears.length <= 4) {
      visibleYears =
        [...allYears]
    } else {
      const interiorYears =
        allYears.slice(
          1,
          -2,
        )

      const firstInterior =
        interiorYears[
          Math.floor(
            interiorYears.length / 3,
          )
        ]

      const secondInterior =
        interiorYears[
          Math.floor(
            (
              interiorYears.length *
              2
            ) / 3,
          )
        ]

      visibleYears = [
        firstYear,
        firstInterior,
        secondInterior,
        lastYear,
      ].filter(
        (
          year,
          index,
          years,
        ) =>
          Number.isFinite(year) &&
          years.indexOf(year) ===
            index,
      )
    }
  } else {
    const yearSpan =
      Math.max(
        1,
        lastYear - firstYear,
      )

    const rawInterval =
      Math.max(
        1,
        Math.ceil(yearSpan / 7),
      )

    const intervals = [
      1,
      2,
      5,
      10,
      20,
      25,
      50,
    ]

    const yearInterval =
      intervals.find(
        (interval) =>
          interval >= rawInterval,
      ) ?? rawInterval

    visibleYears =
      allYears.filter(
        (year) =>
          year === firstYear ||
          year === lastYear ||
          year % yearInterval === 0,
      )
  }

  const xAxis =
    d3
      .axisBottom(xScale)
      .tickValues(
        visibleYears,
      )
      .tickSizeOuter(0)

  const xAxisGroup =
    chart
      .append('g')
      .attr(
        'transform',
        `translate(0,${innerHeight})`,
      )
      .call(xAxis)

  xAxisGroup
    .select('.domain')
    .attr(
      'stroke',
      tniChartTheme.colors.border,
    )

  xAxisGroup
    .selectAll('.tick line')
    .attr(
      'stroke',
      tniChartTheme.colors.border,
    )

  xAxisGroup
    .selectAll('.tick text')
    .attr(
      'fill',
      tniChartTheme.colors
        .textSecondary,
    )
    .attr(
      'font-size',
      yearFontSize,
    )
    .attr(
      'font-weight',
      isMobile
        ? 650
        : 600,
    )
    .attr(
      'dy',
      isMobile
        ? '1.05em'
        : '1.1em',
    )

  /*
   * The shaded area is the dollar gap
   * between total-return wealth and
   * price-only wealth.
   */
  const contributionArea =
    d3
      .area<
        TNIDividendCompoundingPoint
      >()
      .x(
        (point) =>
          xScale(point.year),
      )
      .y0(
        (point) =>
          yScale(
            point.priceWealth,
          ),
      )
      .y1(
        (point) =>
          yScale(
            point.totalWealth,
          ),
      )
      .curve(
        d3.curveMonotoneX,
      )

  chart
    .append('path')
    .datum(data)
    .attr(
      'd',
      contributionArea,
    )
    .attr(
      'fill',
      dividendChartColors
        .contribution,
    )
    .attr(
      'fill-opacity',
      0.42,
    )
    .attr('pointer-events', 'none')

  const priceLine =
    d3
      .line<
        TNIDividendCompoundingPoint
      >()
      .x(
        (point) =>
          xScale(point.year),
      )
      .y(
        (point) =>
          yScale(
            point.priceWealth,
          ),
      )
      .curve(
        d3.curveMonotoneX,
      )

  const totalLine =
    d3
      .line<
        TNIDividendCompoundingPoint
      >()
      .x(
        (point) =>
          xScale(point.year),
      )
      .y(
        (point) =>
          yScale(
            point.totalWealth,
          ),
      )
      .curve(
        d3.curveMonotoneX,
      )

  chart
    .append('path')
    .datum(data)
    .attr('d', priceLine)
    .attr('fill', 'none')
    .attr(
      'stroke',
      dividendChartColors.price,
    )
    .attr(
      'stroke-width',
      isMobile
        ? 3.6
        : 4,
    )
    .attr(
      'stroke-linejoin',
      'round',
    )
    .attr(
      'stroke-linecap',
      'round',
    )
    .attr('pointer-events', 'none')

  chart
    .append('path')
    .datum(data)
    .attr('d', totalLine)
    .attr('fill', 'none')
    .attr(
      'stroke',
      dividendChartColors.total,
    )
    .attr(
      'stroke-width',
      isMobile
        ? 3.6
        : 4,
    )
    .attr(
      'stroke-linejoin',
      'round',
    )
    .attr(
      'stroke-linecap',
      'round',
    )
    .attr('pointer-events', 'none')

  /*
   * Legend
   */
  const legend =
    svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left},${height - 18})`,
      )

  const legendItems = [
    {
      label:
        'Price Return',
      color:
        dividendChartColors.price,
    },
    {
      label:
        'Total Return',
      color:
        dividendChartColors.total,
    },
    {
      label:
        'Dividend + Reinvestment',
      color:
        dividendChartColors.contribution,
      area: true,
    },
  ]

  let legendX = 0

  for (
    const item
    of legendItems
  ) {
    const group =
      legend
        .append('g')
        .attr(
          'transform',
          `translate(${legendX},0)`,
        )

    if (item.area) {
      group
        .append('rect')
        .attr('x', 0)
        .attr('y', -8)
        .attr('width', 18)
        .attr('height', 8)
        .attr(
          'fill',
          item.color,
        )
        .attr(
          'fill-opacity',
          0.15,
        )
    } else {
      group
        .append('line')
        .attr('x1', 0)
        .attr('x2', 18)
        .attr('y1', -4)
        .attr('y2', -4)
        .attr(
          'stroke',
          item.color,
        )
        .attr(
          'stroke-width',
          3,
        )
    }

    group
      .append('text')
      .attr('x', 24)
      .attr('y', 0)
      .attr(
        'fill',
        tniChartTheme.colors
          .textSecondary,
      )
      .attr(
        'font-size',
        isMobile
          ? 9
          : 11,
      )
      .text(item.label)

    legendX +=
      isMobile
        ? (
            item.area
              ? 130
              : 92
          )
        : (
            item.area
              ? 190
              : 125
          )
  }

  /*
   * HTML tooltip
   */
  const tooltip =
    d3
      .select(container)
      .append('div')
      .style(
        'position',
        'absolute',
      )
      .style(
        'pointer-events',
        'none',
      )
      .style(
        'opacity',
        '0',
      )
      .style(
        'z-index',
        '20',
      )
      .style(
        'min-width',
        isMobile
          ? '230px'
          : '285px',
      )
      .style(
        'padding',
        '0',
      )
      .style(
        'overflow',
        'hidden',
      )
      .style(
        'border',
        '1px solid rgba(255,255,255,0.14)',
      )
      .style(
        'border-radius',
        '12px',
      )
      .style(
        'background',
        tniChartTheme.colors
          .tooltipBackground,
      )
      .style(
        'color',
        tniChartTheme.colors
          .tooltipText,
      )
      .style(
        'box-shadow',
        '0 16px 42px rgba(7,27,47,0.28)',
      )
      .style(
        'font-size',
        `${tniChartTheme.typography.tooltipSize}px`,
      )

  const hoverLine =
    chart
      .append('line')
      .attr(
        'stroke',
        tniChartTheme.colors
          .zeroLine,
      )
      .attr(
        'stroke-width',
        1,
      )
      .attr(
        'stroke-dasharray',
        '4 4',
      )
      .attr('y1', 0)
      .attr(
        'y2',
        innerHeight,
      )
      .style(
        'opacity',
        0,
      )

  const priceDot =
    chart
      .append('circle')
      .attr('r', 5)
      .attr(
        'fill',
        dividendChartColors.price,
      )
      .attr(
        'stroke',
        '#ffffff',
      )
      .attr(
        'stroke-width',
        2,
      )
      .style(
        'opacity',
        0,
      )

  const totalDot =
    chart
      .append('circle')
      .attr('r', 5)
      .attr(
        'fill',
        dividendChartColors.total,
      )
      .attr(
        'stroke',
        '#ffffff',
      )
      .attr(
        'stroke-width',
        2,
      )
      .style(
        'opacity',
        0,
      )

  const bisectYear =
    d3.bisector<
      TNIDividendCompoundingPoint,
      number
    >(
      (point) =>
        point.year,
    ).center

  function showPoint(
    event:
      | MouseEvent
      | PointerEvent,
  ) {
    const [
      mouseX,
    ] =
      d3.pointer(
        event,
        chart.node(),
      )

    const year =
      xScale.invert(mouseX)

    const index =
      Math.max(
        0,
        Math.min(
          data.length - 1,
          bisectYear(
            data,
            year,
          ),
        ),
      )

    const point =
      data[index]

    const x =
      xScale(point.year)

    hoverLine
      .attr('x1', x)
      .attr('x2', x)
      .style(
        'opacity',
        1,
      )

    priceDot
      .attr('cx', x)
      .attr(
        'cy',
        yScale(
          point.priceWealth,
        ),
      )
      .style(
        'opacity',
        1,
      )

    totalDot
      .attr('cx', x)
      .attr(
        'cy',
        yScale(
          point.totalWealth,
        ),
      )
      .style(
        'opacity',
        1,
      )

    tooltip
      .html(`
        <div style="
          background:#1677ff;
          color:#ffffff;
          margin:-0px -0px 12px -0px;
          padding:9px 14px;
          font-size:11px;
          font-weight:800;
          letter-spacing:.07em;
          text-transform:uppercase;
        ">
          $10,000 Growth • ${point.year}
        </div>

        <div style="
          padding:0 14px 13px 14px;
          font-size:12px;
          line-height:1.55;
        ">
          <div style="
            display:grid;
            grid-template-columns:1fr auto;
            gap:6px 18px;
          ">
            <span>Price value</span>
            <strong>
              ${formatCurrency(
                point.priceWealth,
              )}
            </strong>

            <span>Total value</span>
            <strong>
              ${formatCurrency(
                point.totalWealth,
              )}
            </strong>

            <span>Dividend advantage</span>
            <strong>
              ${formatCurrency(
                point.contribution,
              )}
            </strong>

            <span>Contribution</span>
            <strong>
              ${point.contributionPct.toFixed(
                1,
              )}%
            </strong>
          </div>
        </div>
      `)
      .style(
        'opacity',
        '1',
      )

    const bounds =
      container
        .getBoundingClientRect()

    const tooltipNode =
      tooltip.node()

    const tooltipWidth =
      tooltipNode
        ?.getBoundingClientRect()
        .width ?? 220

    const rawLeft =
      event.clientX -
      bounds.left +
      14

    const left =
      Math.min(
        Math.max(
          8,
          rawLeft,
        ),
        width -
          tooltipWidth -
          8,
      )

    const top =
      Math.max(
        8,
        event.clientY -
          bounds.top -
          95,
      )

    tooltip
      .style(
        'left',
        `${left}px`,
      )
      .style(
        'top',
        `${top}px`,
      )
  }

  function hidePoint() {
    tooltip
      .style(
        'opacity',
        '0',
      )

    hoverLine
      .style(
        'opacity',
        0,
      )

    priceDot
      .style(
        'opacity',
        0,
      )

    totalDot
      .style(
        'opacity',
        0,
      )
  }

  chart
    .append('rect')
    .attr('width', innerWidth)
    .attr(
      'height',
      innerHeight,
    )
    .attr('fill', 'transparent')
    .style(
      'cursor',
      'crosshair',
    )
    .on(
      'pointermove',
      function (event) {
        showPoint(event)
      },
    )
    .on(
      'pointerleave',
      hidePoint,
    )

  /*
   * TNI watermark
   */
  svg
    .append('text')
    .attr(
      'x',
      width -
        margin.right,
    )
    .attr(
      'y',
      height - 18,
    )
    .attr(
      'text-anchor',
      'end',
    )
    .attr(
      'fill',
      tniChartTheme.colors
        .watermark,
    )
    .attr(
      'font-size',
      isMobile
        ? 8
        : 10,
    )
    .attr(
      'font-weight',
      700,
    )
    .text(
      'TradingNInvestment.com | TNI Research',
    )

  return () => {
    tooltip.remove()

    d3
      .select(container)
      .selectAll('*')
      .remove()
  }
}
