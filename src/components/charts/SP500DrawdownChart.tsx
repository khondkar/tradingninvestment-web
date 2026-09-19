// ============================================================================
// TNI S&P 500 DRAWDOWN CHART — REACT / D3 WRAPPER
// ============================================================================

import {
  useEffect,
  useRef,
} from "react"

import {
  renderDrawdownChart,
} from "../../charts/tni/renderDrawdownChart"

import type {
  TNIDrawdownDataset,
} from "../../charts/tni/renderDrawdownChart"


interface SP500DrawdownChartProps {
  dataset: TNIDrawdownDataset
}


export default function SP500DrawdownChart({
  dataset,
}: SP500DrawdownChartProps) {

  const containerRef =
    useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container =
      containerRef.current

    if (!container) {
      return
    }

    return renderDrawdownChart(
      container,
      dataset,
    )
  }, [dataset])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minWidth: 0,
      }}
    />
  )
}
