import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as d3 from 'd3'

import marketSnapshot from '../../data/market-today/snapshot.json'

import './SP500DailyHeatmap.css'

type StockRecord = {
  ticker: string
  yahoo_symbol: string
  company: string
  sector: string
  industry: string
  price: number
  previous_close: number
  change: number
  change_pct: number
  price_source: string
  price_timestamp: string
  previous_close_date: string
}

type TooltipState = {
  visible: boolean
  x: number
  y: number
  stock: StockRecord | null
}

type HeatmapNode = {
  name: string
  sectorSize?: number
  children?: HeatmapNode[]
  stock?: StockRecord
}

const snapshot = marketSnapshot as {
  constituents: StockRecord[]
  generated_at?: string
  market_status?: string
}

const MIN_WIDTH = 320
const DEFAULT_HEIGHT = 720

/*
 * Stock-cell sizing:
 *
 * - Absolute daily move controls relative size WITHIN a sector.
 * - 0.35% floor keeps quiet stocks visible.
 * - 8% cap prevents one extreme mover from dominating its sector.
 */
const MIN_MOVEMENT = 0.25
const MAX_MOVEMENT = 8
const MOVEMENT_EXPONENT = 1.45

function movementWeight(changePct: number) {
  if (!Number.isFinite(changePct)) {
    return Math.pow(
      MIN_MOVEMENT,
      MOVEMENT_EXPONENT,
    )
  }

  const magnitude = Math.min(
    Math.max(
      Math.abs(changePct),
      MIN_MOVEMENT,
    ),
    MAX_MOVEMENT,
  )

  return Math.pow(
    magnitude,
    MOVEMENT_EXPONENT,
  )
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatReturn(value: number) {
  if (!Number.isFinite(value)) {
    return '—'
  }

  const sign = value > 0 ? '+' : ''

  return `${sign}${value.toFixed(2)}%`
}

function returnColor(value: number) {
  if (!Number.isFinite(value)) {
    return '#7d8998'
  }

  const capped = Math.max(
    -5,
    Math.min(5, value),
  )

  if (Math.abs(capped) < 0.05) {
    return '#536477'
  }

  if (capped > 0) {
    const intensity =
      Math.min(capped / 5, 1)

    return d3.interpolateRgb(
      '#174b3a',
      '#00a85a',
    )(0.28 + intensity * 0.72)
  }

  const intensity =
    Math.min(Math.abs(capped) / 5, 1)

  return d3.interpolateRgb(
    '#5b2a30',
    '#df3341',
  )(0.28 + intensity * 0.72)
}

export default function SP500DailyHeatmap() {
  const containerRef =
    useRef<HTMLDivElement | null>(null)

  const [width, setWidth] =
    useState(1200)

  const [tooltip, setTooltip] =
    useState<TooltipState>({
      visible: false,
      x: 0,
      y: 0,
      stock: null,
    })

  const stocks = useMemo(
    () =>
      snapshot.constituents.filter(
        (stock) =>
          Number.isFinite(
            stock.change_pct,
          ) &&
          Number.isFinite(stock.price),
      ),
    [],
  )

  useEffect(() => {
    const element =
      containerRef.current

    if (!element) {
      return
    }

    const updateWidth = () => {
      setWidth(
        Math.max(
          MIN_WIDTH,
          Math.floor(
            element.clientWidth,
          ),
        ),
      )
    }

    updateWidth()

    const observer =
      new ResizeObserver(
        updateWidth,
      )

    observer.observe(element)

    return () =>
      observer.disconnect()
  }, [])

  const height =
    width < 600
      ? 1050
      : width < 900
        ? 850
        : DEFAULT_HEIGHT

  const root = useMemo(() => {
    const sectorOrder = [
      'Information Technology',
      'Financials',
      'Health Care',
      'Consumer Discretionary',
      'Communication Services',
      'Consumer Staples',
      'Energy',
      'Utilities',
      'Real Estate',
      'Materials',
      'Industrials',
    ]

    const grouped = d3.group(
      stocks,
      (stock) => stock.sector,
    )

    /*
     * Stage 1:
     *
     * Build the OUTER sector treemap using
     * constituent count.
     *
     * This keeps sector footprints stable
     * and comparable.
     */
    const sectorHierarchyData: HeatmapNode = {
      name: 'S&P 500',
      children: sectorOrder
        .filter((sector) =>
          grouped.has(sector),
        )
        .map((sector) => {
          const sectorStocks =
            grouped.get(sector) ?? []

          return {
            name: sector,
            sectorSize:
              sectorStocks.length,
          }
        }),
    }

    const sectorHierarchy =
      d3
        .hierarchy(sectorHierarchyData)
        .sum((node) =>
          node.sectorSize ?? 0,
        )
        .sort(
          (a, b) =>
            (b.value ?? 0) -
            (a.value ?? 0),
        )

    const sectorTreemap =
      d3
        .treemap<HeatmapNode>()
        .size([width, height])
        .paddingOuter(3)
        .paddingInner(3)
        .paddingTop((node) =>
          node.depth === 1
            ? 25
            : 0,
        )
        .round(true)(
          sectorHierarchy,
        )

    /*
     * Stage 2:
     *
     * Inside each sector, create another
     * treemap where ABSOLUTE DAILY MOVE
     * controls the stock rectangle size.
     */
    const stockLeaves:
      d3.HierarchyRectangularNode<HeatmapNode>[] =
      []

    const sectorNodes =
      sectorTreemap.children ?? []

    for (
      const sectorNode
      of sectorNodes
    ) {
      const sectorName =
        sectorNode.data.name

      const sectorStocks =
        [
          ...(
            grouped.get(
              sectorName,
            ) ?? []
          ),
        ].sort(
          (a, b) =>
            Math.abs(
              b.change_pct,
            ) -
            Math.abs(
              a.change_pct,
            ),
        )

      const innerWidth =
        Math.max(
          1,
          sectorNode.x1 -
            sectorNode.x0,
        )

      const innerHeight =
        Math.max(
          1,
          sectorNode.y1 -
            sectorNode.y0 -
            25,
        )

      const stockHierarchyData:
        HeatmapNode = {
        name: sectorName,
        children:
          sectorStocks.map(
            (stock) => ({
              name:
                stock.ticker,
              stock,
            }),
          ),
      }

      const stockHierarchy =
        d3
          .hierarchy(
            stockHierarchyData,
          )
          .sum((node) =>
            node.stock
              ? movementWeight(
                  node.stock
                    .change_pct,
                )
              : 0,
          )
          .sort(
            (a, b) =>
              (b.value ?? 0) -
              (a.value ?? 0),
          )

      const stockTreemap =
        d3
          .treemap<HeatmapNode>()
          .size([
            innerWidth,
            innerHeight,
          ])
          .paddingInner(1.5)
          .round(true)(
            stockHierarchy,
          )

      for (
        const leaf
        of stockTreemap.leaves()
      ) {
        /*
         * Translate the inner treemap
         * coordinates into the main SVG.
         */
        leaf.x0 +=
          sectorNode.x0

        leaf.x1 +=
          sectorNode.x0

        leaf.y0 +=
          sectorNode.y0 + 25

        leaf.y1 +=
          sectorNode.y0 + 25

        stockLeaves.push(leaf)
      }
    }

    return {
      sectors: sectorNodes,
      leaves: stockLeaves,
    }
  }, [
    stocks,
    width,
    height,
  ])

  function showTooltip(
    event:
      React.MouseEvent<
        SVGRectElement
      >,
    stock: StockRecord,
  ) {
    const container =
      containerRef.current
        ?.getBoundingClientRect()

    if (!container) {
      return
    }

    setTooltip({
      visible: true,
      x:
        event.clientX -
        container.left +
        14,
      y:
        event.clientY -
        container.top +
        14,
      stock,
    })
  }

  function moveTooltip(
    event:
      React.MouseEvent<
        SVGRectElement
      >,
  ) {
    const container =
      containerRef.current
        ?.getBoundingClientRect()

    if (!container) {
      return
    }

    setTooltip(
      (current) => ({
        ...current,
        x:
          event.clientX -
          container.left +
          14,
        y:
          event.clientY -
          container.top +
          14,
      }),
    )
  }

  function hideTooltip() {
    setTooltip(
      (current) => ({
        ...current,
        visible: false,
      }),
    )
  }

  return (
    <section className="sp500-heatmap-section">
      <div className="heatmap-performance-legend">
        <span className="heatmap-legend-label">
          DAILY RETURN
        </span>

        <div className="heatmap-legend-items">
          <span>
            <i className="heatmap-color hm-red-3" />
            -5%
          </span>

          <span>
            <i className="heatmap-color hm-red-2" />
            -3%
          </span>

          <span>
            <i className="heatmap-color hm-red-1" />
            -1%
          </span>

          <span>
            <i className="heatmap-color hm-flat" />
            0%
          </span>

          <span>
            <i className="heatmap-color hm-green-1" />
            +1%
          </span>

          <span>
            <i className="heatmap-color hm-green-2" />
            +3%
          </span>

          <span>
            <i className="heatmap-color hm-green-3" />
            +5%
          </span>
        </div>
      </div>

      <div
        className="sp500-heatmap-container"
        ref={containerRef}
      >
        <svg
          className="sp500-heatmap-svg"
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="S&P 500 daily stock performance heatmap sized by absolute daily price movement"
        >
          {root.sectors.map(
            (sector) => (
              <g
                key={
                  `sector-${sector.data.name}`
                }
              >
                <text
                  className="heatmap-sector-label"
                  x={
                    sector.x0 + 7
                  }
                  y={
                    sector.y0 + 17
                  }
                >
                  {
                    sector.data
                      .name
                  }
                </text>
              </g>
            ),
          )}

          {root.leaves.map(
            (leaf) => {
              const stock =
                leaf.data.stock

              if (!stock) {
                return null
              }

              const cellWidth =
                leaf.x1 -
                leaf.x0

              const cellHeight =
                leaf.y1 -
                leaf.y0

              /*
               * Larger mover cells naturally
               * earn more labeling space.
               */
              const showTicker =
                cellWidth >= 30 &&
                cellHeight >= 23

              const showReturn =
                cellWidth >= 40 &&
                cellHeight >= 38

              return (
                <g
                  key={
                    stock.ticker
                  }
                >
                  <rect
                    x={leaf.x0}
                    y={leaf.y0}
                    width={Math.max(
                      0,
                      cellWidth,
                    )}
                    height={Math.max(
                      0,
                      cellHeight,
                    )}
                    rx={2}
                    fill={returnColor(
                      stock.change_pct,
                    )}
                    className="heatmap-stock-cell"
                    onMouseEnter={(
                      event,
                    ) =>
                      showTooltip(
                        event,
                        stock,
                      )
                    }
                    onMouseMove={
                      moveTooltip
                    }
                    onMouseLeave={
                      hideTooltip
                    }
                  />

                  {showTicker && (
                    <text
                      className="heatmap-stock-ticker"
                      x={
                        (
                          leaf.x0 +
                          leaf.x1
                        ) / 2
                      }
                      y={
                        showReturn
                          ? (
                              leaf.y0 +
                              leaf.y1
                            ) /
                              2 -
                            5
                          : (
                              leaf.y0 +
                              leaf.y1
                            ) /
                              2 +
                            4
                      }
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {
                        stock.ticker
                      }
                    </text>
                  )}

                  {showReturn && (
                    <text
                      className="heatmap-stock-return"
                      x={
                        (
                          leaf.x0 +
                          leaf.x1
                        ) / 2
                      }
                      y={
                        (
                          leaf.y0 +
                          leaf.y1
                        ) /
                          2 +
                        15
                      }
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {formatReturn(
                        stock.change_pct,
                      )}
                    </text>
                  )}
                </g>
              )
            },
          )}
        </svg>

        {tooltip.visible &&
          tooltip.stock && (
            <div
              className="sp500-heatmap-tooltip"
              style={{
                left: tooltip.x,
                top: tooltip.y,
              }}
            >
              <div className="heatmap-tooltip-top">
                <strong>
                  {
                    tooltip.stock
                      .ticker
                  }
                </strong>

                <span
                  className={
                    tooltip.stock
                      .change_pct >= 0
                      ? 'positive'
                      : 'negative'
                  }
                >
                  {formatReturn(
                    tooltip.stock
                      .change_pct,
                  )}
                </span>
              </div>

              <div className="heatmap-tooltip-company">
                {
                  tooltip.stock
                    .company
                }
              </div>

              <div className="heatmap-tooltip-grid">
                <span>
                  Price
                </span>

                <strong>
                  {formatPrice(
                    tooltip.stock
                      .price,
                  )}
                </strong>

                <span>
                  Change
                </span>

                <strong>
                  {tooltip.stock
                    .change >= 0
                    ? '+'
                    : ''}
                  {tooltip.stock
                    .change.toFixed(
                      2,
                    )}
                </strong>

                <span>
                  Sector
                </span>

                <strong>
                  {
                    tooltip.stock
                      .sector
                  }
                </strong>

                <span>
                  Industry
                </span>

                <strong>
                  {
                    tooltip.stock
                      .industry
                  }
                </strong>
              </div>
            </div>
          )}
      </div>

      <div className="sp500-heatmap-footnote">
        <span>
          Green indicates a higher price versus the
          previous close; red indicates a lower price.
        </span>

        <span>
          Cell size reflects absolute daily price movement
          within each sector.
        </span>
      </div>
    </section>
  )
}
