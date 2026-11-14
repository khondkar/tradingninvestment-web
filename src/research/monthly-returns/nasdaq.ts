// ============================================================================
// TNI Nasdaq Composite MONTHLY RETURNS — ASSET CONFIG
// ============================================================================

import type {
  MonthlyReturnsAssetConfig,
} from "./types"
import { kamalResearchAuthor } from '../author'


export const nasdaqMonthlyReturnsConfig:
  MonthlyReturnsAssetConfig = {

  symbol: "^IXIC",

  slug: "nasdaq-monthly-returns",

  name: "Nasdaq Composite",

  shortName: "Nasdaq Composite",

  startYear: 1972,

  canonicalPath:
    "/nasdaq-monthly-returns/",

  returnType:
    "Nasdaq Composite Monthly Price Return",

  sourceLabel:
    "Yahoo Finance — Nasdaq Composite (^IXIC)",

  author: kamalResearchAuthor,

  categories: [
    "index",
    "nasdaq",
  ],

  newsSymbols: [
    "QQQ",
    "IXIC",
    "^IXIC",
  ],

  chart: {
    id:
      "nasdaq-historical-monthly-returns",

    title:
      "Nasdaq Composite Historical Monthly Returns",

    metricLabel:
      "Monthly price return",
  },

  seo: {
    title:
      "Nasdaq Composite Monthly Returns: Historical Returns by Month",

    description:
      "Explore Nasdaq Composite monthly returns from 1972 to the present, including historical returns by month, positive and negative month frequency, average returns, seasonal patterns, and current month performance.",
  },
}
