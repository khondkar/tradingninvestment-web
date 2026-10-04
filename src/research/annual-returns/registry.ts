// ============================================================================
// TNI ANNUAL RETURNS — PUBLISHED RESEARCH REGISTRY
//
// This registry is the canonical publication list for annual-return research.
// A research asset must be registered here before it is considered published.
// Research listings, article listings, routes, and future sitemap generation
// should derive from this registry.
// ============================================================================

import { aaplAnnualReturnsConfig } from "./aapl"
import { brkbAnnualReturnsConfig } from "./brkb"
import { gsAnnualReturnsConfig } from "./gs"
import { googlAnnualReturnsConfig } from "./googl"
import { tqqqAnnualReturnsConfig } from "./tqqq"
import { nvdlAnnualReturnsConfig } from "./nvdl"
import { soxlAnnualReturnsConfig } from "./soxl"
import { tslaAnnualReturnsConfig } from "./tsla"
import { dowAnnualReturnsConfig } from "./dow"
import { msftAnnualReturnsConfig } from "./msft"
import { nasdaqAnnualReturnsConfig } from "./nasdaq"
import { nvdaAnnualReturnsConfig } from "./nvda"
import { sp500AnnualReturnsConfig } from "./sp500"
import type { AnnualReturnsAssetConfig } from "./types"

type AnnualReturnsResearchRegistryBase = {
  config: AnnualReturnsAssetConfig
  featured: boolean
  previewImage?: string
}

type LegacyPublishedAnnualReturnsResearch = {
  legacyPublished: true
  publishAt?: never
}

type ScheduledAnnualReturnsResearch = {
  legacyPublished?: false
  publishAt: string
}

export type AnnualReturnsResearchRegistryEntry =
  AnnualReturnsResearchRegistryBase &
    (
      | LegacyPublishedAnnualReturnsResearch
      | ScheduledAnnualReturnsResearch
    )

// ============================================================================
// TNI ANNUAL RETURNS — PUBLISHED ASSETS
// ============================================================================

export const annualReturnsResearchRegistry:
  AnnualReturnsResearchRegistryEntry[] = [
    {
      config: sp500AnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
      previewImage:
        "/images/sp500-annual-returns-preview.svg",
    },
    {
      config: dowAnnualReturnsConfig,
      legacyPublished: true,
      featured: true,
    },
    {
      config: nasdaqAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
      previewImage:
        "/images/social/nasdaq-vs-sp500-historical-returns-og.svg",
    },
    {
      config: nvdaAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
    },
    {
      config: msftAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
    },
    {
      config: aaplAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
    },
    {
      config: brkbAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
    },
    {
      config: gsAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
    },
    {
      config: googlAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
    },
    {
      config: tslaAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
    },
    {
      config: tqqqAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
    },
    {
      config: nvdlAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
    },
    {
      config: soxlAnnualReturnsConfig,
      legacyPublished: true,
      featured: false,
    },
  ]

// ============================================================================
// TNI ANNUAL RETURNS — PUBLICATION SCHEDULING
// ============================================================================

export const isAnnualReturnsResearchPublished = (
  entry: AnnualReturnsResearchRegistryEntry,
  now = new Date(),
) => {
  if (entry.legacyPublished) return true

  const publishTime = new Date(entry.publishAt)

  return (
    !Number.isNaN(publishTime.getTime()) &&
    now.getTime() >= publishTime.getTime()
  )
}

export const publishedAnnualReturnsResearchRegistry =
  annualReturnsResearchRegistry.filter(
    (entry) => isAnnualReturnsResearchPublished(entry),
  )

