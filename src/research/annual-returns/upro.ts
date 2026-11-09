import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const uproAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "UPRO", slug: "upro-etf", name: "ProShares UltraPro S&P500", shortName: "UPRO",
  startYear: 2010, author: kamalResearchAuthor,
  intelligenceEyebrow: "UPRO LEVERAGED ETF INTELLIGENCE",
  canonicalPath: "/upro-etf/", embedPath: "/embed/upro-etf/", csvPath: "/data/upro-annual-returns.csv",
  returnType: "UPRO Price Return", sourceLabel: "Yahoo Finance — UPRO and SPY",
  categories: ["etf", "leveraged-etf"], newsSymbols: ["UPRO", "SPY"],
  companyContext: {
    title: "How does UPRO compare with an unleveraged S&P 500 ETF?",
    paragraphs: [
      "A strong annual return tells only part of the story. Compare UPRO with SPY across annual returns, growth of $10,000, losses from previous peaks and time to recovery. The daily, weekly and monthly tables show how the holding period changes the comparison.",
      "UPRO targets three times the S&P 500 index’s daily performance before fees and expenses. SPY is the investable comparison used in these charts; it is not UPRO’s official benchmark. Annual returns use closing prices, while the drawdown and recovery chart uses adjusted closing prices for both funds.",
      "UPRO launched in June 2009. Drawdowns begin with its available trading history; complete calendar-year returns begin in 2010. These observations do not include the 2008 financial crisis and are not a simulation of UPRO before inception."
    ]
  },
  leveragedEtf: {
    issuer: "ProShares", leverageLabel: "3× long",
    dailyObjective: "Seeks 300% of the daily performance of the S&P 500 index, before fees and expenses.",
    benchmarkName: "S&P 500", benchmarkTicker: "^GSPC", inceptionDate: "2009-06-23",
    officialUrl: "https://www.proshares.com/our-etfs/leveraged-and-inverse/upro",
    showRolling10Year: true,
    structureSummary: "UPRO uses leveraged exposure with a daily reset. Compounding, volatility and expenses affect the return over longer holding periods, which can differ substantially from three times the index’s cumulative return.",
    compositionNotes: [
      "SPY is used as an investable comparison, with its own expenses and tracking differences. The fund’s official daily objective refers to the S&P 500 index.",
      "The recovery statistics measure the first observed return to the previous adjusted-close peak; an unrecovered decline remains open.",
      "Consult ProShares for current holdings, exposures, expenses and fund documents."
    ]
  },
  chart: { id: "upro-historical-annual-returns", title: "UPRO Historical Annual Returns by Year",
    rangeSubtitleSuffix: "Interactive UPRO price-return history.", metricLabel: "Annual price return",
    positiveLabel: "Positive year", negativeLabel: "Negative year", height: 540 },
  seo: {
    title: "UPRO vs SPY & TQQQ: Returns, Drawdowns & Recovery | TNI",
    h1: "UPRO vs SPY and TQQQ: Returns, Drawdowns and Recovery",
    description: "Compare UPRO vs SPY and TQQQ returns, maximum drawdowns and recovery times. Explore interactive growth charts and see how long past losses took to recover.",
    socialTitle: "UPRO vs TQQQ vs SPY: Returns, Drawdowns and Recovery",
    socialDescription: "Compare UPRO, TQQQ and SPY over matching dates: historical returns, maximum drawdowns and time from the low to recovery.",
    socialImage: "/images/social/upro-tqqq-spy-drawdown-og.png"
  }
}
