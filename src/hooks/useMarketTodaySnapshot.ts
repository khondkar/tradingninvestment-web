import { useEffect, useState } from 'react'

import fallbackSnapshot from '../data/market-today/snapshot.json'

export type MarketRecord = {
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
  price_timestamp: string | null
  previous_close_date: string | null
}

export type Benchmark = {
  symbol: string
  name: string
  available: boolean
  price?: number
  previous_close?: number
  change?: number
  change_pct?: number
  price_source?: string
  price_timestamp?: string | null
  error?: string
}

export type SectorRecord = {
  sector: string
  stocks: number
  advancing: number
  declining: number
  unchanged: number
  positive_pct: number
  negative_pct: number
  average_change_pct: number
  median_change_pct: number
  health?: string
}

export type SectorHorizon = {
  label: string
  description: string
  refresh: string
  updated_at_et: string
  sectors: SectorRecord[]
}

export type MarketTodaySnapshot = {
  schema_version: number
  index: string
  generated_at_utc: string
  generated_at_et: string
  market_status: string
  source: string
  constituent_source?: string
  coverage: {
    expected: number
    successful: number
    failed: number
    pct: number
  }
  benchmarks: Benchmark[]
  breadth: {
    advancing: number
    declining: number
    unchanged: number
    total: number
    positive_pct: number
    negative_pct: number
  }
  sectors: SectorRecord[]
  sector_horizons: {
    methodology: string
    daily: SectorHorizon
    weekly: SectorHorizon
    monthly: SectorHorizon
    ytd: SectorHorizon
    coverage?: unknown
  }
  gainers: MarketRecord[]
  decliners: MarketRecord[]
  constituents: MarketRecord[]
  failures: unknown[]
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://quant-ai-agent.onrender.com'

const fallback =
  fallbackSnapshot as MarketTodaySnapshot

let cachedSnapshot: MarketTodaySnapshot = fallback
let requestPromise: Promise<MarketTodaySnapshot> | null = null

async function fetchSnapshot() {
  if (!requestPromise) {
    requestPromise = fetch(
      `${API_BASE_URL}/market/today`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Market Today API returned ${response.status}`,
          )
        }

        return response.json()
      })
      .then((data: MarketTodaySnapshot) => {
        cachedSnapshot = data
        return data
      })
      .catch(() => {
        requestPromise = null
        return cachedSnapshot
      })
  }

  return requestPromise
}

export function useMarketTodaySnapshot() {
  const [snapshot, setSnapshot] =
    useState<MarketTodaySnapshot>(cachedSnapshot)

  useEffect(() => {
    let active = true

    fetchSnapshot().then((data) => {
      if (active) {
        setSnapshot(data)
      }
    })

    return () => {
      active = false
    }
  }, [])

  return snapshot
}
