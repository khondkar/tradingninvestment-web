// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — REACT / D3 CHART WRAPPER
// ============================================================================

import {
  useEffect,
  useMemo,
  useRef,
} from 'react'

import sp500AnnualReturns from '../../data/charts/sp500AnnualReturns.json'

import {
  renderAnnualReturnsChart,
} from '../../charts/tni/renderAnnualReturnsChart'

import type {
  TNIAnnualReturnPoint,
  TNIAnnualReturnsChartConfig,
} from '../../charts/tni/tniChartTypes'

// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — VERIFIED JSON TYPES
// ============================================================================

type SP500JsonRecord = {
  year: number
  value: number
  status: string
  label: string
}

type SP500JsonData = {
  data: SP500JsonRecord[]
}

// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — COMPONENT PROPS
//
// `data` allows the Return Explorer to control the chart.
// If no data is supplied, the chart falls back to the complete verified set.
// ============================================================================

type SP500AnnualReturnsChartProps = {
  data?: TNIAnnualReturnPoint[]
  rangeLabel?: string
}

// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — VERIFIED DEFAULT DATA
// ============================================================================

const dataset =
  sp500AnnualReturns as SP500JsonData

const fullChartData: TNIAnnualReturnPoint[] =
  dataset.data.map((row) => ({
    year: row.year,
    value: row.value,
    label: row.label,
  }))

// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — COMPONENT
// ============================================================================

export default function SP500AnnualReturnsChart({
  data,
  rangeLabel,
}: SP500AnnualReturnsChartProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null)

  // ==========================================================================
  // TNI CHART — FILTERED OR COMPLETE DATA
  // ==========================================================================

  const chartData =
    useMemo<TNIAnnualReturnPoint[]>(() => {
      return data ?? fullChartData
    }, [data])

  // ==========================================================================
  // TNI CHART — CONFIGURATION
  // ==========================================================================

  const chartConfig =
    useMemo<TNIAnnualReturnsChartConfig>(() => {
      return {
        id:
          'sp500-historical-annual-returns',

        title:
          'S&P 500 Historical Annual Returns by Year',

        subtitle:
          rangeLabel
            ? `${rangeLabel}. Interactive S&P 500 price-return history.`
            : 'Interactive S&P 500 price-return history from 1928 through 2026 YTD.',

        symbol: '^GSPC',

        metricLabel:
          'Annual price return',

        positiveLabel:
          'Positive year',

        negativeLabel:
          'Negative year',

        branding: {
          brandName:
            'TradingNInvestment',

          watermarkText:
            'TradingNInvestment.com | TNI Research',

          sourceLabel:
            'Yahoo Finance — S&P 500 Index (^GSPC)',
        },

        showZeroLine: true,
        showWatermark: true,
        showSource: true,

        height: 540,

        data: chartData,
      }
    }, [chartData, rangeLabel])

  // ==========================================================================
  // TNI CHART — D3 RENDER LIFECYCLE
  // ==========================================================================

  useEffect(() => {
    const container =
      containerRef.current

    if (!container) {
      return
    }

    const cleanup =
      renderAnnualReturnsChart(
        container,
        chartConfig,
      )

    return cleanup
  }, [chartConfig])

  // ==========================================================================
  // TNI CHART — RESPONSIVE CONTAINER
  // ==========================================================================

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minWidth: 0,
      }}
    />
  )
}
