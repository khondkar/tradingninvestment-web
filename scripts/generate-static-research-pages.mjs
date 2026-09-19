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

const drawdownDataPath =
  path.join(
    rootDir,
    "public",
    "data",
    "research",
    "sp500-drawdowns.json",
  )

const siteOrigin =
  "https://tradingninvestment.com"

const canonicalPath =
  "/stock-market-correction-myth-and-reality/"

const canonicalUrl =
  siteOrigin + canonicalPath

const imageUrl =
  siteOrigin +
  "/images/social/sp500-stock-market-corrections-og.webp"


function escapeHtml(
  value,
) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}


function formatNumber(
  value,
  digits = 2,
) {
  return Number(value).toFixed(digits)
}


function formatInteger(
  value,
) {
  return Math.round(
    Number(value),
  ).toLocaleString(
    "en-US",
  )
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


if (!fs.existsSync(templatePath)) {
  throw new Error(
    "dist/index.html does not exist. Run vite build first.",
  )
}

if (!fs.existsSync(drawdownDataPath)) {
  throw new Error(
    `Missing drawdown dataset: ${drawdownDataPath}`,
  )
}


const dataset =
  JSON.parse(
    fs.readFileSync(
      drawdownDataPath,
      "utf8",
    ),
  )

const summary =
  dataset.summary

const current =
  dataset.current_drawdown

const firstYear =
  dataset.range.first_date.slice(
    0,
    4,
  )

const lastYear =
  dataset.range.last_date.slice(
    0,
    4,
  )

const drawdownCount =
  summary.drawdowns_10pct_or_more

const correctionCount =
  summary.corrections_10_to_20pct

const bearCount =
  summary.bear_markets_20pct_or_more

const percentReachingBear =
  summary.pct_10pct_drawdowns_reaching_20pct

const medianPeakToTrough =
  summary.median_calendar_days_peak_to_trough

const medianRecovery =
  summary.median_calendar_days_trough_to_recovery

const medianUnderwater =
  summary.median_total_calendar_days_underwater

const title =
  "Stock Market Corrections: 100 Years of S&P 500 Drawdown History | TNI"

const description =
  "Explore nearly 100 years of S&P 500 stock market corrections, bear markets, drawdowns and recoveries using daily historical closing-price data."

const ogTitle =
  "Stock Market Corrections: 100 Years of S&P 500 Drawdown History"

const imageAlt =
  "TNI Research — Stock Market Corrections: 100 Years of S&P 500 Drawdown History"


const articleSchema = {
  "@context":
    "https://schema.org",

  "@type":
    "Article",

  headline:
    ogTitle,

  description,

  mainEntityOfPage: {
    "@type":
      "WebPage",

    "@id":
      canonicalUrl,
  },

  image: [
    imageUrl,
  ],

  author: {
    "@type":
      "Organization",

    name:
      "TradingNInvestment",
  },

  publisher: {
    "@type":
      "Organization",

    name:
      "TradingNInvestment",

    url:
      siteOrigin,
  },
}


const datasetSchema = {
  "@context":
    "https://schema.org",

  "@type":
    "Dataset",

  name:
    "TNI S&P 500 Historical Drawdown Dataset",

  description:
    dataset.methodology,

  url:
    canonicalUrl,

  temporalCoverage:
    `${dataset.range.first_date}/${dataset.range.last_date}`,

  variableMeasured: [
    "S&P 500 closing-price drawdown",
    "Peak date",
    "Trough date",
    "Recovery date",
    "Peak-to-trough duration",
    "Recovery duration",
  ],

  measurementTechnique:
    dataset.methodology,

  creator: {
    "@type":
      "Organization",

    name:
      "TradingNInvestment",
  },

  isBasedOn: {
    "@type":
      "Dataset",

    name:
      "S&P 500 daily closing-price history",

    description:
      "Daily S&P 500 closing-price history used by TradingNInvestment to calculate historical drawdowns, stock market corrections, bear markets, peak-to-trough declines, and recovery periods. The underlying S&P 500 (^GSPC) market data is sourced from Yahoo Finance and maintained in the TNI daily research archive.",
  },
}


const breadcrumbSchema = {
  "@context":
    "https://schema.org",

  "@type":
    "BreadcrumbList",

  itemListElement: [
    {
      "@type":
        "ListItem",

      position:
        1,

      name:
        "Research",

      item:
        siteOrigin + "/",
    },

    {
      "@type":
        "ListItem",

      position:
        2,

      name:
        "S&P 500 Historical Returns",

      item:
        siteOrigin +
        "/sp-500-returns/",
    },

    {
      "@type":
        "ListItem",

      position:
        3,

      name:
        "Stock Market Corrections",

      item:
        canonicalUrl,
    },
  ],
}


const structuredData = [
  articleSchema,
  datasetSchema,
  breadcrumbSchema,
]


const staticContent = `
<article class="tni-static-research-snapshot">
  <header>
    <p>TNI RESEARCH · S&amp;P 500 DRAWDOWNS</p>

    <h1>
      Stock Market Corrections:
      100 Years of S&amp;P 500 Drawdown History
    </h1>

    <p>
      Explore nearly 100 years of S&amp;P 500
      corrections, bear markets, drawdowns and
      recoveries using daily historical closing-price
      data.
    </p>
  </header>

  <nav aria-label="S&P 500 return research">
    <a href="/sp-500-returns/">
      Annual Returns
    </a>

    <a href="/sp-500-monthly-returns/">
      Monthly Returns
    </a>

    <a
      href="${canonicalPath}"
      aria-current="page"
    >
      Drawdowns
    </a>
  </nav>

  <section>
    <h2>
      What Counts as a Stock Market Correction?
    </h2>

    <p>
      In this TNI study, an independent S&amp;P 500
      drawdown qualifies once the index closes at
      least ${escapeHtml(dataset.thresholds.correction_pct)}%
      below its prior closing high. A decline reaching
      at least ${escapeHtml(dataset.thresholds.bear_market_pct)}%
      is classified as a bear market. Each episode
      remains open until the previous closing high is
      recovered.
    </p>
  </section>

  <section>
    <h2>
      Nearly a Century of S&amp;P 500 Drawdowns
    </h2>

    <p>
      Using this closing-price, peak-to-full-recovery
      methodology, TNI identified
      ${escapeHtml(drawdownCount)} independent
      S&amp;P 500 drawdown episodes of 10% or more
      across the historical sample. Of those,
      ${escapeHtml(correctionCount)} remained between
      10% and 20%, while ${escapeHtml(bearCount)}
      reached the 20% bear-market threshold.
      ${escapeHtml(formatNumber(percentReachingBear))}%
      of qualifying 10%+ episodes eventually reached
      20% or more.
    </p>
  </section>

  <section>
    <h2>
      How Often Does the S&amp;P 500 Fall 10% or 20%?
    </h2>

    <p>
      The median interval between first reaching the
      10% threshold was
      ${escapeHtml(formatNumber(summary.median_years_between_10pct_thresholds))}
      years, while the average interval was
      ${escapeHtml(formatNumber(summary.average_years_between_10pct_thresholds))}
      years. For 20% bear-market threshold crossings,
      the median interval was
      ${escapeHtml(formatNumber(summary.median_years_between_20pct_thresholds))}
      years and the average was
      ${escapeHtml(formatNumber(summary.average_years_between_20pct_thresholds))}
      years.
    </p>
  </section>

  <section>
    <h2>
      How Long Have Corrections and Recoveries Taken?
    </h2>

    <p>
      The median peak-to-trough decline lasted
      ${escapeHtml(formatInteger(medianPeakToTrough))}
      calendar days. Among recovered episodes, the
      median trough-to-recovery period was
      ${escapeHtml(formatInteger(medianRecovery))}
      days, while the median total time below the
      previous closing high was
      ${escapeHtml(formatInteger(medianUnderwater))}
      days.
    </p>
  </section>

  <section>
    <h2>
      Current S&amp;P 500 Drawdown Context
    </h2>

    <p>
      As of ${escapeHtml(current.date)}, the S&amp;P 500
      closing price was
      ${escapeHtml(formatNumber(Math.abs(current.drawdown_from_all_time_closing_high_pct)))}
      % below its all-time closing high recorded on
      ${escapeHtml(current.all_time_closing_high_date)}.
      This current observation updates when the
      underlying TNI daily dataset is refreshed and
      the research generator is rerun.
    </p>
  </section>

  <section>
    <h2>
      Research Methodology
    </h2>

    <p>
      ${escapeHtml(dataset.methodology)}
      The dataset contains
      ${escapeHtml(formatInteger(dataset.range.daily_observations))}
      daily observations covering
      ${escapeHtml(firstYear)} through
      ${escapeHtml(lastYear)}.
    </p>
  </section>
</article>
`.trim()


let html =
  fs.readFileSync(
    templatePath,
    "utf8",
  )


html = replaceRequired(
  html,
  /<title>[\s\S]*?<\/title>/,
  `<title>${escapeHtml(title)}</title>`,
  "title",
)


html = replaceRequired(
  html,
  /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
  `<meta name="description" content="${escapeHtml(description)}" />`,
  "meta description",
)


html = replaceRequired(
  html,
  /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
  `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
  "og:title",
)


html = replaceRequired(
  html,
  /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
  `<meta property="og:description" content="${escapeHtml(description)}" />`,
  "og:description",
)


html = replaceRequired(
  html,
  /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
  `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
  "og:url",
)


html = replaceRequired(
  html,
  /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
  `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
  "og:image",
)


html = replaceRequired(
  html,
  /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/>/,
  `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`,
  "og:image:alt",
)


html = replaceRequired(
  html,
  /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
  `<meta name="twitter:title" content="${escapeHtml(ogTitle)}" />`,
  "twitter:title",
)


html = replaceRequired(
  html,
  /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
  `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  "twitter:description",
)


html = replaceRequired(
  html,
  /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
  `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
  "twitter:image",
)


html = replaceRequired(
  html,
  /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
  `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
  "canonical",
)


const schemaHtml =
  structuredData
    .map(
      (schema) =>
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    )
    .join("\n")


html = replaceRequired(
  html,
  /<\/head>/,
  `  ${schemaHtml}\n</head>`,
  "structured data insertion point",
)


html = replaceRequired(
  html,
  /<div id="root"><\/div>/,
  `<div id="root">${staticContent}</div>`,
  "root content",
)


const outputDir =
  path.join(
    distDir,
    "stock-market-correction-myth-and-reality",
  )

const outputPath =
  path.join(
    outputDir,
    "index.html",
  )


fs.mkdirSync(
  outputDir,
  {
    recursive: true,
  },
)


fs.writeFileSync(
  outputPath,
  html,
  "utf8",
)


console.log(
  "TNI static research page generated:",
  canonicalPath,
)
