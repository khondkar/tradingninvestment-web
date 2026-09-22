// ============================================================================
// TNI HISTORICAL PRICE - GENERIC REACT / D3 CHART WRAPPER
// ============================================================================

import {
  useEffect,
  useMemo,
  useRef,
} from 'react'

import {
  renderHistoricalPriceChart,
} from '../charts/tni/renderHistoricalPriceChart'

import type {
  TNIHistoricalPricePoint,
  TNIHistoricalPriceChartConfig,
} from '../charts/tni/tniChartTypes'

type GenericHistoricalPriceChartProps = {
  data: TNIHistoricalPricePoint[]
  config: Omit<
    TNIHistoricalPriceChartConfig,
    'data'
  >
}

export default function GenericHistoricalPriceChart({
  data,
  config,
}: GenericHistoricalPriceChartProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null)

  const chartConfig =
    useMemo<TNIHistoricalPriceChartConfig>(() => {
      return {
        ...config,
        data,
      }
    }, [config, data])

  useEffect(() => {
    const container =
      containerRef.current

    if (container === null) {
      return
    }

    const cleanup =
      renderHistoricalPriceChart(
        container,
        chartConfig,
      )

    return cleanup
  }, [chartConfig])

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
