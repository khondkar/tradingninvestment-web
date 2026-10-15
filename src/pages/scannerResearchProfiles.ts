import { tqqqAnnualReturnsConfig } from '../research/annual-returns/tqqq'
import { soxlAnnualReturnsConfig } from '../research/annual-returns/soxl'
import { nvdlAnnualReturnsConfig } from '../research/annual-returns/nvdl'
import { tsllAnnualReturnsConfig } from '../research/annual-returns/tsll'
import type { AnnualReturnsAssetConfig } from '../research/annual-returns/types'

// Reuse editorial metadata; never turn an unverified candidate into a verified listing.
export const scannerResearchProfiles: Record<string, AnnualReturnsAssetConfig> = {
  TQQQ: tqqqAnnualReturnsConfig, SOXL: soxlAnnualReturnsConfig,
  NVDL: nvdlAnnualReturnsConfig, TSLL: tsllAnnualReturnsConfig,
}
