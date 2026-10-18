// ============================================================================
// TNI ANNUAL RETURNS - GENERIC REACT / D3 CHART WRAPPER
// ============================================================================

import {
  useEffect,
  useMemo,
  useRef,
} from 'react'

import {
  renderAnnualReturnsChart,
} from '../charts/tni/renderAnnualReturnsChart'

import type {
  TNIAnnualReturnPoint,
  TNIAnnualReturnsChartConfig,
} from '../charts/tni/tniChartTypes'

// ============================================================================
// TNI ANNUAL RETURNS - GENERIC CHART PROPS
// ============================================================================

type GenericAnnualReturnsChartProps = {
  data: TNIAnnualReturnPoint[]
  config: Omit<
    TNIAnnualReturnsChartConfig,
    'data'
  >
}

// ============================================================================
// TNI ANNUAL RETURNS - GENERIC CHART COMPONENT
// ============================================================================

export default function GenericAnnualReturnsChart({
  data,
  config,
}: GenericAnnualReturnsChartProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null)

  // ==========================================================================
  // TNI ANNUAL RETURNS - MERGE CONFIG WITH DATA
  // ==========================================================================

  const chartConfig =
    useMemo<TNIAnnualReturnsChartConfig>(() => {
      return {
        ...config,
        data,
      }
    }, [config, data])

  // ==========================================================================
  // TNI ANNUAL RETURNS - D3 RENDER LIFECYCLE
  // ==========================================================================

  useEffect(() => {
    const container =
      containerRef.current

    if (container === null) {
      return
    }

    let cleanup = renderAnnualReturnsChart(
      container,
      chartConfig,
    )

    let previousWidth = container.clientWidth

    const observer = new ResizeObserver(() => {
      const nextWidth = container.clientWidth

      if (
        nextWidth <= 0 ||
        Math.abs(nextWidth - previousWidth) < 1
      ) {
        return
      }

      previousWidth = nextWidth
      cleanup?.()
      cleanup = renderAnnualReturnsChart(
        container,
        chartConfig,
      )
    })

    observer.observe(container)

    return () => {
      observer.disconnect()
      cleanup?.()
    }
  }, [chartConfig])

  // ==========================================================================
  // TNI ANNUAL RETURNS - RESPONSIVE CONTAINER
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
