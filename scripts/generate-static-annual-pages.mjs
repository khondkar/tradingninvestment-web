import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { execFileSync } from "node:child_process"

const scriptDir =
  path.dirname(
    fileURLToPath(import.meta.url),
  )

const rootDir =
  path.resolve(
    scriptDir,
    "..",
  )

const distDir =
  path.join(
    rootDir,
    "dist",
  )

const templatePath =
  path.join(
    distDir,
    "index.html",
  )

const prerenderDir =
  path.join(
    rootDir,
    ".tni-prerender",
  )

const prerenderEntry =
  path.join(
    rootDir,
    "src",
    "entry-prerender.tsx",
  )

const prerenderBundle =
  path.join(
    prerenderDir,
    "entry-prerender.js",
  )

const siteOrigin =
  "https://tradingninvestment.com"

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function replaceRequired(
  source,
  pattern,
  replacement,
  label,
) {
  if (!pattern.test(source)) {
    throw new Error(
      `Unable to replace ${label}.`,
    )
  }

  return source.replace(
    pattern,
    replacement,
  )
}

function buildAvailablePeriodReturnsLabel(
  periods,
) {
  const labels =
    periods.map(
      (years) =>
        `${years}-Year`,
    )

  if (labels.length === 0) {
    return "Historical"
  }

  if (labels.length === 1) {
    return labels[0]
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`
  }

  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`
}

function buildSeoDescription(
  config,
  periods,
) {
  return `Explore ${config.name} returns by year from ${config.startYear} to present, including current-year and ${buildAvailablePeriodReturnsLabel(periods).toLowerCase()} returns, average historical returns, positive and negative years, and long-term market performance.`
}

function buildDatasetName(
  config,
) {
  return `${config.name} Historical Annual Returns: ${config.startYear} to Present`
}

function buildDatasetAlternateName(
  config,
) {
  return `TradingNInvestment ${config.name} Historical Return Research Dataset`
}

function buildDatasetDescription(
  config,
  periods,
) {
  return `Historical ${config.name} annual price-return research from ${config.startYear} to the latest available market data, including current-year performance and ${buildAvailablePeriodReturnsLabel(periods).toLowerCase()} return statistics.`
}

if (!fs.existsSync(templatePath)) {
  throw new Error(
    "dist/index.html does not exist. Run vite build first.",
  )
}

fs.rmSync(
  prerenderDir,
  {
    recursive: true,
    force: true,
  },
)

execFileSync(
  "npx",
  [
    "vite",
    "build",
    "--ssr",
    prerenderEntry,
    "--outDir",
    prerenderDir,
  ],
  {
    cwd: rootDir,
    stdio: "inherit",
  },
)

const {
  annualPrerenderPages,
  renderAnnualPage,
  monthlyPrerenderPages,
  renderMonthlyPage,
} =
  await import(
    pathToFileURL(
      prerenderBundle,
    ).href +
      `?t=${Date.now()}`
  )

const template =
  fs.readFileSync(
    templatePath,
    "utf8",
  )

for (
  const page
  of annualPrerenderPages
) {
  const {
    config,
    dataset,
  } = page

  const bodyHtml =
    renderAnnualPage(
      page,
    )

  const canonicalUrl =
    siteOrigin +
    config.canonicalPath

  const availablePeriodYears =
    Object.keys(
      dataset.period_returns ??
      {},
    )
      .map(Number)
      .filter(Number.isFinite)
      .sort(
        (a, b) =>
          a - b,
      )

  const pageHeadline =
    `${config.name} Returns by Year: ${config.startYear} to Present`

  const seoDescription =
    buildSeoDescription(
      config,
      availablePeriodYears,
    )

  const seoTitle =
    config.seo.title

  const socialTitle =
    config.seo.socialTitle ??
    seoTitle

  const socialDescription =
    config.seo.socialDescription ??
    seoDescription

  const socialImage =
    config.seo.socialImage
      ? siteOrigin +
        config.seo.socialImage
      : ""

  const authorUrl =
    siteOrigin + "/about/"

  const articleSchema = {
    "@context":
      "https://schema.org",
    "@type":
      "Article",
    headline:
      pageHeadline,
    description:
      seoDescription,
    url:
      canonicalUrl,
    mainEntityOfPage: {
      "@type":
        "WebPage",
      "@id":
        canonicalUrl,
    },
    ...(page.assetAsOfDate
      ? {
          dateModified:
            page.assetAsOfDate,
        }
      : {}),
    author: {
      "@type":
        "Person",
      name:
        "Kamal Khondkar",
      jobTitle:
        "Quant Researcher",
      url:
        authorUrl,
    },
    publisher: {
      "@type":
        "Organization",
      name:
        "TradingNInvestment",
      url:
        siteOrigin + "/",
    },
    about: {
      "@type":
        "Thing",
      name:
        `${config.name} Historical Returns`,
    },
    isAccessibleForFree:
      true,
  }

  const datasetSchema = {
    "@context":
      "https://schema.org",
    "@type":
      "Dataset",
    name:
      buildDatasetName(
        config,
      ),
    alternateName:
      buildDatasetAlternateName(
        config,
      ),
    description:
      buildDatasetDescription(
        config,
        availablePeriodYears,
      ),
    url:
      canonicalUrl,
    temporalCoverage:
      `${dataset.summary.start_year}/..`,
    ...(page.assetAsOfDate
      ? {
          dateModified:
            page.assetAsOfDate,
        }
      : {}),
    creator: {
      "@type":
        "Person",
      name:
        "Kamal Khondkar",
      jobTitle:
        "Quant Researcher",
      url:
        authorUrl,
    },
    publisher: {
      "@type":
        "Organization",
      name:
        "TradingNInvestment",
      url:
        siteOrigin + "/",
    },
    variableMeasured: [
      config.returnType,
      "Current year return",
      ...availablePeriodYears.map(
        (years) =>
          years === 1
            ? "1-year return"
            : `${years}-year annualized return`,
      ),
    ],
    isAccessibleForFree:
      true,
  }

  let html =
    template

  html = replaceRequired(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(seoTitle)}</title>`,
    `${config.slug} title`,
  )

  html = replaceRequired(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(seoDescription)}" />`,
    `${config.slug} meta description`,
  )

  html = replaceRequired(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(socialTitle)}" />`,
    `${config.slug} og:title`,
  )

  html = replaceRequired(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(socialDescription)}" />`,
    `${config.slug} og:description`,
  )

  html = replaceRequired(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `${config.slug} og:url`,
  )

  if (socialImage) {
    html = replaceRequired(
      html,
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${escapeHtml(socialImage)}" />`,
      `${config.slug} og:image`,
    )

    html = replaceRequired(
      html,
      /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/>/s,
      `<meta property="og:image:alt" content="${escapeHtml(`${config.name} historical annual returns — TradingNInvestment Research`)}" />`,
      `${config.slug} og:image:alt`,
    )

    html = replaceRequired(
      html,
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${escapeHtml(socialImage)}" />`,
      `${config.slug} twitter:image`,
    )
  }

  html = replaceRequired(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(socialTitle)}" />`,
    `${config.slug} twitter:title`,
  )

  html = replaceRequired(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(socialDescription)}" />`,
    `${config.slug} twitter:description`,
  )

  html = replaceRequired(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `${config.slug} canonical`,
  )

  const schemaHtml =
    [
      articleSchema,
      datasetSchema,
    ]
      .map(
        (schema) =>
          `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
      )
      .join("\n")

  html = replaceRequired(
    html,
    /<\/head>/,
    `  ${schemaHtml}\n</head>`,
    `${config.slug} structured data insertion point`,
  )

  html = replaceRequired(
    html,
    /<div id="root"><\/div>/,
    `<div id="root">${bodyHtml}</div>`,
    `${config.slug} root content`,
  )

  const outputDir =
    path.join(
      distDir,
      config.slug,
    )

  fs.mkdirSync(
    outputDir,
    {
      recursive: true,
    },
  )

  fs.writeFileSync(
    path.join(
      outputDir,
      "index.html",
    ),
    html,
    "utf8",
  )

  console.log(
    "TNI static annual research page generated:",
    config.canonicalPath,
  )
}

//
// ============================================================================
// TNI STATIC MONTHLY RETURNS PAGES
// ============================================================================
//

for (
  const page
  of monthlyPrerenderPages
) {
  const {
    config,
  } = page

  const bodyHtml =
    renderMonthlyPage(
      page,
    )

  const canonicalUrl =
    siteOrigin +
    config.canonicalPath

  let html =
    template

  html = replaceRequired(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(config.seo.title)}</title>`,
    `${config.slug} title`,
  )

  html = replaceRequired(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(config.seo.description)}" />`,
    `${config.slug} meta description`,
  )

  html = replaceRequired(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(config.seo.title)}" />`,
    `${config.slug} og:title`,
  )

  html = replaceRequired(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(config.seo.description)}" />`,
    `${config.slug} og:description`,
  )

  html = replaceRequired(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `${config.slug} og:url`,
  )

  html = replaceRequired(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(config.seo.title)}" />`,
    `${config.slug} twitter:title`,
  )

  html = replaceRequired(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(config.seo.description)}" />`,
    `${config.slug} twitter:description`,
  )

  html = replaceRequired(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `${config.slug} canonical`,
  )

  html = replaceRequired(
    html,
    /<div id="root"><\/div>/,
    `<div id="root">${bodyHtml}</div>`,
    `${config.slug} root content`,
  )

  const outputDir =
    path.join(
      distDir,
      config.slug,
    )

  fs.mkdirSync(
    outputDir,
    {
      recursive: true,
    },
  )

  fs.writeFileSync(
    path.join(
      outputDir,
      "index.html",
    ),
    html,
    "utf8",
  )

  console.log(
    "TNI static monthly research page generated:",
    config.canonicalPath,
  )
}


//
// ============================================================================
// TNI PRERENDER CLEANUP
// ============================================================================
//

fs.rmSync(
  prerenderDir,
  {
    recursive: true,
    force: true,
  },
)
