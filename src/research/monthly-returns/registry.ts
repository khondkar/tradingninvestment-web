// ============================================================================
// TNI MONTHLY RETURNS — PUBLISHED RESEARCH REGISTRY
//
// Every published monthly-return asset belongs here.
// canonicalPath in each asset config becomes the public URL source of truth.
// ============================================================================

import {
  sp500MonthlyReturnsConfig,
} from "./sp500"


export const monthlyReturnsRegistry = [
  {
    config:
      sp500MonthlyReturnsConfig,
    featured: false,
  },
]
