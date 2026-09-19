// ============================================================================
// TNI SEO — AUTOMATIC SITEMAP GENERATOR
//
// Discovers published research assets from TNI research registries.
// canonicalPath in each published asset config is the URL source of truth.
//
// Supported research families:
// - annual-returns
// - monthly-returns
// ============================================================================

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"


const scriptDir =
  path.dirname(
    fileURLToPath(import.meta.url),
  )

const rootDir =
  path.resolve(
    scriptDir,
    "..",
  )

const researchRoot =
  path.join(
    rootDir,
    "src",
    "research",
  )

const sitemapPath =
  path.join(
    rootDir,
    "public",
    "sitemap.xml",
  )

const siteOrigin =
  "https://tradingninvestment.com"


// ============================================================================
// TNI SITEMAP — PUBLISHED RESEARCH FAMILIES
// ============================================================================

const researchFamilies = [
  "annual-returns",
  "monthly-returns",
]


// ============================================================================
// TNI SITEMAP — DISCOVER CONFIG FILES FROM REGISTRY
// ============================================================================

function discoverCanonicalPaths(
  family,
) {

  const researchDir =
    path.join(
      researchRoot,
      family,
    )

  const registryPath =
    path.join(
      researchDir,
      "registry.ts",
    )

  if (!fs.existsSync(registryPath)) {
    throw new Error(
      `Missing research registry: ${registryPath}`,
    )
  }


  const registrySource =
    fs.readFileSync(
      registryPath,
      "utf8",
    )


  const importPattern =
    /import\s*\{[\s\S]*?\}\s*from\s*["']\.\/([^"']+)["']/g


  const configFiles = []

  let importMatch


  while (
    (
      importMatch =
        importPattern.exec(
          registrySource,
        )
    ) !== null
  ) {
    configFiles.push(
      importMatch[1] + ".ts",
    )
  }


  if (configFiles.length === 0) {
    throw new Error(
      `No published asset configs found in ${family} registry.`,
    )
  }


  return configFiles.map(
    (fileName) => {

      const configPath =
        path.join(
          researchDir,
          fileName,
        )


      const configSource =
        fs.readFileSync(
          configPath,
          "utf8",
        )


      const canonicalMatch =
        configSource.match(
          /canonicalPath:\s*["']([^"']+)["']/,
        )


      if (
        canonicalMatch === null
      ) {
        throw new Error(
          `Missing canonicalPath in published config: ${family}/${fileName}`,
        )
      }


      return canonicalMatch[1]
    },
  )
}


// ============================================================================
// TNI SITEMAP — COLLECT ALL PUBLISHED RESEARCH
// ============================================================================

const canonicalPaths =
  researchFamilies.flatMap(
    (family) =>
      discoverCanonicalPaths(
        family,
      ),
  )


// ============================================================================
// TNI SITEMAP — BUILD UNIQUE PUBLIC URL LIST
// ============================================================================

const marketTodayPaths = [
  "/stock-market-today/",
  "/stock-market-today/heatmap/",
  "/stock-market-today/sector-health/",
  "/stock-market-today/earnings-calendar/",
]


const standaloneResearchPaths = [
  "/stock-market-correction-myth-and-reality/",
]


const urls = [
  siteOrigin + "/",

  ...marketTodayPaths.map(
    (canonicalPath) =>
      siteOrigin +
      canonicalPath,
  ),

  ...canonicalPaths.map(
    (canonicalPath) =>
      siteOrigin +
      canonicalPath,
  ),

  ...standaloneResearchPaths.map(
    (canonicalPath) =>
      siteOrigin +
      canonicalPath,
  ),
]


const uniqueUrls =
  [...new Set(urls)]


// ============================================================================
// TNI SITEMAP — WRITE XML
// ============================================================================

const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',

  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',

  ...uniqueUrls.flatMap(
    (url) => [
      "  <url>",
      "    <loc>" +
        url +
        "</loc>",
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
