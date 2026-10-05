import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "vite"

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

const prerenderDir =
  path.join(
    rootDir,
    ".tni-average-return-prerender",
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

const templatePath =
  path.join(
    distDir,
    "index.html",
  )

const siteOrigin =
  "https://tradingninvestment.com"

const canonicalPath =
  "/average-stock-market-return/"

const canonicalUrl =
  siteOrigin + canonicalPath

const title =
  "Average Stock Market Return: Historical Returns With Dividends & Inflation"

const description =
  "Explore historical stock market returns with dividends reinvested, inflation-adjusted real returns, and S&P 500 price returns from 1872 through the latest available data."

const ogTitle =
  "Average Stock Market Return: Dividends, Inflation & 150+ Years of History"

const imageUrl =
  siteOrigin +
  "/images/social/average-stock-market-return-og.png"

const imageAlt =
  "Historical annual U.S. stock market total returns with dividends reinvested from 1872 through the latest available year — TradingNInvestment Research"


const datasetPath =
  path.join(
    rootDir,
    "src",
    "data",
    "sp500-historical-return-methods.json",
  )

const researchDataset =
  JSON.parse(
    fs.readFileSync(
      datasetPath,
      "utf8",
    ),
  )

const datasetStartYear =
  researchDataset.start_year

const datasetEndYear =
  researchDataset.end_year

const datasetCoverage =
  `${datasetStartYear}–${datasetEndYear}${
    researchDataset.current_year_is_ytd
      ? " YTD"
      : ""
  }`


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


await build({
  configFile: false,

  build: {
    ssr: prerenderEntry,

    outDir: prerenderDir,

    emptyOutDir: true,

    rollupOptions: {
      output: {
        entryFileNames:
          "entry-prerender.js",
      },
    },
  },
})


const prerenderModule =
  await import(
    `${prerenderBundle}?t=${Date.now()}`
  )


if (
  typeof prerenderModule
    .renderAverageStockMarketReturnPage
  !== "function"
) {
  throw new Error(
    "Average stock market return prerender function was not exported.",
  )
}


const staticContent =
  prerenderModule
    .renderAverageStockMarketReturnPage()


if (
  !staticContent.includes(
    "Average Stock Market Return",
  )
) {
  throw new Error(
    "Average stock market return SSR output failed validation.",
  )
}


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


const structuredData =
  {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "Article",

        "@id":
          `${canonicalUrl}#article`,

        headline:
          title,

        description,

        url:
          canonicalUrl,

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
            "Person",

          "@id":
            `${siteOrigin}/about/#kamal-khondkar`,

          name:
            "Kamal Khondkar",

          jobTitle:
            "Quant Researcher",

          url:
            `${siteOrigin}/about/`,
        },

        publisher: {
          "@type":
            "Organization",

          "@id":
            `${siteOrigin}/#organization`,

          name:
            "TradingNInvestment",

          url:
            `${siteOrigin}/`,
        },

        isAccessibleForFree:
          true,

        mainEntity: {
          "@id":
            `${canonicalUrl}#dataset`,
        },

        about: [
          {
            "@type":
              "Thing",

            name:
              "Average stock market return",
          },

          {
            "@type":
              "Thing",

            name:
              "S&P 500 total return",
          },

          {
            "@type":
              "Thing",

            name:
              "Inflation-adjusted stock market return",
          },
        ],
      },

      {
        "@type":
          "Dataset",

        "@id":
          `${canonicalUrl}#dataset`,

        name:
          "Historical U.S. Stock Market Returns — Price, Total and Real Returns",

        description:
          `Annual U.S. stock market return series covering ${datasetCoverage}, including price return, total return with dividends reinvested, and inflation-adjusted real total return.`,

        url:
          canonicalUrl,

        temporalCoverage:
          `${datasetStartYear}/${datasetEndYear}`,

        creator: {
          "@type":
            "Organization",

          "@id":
            `${siteOrigin}/#organization`,

          name:
            "TradingNInvestment",

          url:
            `${siteOrigin}/`,
        },

        publisher: {
          "@id":
            `${siteOrigin}/#organization`,
        },

        license:
          `${siteOrigin}/research-license/`,

        measurementTechnique:
          "Price return measures changes in the market index level. Total return includes dividends and assumes reinvestment. Real total return adjusts dividend-reinvested total return for changes in consumer prices.",

        isPartOf: {
          "@id":
            `${canonicalUrl}#article`,
        },

        variableMeasured: [
          "Annual price return",
          "Annual total return with dividends reinvested",
          "Annual inflation-adjusted real total return",
          "Annual inflation rate",
        ],

        keywords: [
          "average stock market return",
          "historical S&P 500 returns",
          "S&P 500 total return",
          "dividends reinvested",
          "inflation adjusted return",
          "real stock market return",
        ],
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${canonicalUrl}#breadcrumb`,

        itemListElement: [
          {
            "@type":
              "ListItem",

            position:
              1,

            name:
              "Home",

            item:
              `${siteOrigin}/`,
          },

          {
            "@type":
              "ListItem",

            position:
              2,

            name:
              "Research",

            item:
              `${siteOrigin}/research/`,
          },

          {
            "@type":
              "ListItem",

            position:
              3,

            name:
              "Average Stock Market Return",

            item:
              canonicalUrl,
          },
        ],
      },
    ],
  }


const structuredDataScript =
  `<script type="application/ld+json">${JSON.stringify(
    structuredData,
  ).replaceAll("<", "\\u003c")}</script>`


html = replaceRequired(
  html,
  /<\/head>/,
  `  ${structuredDataScript}\n</head>`,
  "structured data",
)


html = replaceRequired(
  html,
  /<div id="root">[\s\S]*?<\/div>\s*<\/body>/,
  `<div id="root">${staticContent}</div>\n  </body>`,
  "SSR root content",
)


const outputDir =
  path.join(
    distDir,
    "average-stock-market-return",
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


fs.rmSync(
  prerenderDir,
  {
    recursive: true,
    force: true,
  },
)


console.log(
  "TNI static average-return page generated:",
  canonicalPath,
)

console.log(
  "SSR article:",
  "PASS",
)

console.log(
  "OG image:",
  imageUrl,
)
