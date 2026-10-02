import * as d3 from 'd3'

import {
  tniChartTheme,
} from './tniChartTheme'

export type TNIDrawdownComparisonPoint = {
  date: string
  asset_drawdown_pct: number
  benchmark_drawdown_pct: number
}

export type TNIDrawdownComparisonChartConfig = {
  assetName: string
  benchmarkName: string
  data: TNIDrawdownComparisonPoint[]
  height?: number
}

const colors = {
  asset: '#2563EB',
  benchmark: '#7B8794',
} as const

export function renderDrawdownComparisonChart(
  container: HTMLElement,
  config: TNIDrawdownComparisonChartConfig,
): () => void {
  d3.select(container)
    .selectAll('*')
    .remove()

  const parseDate =
    d3.utcParse('%Y-%m-%d')

  const data = config.data
    .map((row) => ({
      date: parseDate(row.date),
      asset:
        row.asset_drawdown_pct,
      benchmark:
        row.benchmark_drawdown_pct,
    }))
    .filter(
      (
        row,
      ): row is {
        date: Date
        asset: number
        benchmark: number
      } =>
        row.date !== null &&
        Number.isFinite(row.asset) &&
        Number.isFinite(row.benchmark),
    )

  if (data.length < 2) {
    container.textContent =
      'No verified drawdown comparison data available.'

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
      ? 430
      : config.height ?? 520

  const margin =
    isMobile
      ? {
          top: 34,
          right: 22,
          bottom: 64,
          left: 62,
        }
      : {
          top: 34,
          right: 30,
          bottom: 62,
          left: 76,
        }

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

  const minimumDrawdown =
    Math.min(
      d3.min(
        data,
        (d) => d.asset,
      ) ?? 0,
      d3.min(
        data,
        (d) => d.benchmark,
      ) ?? 0,
    )

  const yMinimum =
    Math.floor(
      minimumDrawdown / 10,
    ) * 10

  const x =
    d3.scaleUtc()
      .domain(
        d3.extent(
          data,
          (d) => d.date,
        ) as [Date, Date],
      )
      .range([
        0,
        innerWidth,
      ])

  const y =
    d3.scaleLinear()
      .domain([
        yMinimum,
        0,
      ])
      .nice()
      .range([
        innerHeight,
        0,
      ])

  container.style.position =
    'relative'

  container.style.fontFamily =
    tniChartTheme.typography.fontFamily

  const svg =
    d3.select(container)
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
        `${config.assetName} versus ${config.benchmarkName} historical drawdowns`,
      )
      .style('display', 'block')
      .style(
        'background',
        tniChartTheme.colors.background,
      )

  const chart =
    svg.append('g')
      .attr(
        'transform',
        `translate(${margin.left},${margin.top})`,
      )

  chart.append('g')
    .call(
      d3.axisLeft(y)
        .ticks(
          isMobile ? 5 : 7,
        )
        .tickFormat(
          (value) =>
            `${Number(value)}%`,
        ),
    )
    .call(
      (group) =>
        group
          .select('.domain')
          .remove(),
    )
    .call(
      (group) =>
        group
          .selectAll('.tick line')
          .clone()
          .attr('x2', innerWidth)
          .attr(
            'stroke',
            tniChartTheme.colors.grid,
          ),
    )
    .call(
      (group) =>
        group
          .selectAll('text')
          .attr(
            'fill',
            tniChartTheme.colors.textSecondary,
          )
          .style(
            'font-size',
            isMobile
              ? '16px'
              : '12px',
          ),
    )

  chart.append('g')
    .attr(
      'transform',
      `translate(0,${innerHeight})`,
    )
    .call(
      d3.axisBottom<Date>(x)
        .ticks(
          isMobile ? 4 : 8,
        )
        .tickFormat(
          (value) =>
            d3.utcFormat('%Y')(
              value,
            ),
        ),
    )
    .call(
      (group) =>
        group
          .select('.domain')
          .attr(
            'stroke',
            tniChartTheme.colors.border,
          ),
    )
    .call(
      (group) =>
        group
          .selectAll('text')
          .attr(
            'fill',
            tniChartTheme.colors.textSecondary,
          )
          .style(
            'font-size',
            isMobile
              ? '15px'
              : '12px',
          ),
    )

  chart.append('line')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', y(0))
    .attr('y2', y(0))
    .attr(
      'stroke',
      tniChartTheme.colors.zeroLine,
    )
    .attr('stroke-width', 1.5)

  const assetArea =
    d3.area<{
      date: Date
      asset: number
      benchmark: number
    }>()
      .x(
        (d) => x(d.date),
      )
      .y0(y(0))
      .y1(
        (d) => y(d.asset),
      )
      .curve(
        d3.curveMonotoneX,
      )

  chart.append('path')
    .datum(data)
    .attr('d', assetArea)
    .attr(
      'fill',
      colors.asset,
    )
    .attr(
      'fill-opacity',
      0.09,
    )

  const assetLine =
    d3.line<{
      date: Date
      asset: number
      benchmark: number
    }>()
      .x(
        (d) => x(d.date),
      )
      .y(
        (d) => y(d.asset),
      )
      .curve(
        d3.curveMonotoneX,
      )

  const benchmarkLine =
    d3.line<{
      date: Date
      asset: number
      benchmark: number
    }>()
      .x(
        (d) => x(d.date),
      )
      .y(
        (d) => y(d.benchmark),
      )
      .curve(
        d3.curveMonotoneX,
      )

  chart.append('path')
    .datum(data)
    .attr('d', benchmarkLine)
    .attr('fill', 'none')
    .attr(
      'stroke',
      colors.benchmark,
    )
    .attr('stroke-width', 2)

  chart.append('path')
    .datum(data)
    .attr('d', assetLine)
    .attr('fill', 'none')
    .attr(
      'stroke',
      colors.asset,
    )
    .attr('stroke-width', 2.8)

  const legend =
    svg.append('g')
      .attr(
        'transform',
        `translate(${margin.left},18)`,
      )

  const legendRows = [
    {
      label:
        config.assetName,
      color:
        colors.asset,
      x: 0,
    },
    {
      label:
        config.benchmarkName,
      color:
        colors.benchmark,
      x:
        isMobile
          ? 120
          : 150,
    },
  ]

  for (
    const item
    of legendRows
  ) {
    legend.append('line')
      .attr('x1', item.x)
      .attr(
        'x2',
        item.x + 22,
      )
      .attr('y1', 0)
      .attr('y2', 0)
      .attr(
        'stroke',
        item.color,
      )
      .attr('stroke-width', 3)

    legend.append('text')
      .attr(
        'x',
        item.x + 29,
      )
      .attr('y', 4)
      .attr(
        'fill',
        tniChartTheme.colors.textPrimary,
      )
      .style(
        'font-size',
        isMobile
          ? '14px'
          : '12px',
      )
      .style(
        'font-weight',
        '700',
      )
      .text(item.label)
  }

  const tooltip =
    d3.select(container)
      .append('div')
      .style('position', 'absolute')
      .style(
        'pointer-events',
        'none',
      )
      .style('opacity', '0')
      .style(
        'background',
        tniChartTheme.colors.tooltipBackground,
      )
      .style(
        'color',
        tniChartTheme.colors.tooltipText,
      )
      .style(
        'padding',
        '10px 12px',
      )
      .style(
        'border-radius',
        '8px',
      )
      .style(
        'font-size',
        '13px',
      )
      .style(
        'line-height',
        '1.55',
      )
      .style(
        'box-shadow',
        '0 8px 24px rgba(7,27,47,.18)',
      )

  const focusLine =
    chart.append('line')
      .attr('y1', 0)
      .attr(
        'y2',
        innerHeight,
      )
      .attr(
        'stroke',
        tniChartTheme.colors.zeroLine,
      )
      .attr(
        'stroke-dasharray',
        '3 3',
      )
      .style('opacity', 0)

  const bisect =
    d3.bisector(
      (
        d: {
          date: Date
          asset: number
          benchmark: number
        },
      ) => d.date,
    ).center

  chart.append('rect')
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
      'mousemove',
      function (event) {
        const [
          mouseX,
        ] =
          d3.pointer(
            event,
            this,
          )

        const date =
          x.invert(mouseX)

        const index =
          bisect(
            data,
            date,
          )

        const point =
          data[index]

        if (!point) {
          return
        }

        const pointX =
          x(point.date)

        focusLine
          .attr('x1', pointX)
          .attr('x2', pointX)
          .style('opacity', 1)

        tooltip
          .style('opacity', '1')
          .html(
            `<strong>${d3.utcFormat(
              '%b %d, %Y',
            )(point.date)}</strong>`
            + `<br>${config.assetName}: ${point.asset.toFixed(2)}%`
            + `<br>${config.benchmarkName}: ${point.benchmark.toFixed(2)}%`,
          )

        const bounds =
          container.getBoundingClientRect()

        const tooltipNode =
          tooltip.node()

        const tooltipWidth =
          tooltipNode
            ?.getBoundingClientRect()
            .width ?? 180

        const desiredLeft =
          margin.left +
          pointX +
          14

        const left =
          Math.min(
            desiredLeft,
            bounds.width -
              tooltipWidth -
              8,
          )

        tooltip
          .style(
            'left',
            `${Math.max(
              8,
              left,
            )}px`,
          )
          .style(
            'top',
            `${Math.max(
              8,
              margin.top + 8,
            )}px`,
          )
      },
    )
    .on(
      'mouseleave',
      () => {
        focusLine
          .style('opacity', 0)

        tooltip
          .style('opacity', '0')
      },
    )

  return () => {
    d3.select(container)
      .selectAll('*')
      .remove()
  }
}
