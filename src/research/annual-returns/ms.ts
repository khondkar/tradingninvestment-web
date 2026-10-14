import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const msAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "MS",
  slug: "ms-stock-returns",
  name: "Morgan Stanley",
  shortName: "Morgan Stanley",
  startYear: 1994,
  author: kamalResearchAuthor,

  intelligenceEyebrow: "MORGAN STANLEY STOCK INTELLIGENCE",

  canonicalPath: "/ms-stock-returns/",
  embedPath: "/embed/ms-stock-returns/",
  csvPath: "/data/ms-annual-returns.csv",

  returnType: "Morgan Stanley Price Return",
  sourceLabel: "Yahoo Finance — Morgan Stanley (MS)",

  categories: ["stock", "sp500"],
  newsSymbols: ["MS"],

  chart: {
    id: "ms-historical-annual-returns",
    title: "Morgan Stanley (MS) Historical Annual Returns by Year",
    rangeSubtitleSuffix:
      "Interactive Morgan Stanley stock price-return history.",
    metricLabel: "Annual price return",
    positiveLabel: "Positive year",
    negativeLabel: "Negative year",
    height: 540,
  },

  companyContext: {
    eyebrow: "BUSINESS & INDUSTRY CONTEXT",
    title: "Why Morgan Stanley Is Unique",
    paragraphs: [
      "Morgan Stanley is a global financial services institution operating across Institutional Securities, Wealth Management, and Investment Management. Its businesses span investment banking, institutional trading, financial advisory services, and investment solutions.",
      "Its long-term stock performance reflects capital-market activity, interest-rate cycles, equity valuations, client assets, investment banking demand, and the firm's ability to generate sustainable returns through changing economic conditions.",
    ],
    closing:
      "How have these business dynamics translated into long-term shareholder returns? The historical data below provides the evidence.",
  },

  seo: {
    title: "Morgan Stanley (MS) Stock Returns & Performance History",
    socialTitle: "Morgan Stanley (MS) Stock Returns",
    socialDescription:
      "Explore Morgan Stanley MS historical returns, dividends, long-term performance, growth of $10,000, rolling returns, and comparison with the S&P 500.",
    socialImage: "/images/social/ms-stock-intelligence-og.png",
  },
}
