import {
  useMemo,
} from 'react'

import GenericAnnualReturnsChart from '../../templates/GenericAnnualReturnsChart'

import type {
  TNIAnnualReturnPoint,
  TNIAnnualReturnsChartConfig,
} from '../../charts/tni/tniChartTypes'

import datasetJson from '../../../public/data/sp500-historical-return-methods.json'

export type SP500ReturnMode =
  | 'price_return'
  | 'total_return'
  | 'real_total_return'

export type SP500ReturnMethodChartRow = {
  year: number
  price_return: number
  total_return: number
  real_total_return: number
  inflation: number
  is_ytd: boolean
  data_through: string
  inflation_through: string
  real_return_through: string
  period_type: string
  price_source: string
  total_return_source: string
  inflation_source: string
  methodology: string
}

type Dataset = {
  dataset: string
  start_year: number
  end_year: number
  current_year_is_ytd: boolean
  data: SP500ReturnMethodChartRow[]
}

type Props = {
  mode: SP500ReturnMode
  data?: SP500ReturnMethodChartRow[]
  rangeLabel?: string
}

const dataset =
  datasetJson as Dataset

const MODE_CONFIG = {
  price_return: {
    title:
      'Historical U.S. Equity / S&P 500 Price Returns by Year',

    metricLabel:
      'Annual Price Return',
  },

  total_return: {
    title:
      'Historical U.S. Equity / S&P 500 Total Returns by Year',

    metricLabel:
      'Annual Total Return',
  },

  real_total_return: {
    title:
      'Historical U.S. Equity / S&P 500 Real Total Returns by Year',

    metricLabel:
      'Inflation-Adjusted Total Return',
  },
} satisfies Record<
  SP500ReturnMode,
  {
    title: string
    metricLabel: string
  }
>

export default function SP500ReturnMethodChart({
  mode,
  data,
  rangeLabel,
}: Props) {
  const modeConfig =
    MODE_CONFIG[mode]

  const sourceRows =
    data ?? dataset.data

  const latestRow =
    sourceRows[
      sourceRows.length - 1
    ] ??
    dataset.data[
      dataset.data.length - 1
    ]

  const chartData =
    useMemo<
      TNIAnnualReturnPoint[]
    >(() => {
      return sourceRows.map(
        (row) => ({
          year: row.year,

          value:
            row[mode],

          label:
            row.is_ytd
              ? `${row.year} YTD`
              : String(row.year),
        }),
      )
    }, [
      sourceRows,
      mode,
    ])

  const subtitle =
    rangeLabel ??
    (
      `${dataset.start_year}–${dataset.end_year}`
      + (
        dataset.current_year_is_ytd
          ? ' YTD'
          : ''
      )
      + ` · ${modeConfig.metricLabel}`
    )

  const sourceLabel =
    mode === 'price_return'
      ? latestRow.price_source
      : mode === 'total_return'
        ? latestRow.total_return_source
        : (
          `${latestRow.total_return_source}; `
          + latestRow.inflation_source
        )

  const chartConfig =
    useMemo<
      Omit<
        TNIAnnualReturnsChartConfig,
        'data'
      >
    >(() => ({
      id:
        `sp500-${mode}`,

      title:
        modeConfig.title,

      subtitle,

      symbol:
        'S&P 500',

      metricLabel:
        modeConfig.metricLabel,

      positiveLabel:
        'Positive Return',

      negativeLabel:
        'Negative Return',

      branding: {
        brandName:
          'TradingNInvestment',

        watermarkText:
          'TradingNInvestment.com | TNI Research',

        sourceLabel,
      },

      showZeroLine: true,
      showWatermark: true,
      showSource: true,

      height: 620,
    }), [
      mode,
      modeConfig,
      sourceLabel,
      subtitle,
    ])

  return (
    <GenericAnnualReturnsChart
      data={chartData}
      config={chartConfig}
    />
  )
}
