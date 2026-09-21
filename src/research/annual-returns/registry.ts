// ============================================================================
// TNI ANNUAL RETURNS — PUBLISHED RESEARCH REGISTRY
//
// This registry is the canonical publication list for annual-return research.
// A research asset must be registered here before it is considered published.
// Research listings, article listings, routes, and future sitemap generation
// should derive from this registry.
// ============================================================================

import { msftAnnualReturnsConfig } from "./msft"
import { nasdaqAnnualReturnsConfig } from "./nasdaq"
import { nvdaAnnualReturnsConfig } from "./nvda"
import { sp500AnnualReturnsConfig } from "./sp500"
import type { AnnualReturnsAssetConfig } from "./types"

export type AnnualReturnsResearchRegistryEntry = {
  config: AnnualReturnsAssetConfig
  featured: boolean
  previewImage?: string
}

// ============================================================================
// TNI ANNUAL RETURNS — PUBLISHED ASSETS
// ============================================================================

export const annualReturnsResearchRegistry:
  AnnualReturnsResearchRegistryEntry[] = [
    {
      config: sp500AnnualReturnsConfig,
      featured: true,
      previewImage:
        "/images/sp500-annual-returns-preview.svg",
    },
    {
      config: nasdaqAnnualReturnsConfig,
      featured: false,
      previewImage:
        "/images/social/nasdaq-vs-sp500-historical-returns-og.svg",
    },
    {
      config: nvdaAnnualReturnsConfig,
      featured: false,
    },
    {
      config: msftAnnualReturnsConfig,
      featured: false,
    },
  ]
