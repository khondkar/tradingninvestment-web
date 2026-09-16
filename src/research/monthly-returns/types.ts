// ============================================================================
// TNI MONTHLY RETURNS — GENERIC DATA TYPES
//
// Shared by every monthly-return research asset:
// S&P 500, Microsoft, NVIDIA, Apple, etc.
//
// IMPORTANT:
// Derived UI statistics that are not stored in the JSON should be calculated
// from dataset.data rather than duplicated in the source file.
// ============================================================================

export type MonthlyReturnStatus =
  | "positive"
  | "negative"
  | "flat"


export interface MonthlyReturnRecord {
  year: number
  month: number
  month_name: string
  value: number
  status: MonthlyReturnStatus
}


export interface MonthlyReturnStatistic {
  month: number
  month_name: string

  observations: number

  positive_count: number
  negative_count: number

  positive_pct: number
  negative_pct: number

  average_return_pct: number
  median_return_pct: number
}


export interface CurrentMonthReturn {
  year: number
  month: number
  month_name: string
  label: string
  return_pct: number
  through_date: string
}


// ============================================================================
// LEADER TYPES
// ============================================================================

export interface MonthlyFrequencyLeader {
  month?: number
  month_name: string

  positive_pct?: number
  negative_pct?: number

  positive_count?: number
  negative_count?: number

  observations?: number
}


export interface MonthlyAverageLeader {
  month?: number
  month_name: string
  average_return_pct: number
}


export interface MonthlyReturnsLeaders {
  highest_positive_frequency:
    MonthlyFrequencyLeader

  highest_negative_frequency:
    MonthlyFrequencyLeader

  highest_average_return:
    MonthlyAverageLeader

  lowest_average_return:
    MonthlyAverageLeader
}


// ============================================================================
// DATASET
// ============================================================================

export interface MonthlyReturnsDataset {
  symbol: string
  ticker: string
  name: string

  metric?: string
  return_type?: string
  source?: string

  methodology?:
    | string
    | Record<string, unknown>

  range?: {
    start_year?: number
    start_month?: number
    end_year?: number
    end_month?: number
    observations?: number
    completed_month_observations?: number
  }

  current_month:
    CurrentMonthReturn | null

  leaders:
    MonthlyReturnsLeaders

  month_statistics:
    MonthlyReturnStatistic[]

  data:
    MonthlyReturnRecord[]
}


// ============================================================================
// TNI MONTHLY RETURNS — ASSET CONFIG
// ============================================================================

export interface MonthlyReturnsAssetConfig {
  symbol: string
  slug: string

  name: string
  shortName: string

  startYear: number

  canonicalPath: string

  returnType: string
  sourceLabel: string

  categories: string[]
  newsSymbols: string[]

  chart: {
    id: string
    title: string
    metricLabel: string
  }

  seo: {
    title: string
    description: string
  }
}
