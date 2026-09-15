// ============================================================================
// TNI SEO — AUTOMATIC SITEMAP GENERATOR
//
// Reads the published annual-return registry and its asset configuration files.
// canonicalPath in each published asset config is the URL source of truth.
// ============================================================================

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, "..")

const researchDir = path.join(
  rootDir,
  "src",
  "research",
  "annual-returns",
)

const registryPath = path.join(
  researchDir,
  "registry.ts",
)

const sitemapPath = path.join(
  rootDir,
  "public",
  "sitemap.xml",
)

const siteOrigin = "https://tradingninvestment.com"

// ============================================================================
// TNI SITEMAP — DISCOVER PUBLISHED CONFIGS
// ============================================================================

const registrySource = fs.readFileSync(
  registryPath,
  "utf8",
)

const importPattern =
  /import\s+\{\s*\w+\s*\}\s+from\s+["']\.\/([^"']+)["']/g

const configFiles = []

let importMatch

while (
  (importMatch = importPattern.exec(registrySource)) !== null
) {
  configFiles.push(importMatch[1] + ".ts")
}

if (configFiles.length === 0) {
  throw new Error(
    "No published asset configs found in annual returns registry.",
  )
}

// ============================================================================
// TNI SITEMAP — EXTRACT CANONICAL PATHS
// ============================================================================

const canonicalPaths = configFiles.map(
  (fileName) => {
    const configPath = path.join(
      researchDir,
      fileName,
    )

    const configSource = fs.readFileSync(
      configPath,
      "utf8",
    )

    const canonicalMatch = configSource.match(
      /canonicalPath:\s*["']([^"']+)["']/,
    )

    if (canonicalMatch === null) {
      throw new Error(
        "Missing canonicalPath in published config: " +
          fileName,
      )
    }

    return canonicalMatch[1]
  },
)

// ============================================================================
// TNI SITEMAP — BUILD UNIQUE PUBLIC URL LIST
// ============================================================================

const urls = [
  siteOrigin + "/",
  ...canonicalPaths.map(
    (canonicalPath) =>
      siteOrigin + canonicalPath,
  ),
]

const uniqueUrls = [...new Set(urls)]

// ============================================================================
// TNI SITEMAP — WRITE XML
// ============================================================================

const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...uniqueUrls.flatMap(
    (url) => [
      "  <url>",
      "    <loc>" + url + "</loc>",
      "  </url>",
    ],
  ),
  "</urlset>",
  "",
]

fs.writeFileSync(
  sitemapPath,
  xmlLines.join("\n"),
  "utf8",
)

console.log(
  "TNI sitemap generated:",
  uniqueUrls.length,
  "URLs",
)
