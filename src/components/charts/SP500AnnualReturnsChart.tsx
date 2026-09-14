// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — THIN ADAPTER OVER GENERIC CHART
// ============================================================================

import {
  useMemo,
} from 'react'

import sp500AnnualReturns from '../../data/charts/sp500AnnualReturns.json'

import { sp500AnnualReturnsConfig } from '../../research/annual-returns/sp500'
import { buildAnnualReturnsChartSubtitle } from '../../research/annual-returns/labels'
import GenericAnnualReturnsChart from '../../templates/GenericAnnualReturnsChart'

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
  current_year: {
    year: number
  }
  data: SP500JsonRecord[]
}

// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — COMPONENT PROPS
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
// TNI S&P 500 ANNUAL RETURNS — THIN ADAPTER COMPONENT
// ============================================================================

export default function SP500AnnualReturnsChart({
  data,
  rangeLabel,
}: SP500AnnualReturnsChartProps) {
  const chartData =
    useMemo<TNIAnnualReturnPoint[]>(() => {
      return data ?? fullChartData
    }, [data])

  const chartConfig =
    useMemo<
      Omit<
        TNIAnnualReturnsChartConfig,
        'data'
      >
    >(() => {
      return {
        id:
          sp500AnnualReturnsConfig.chart.id,

        title:
          sp500AnnualReturnsConfig.chart.title,

        subtitle:
          rangeLabel
            ? `${rangeLabel}. ${sp500AnnualReturnsConfig.chart.rangeSubtitleSuffix}`
            : buildAnnualReturnsChartSubtitle(
                sp500AnnualReturnsConfig,
                dataset.current_year.year,
              ),

        symbol: sp500AnnualReturnsConfig.symbol,

        metricLabel:
          sp500AnnualReturnsConfig.chart.metricLabel,

        positiveLabel:
          sp500AnnualReturnsConfig.chart.positiveLabel,

        negativeLabel:
          sp500AnnualReturnsConfig.chart.negativeLabel,

        branding: {
          brandName:
            'TradingNInvestment',

          watermarkText:
            'TradingNInvestment.com | TNI Research',

          sourceLabel:
            sp500AnnualReturnsConfig.sourceLabel,
        },

        showZeroLine: true,
        showWatermark: true,
        showSource: true,

        height: sp500AnnualReturnsConfig.chart.height,
      }
    }, [rangeLabel])

  return (
    <GenericAnnualReturnsChart
      data={chartData}
      config={chartConfig}
    />
  )
}
