import type { AnnualReturnsAssetConfig } from "./types"
import { kamalResearchAuthor } from "../author"

export const crmAnnualReturnsConfig: AnnualReturnsAssetConfig = {
  symbol: "CRM",
  slug: "crm-stock-returns",
  name: "Salesforce, Inc.",
  shortName: "Salesforce",
  startYear: 2005,
  author: kamalResearchAuthor,

  intelligenceEyebrow: "SALESFORCE STOCK INTELLIGENCE",

  canonicalPath: "/crm-stock-returns/",
  embedPath: "/embed/crm-stock-returns/",
  csvPath: "/data/crm-annual-returns.csv",

  returnType: "Salesforce Price Return",
  sourceLabel: "Yahoo Finance — Salesforce, Inc. (CRM)",

  categories: ["stock", "sp500"],
  newsSymbols: ["CRM"],

  chart: {
    id: "crm-historical-annual-returns",
    title: "Salesforce (CRM) Historical Annual Returns by Year",
    rangeSubtitleSuffix:
      "Interactive Salesforce stock price-return history.",
    metricLabel: "Annual price return",
    positiveLabel: "Positive year",
    negativeLabel: "Negative year",
    height: 540,
  },

  companyContext: {
    eyebrow: "BUSINESS & INNOVATION CONTEXT",
    title: "Why Salesforce Is Unique",
    paragraphs: [
      "Salesforce helped establish software-as-a-service as a mainstream enterprise technology model. Rather than requiring companies to install and maintain traditional customer relationship management software, Salesforce delivered CRM capabilities through the cloud, making customer and sales information accessible through an internet-based platform.",

      "Over time, Salesforce expanded beyond sales automation into customer service, marketing, commerce, analytics, collaboration, and enterprise AI. Its acquisitions and platform development broadened the company's role in how businesses manage customer relationships, integrate information, and automate workflows.",
    ],
    closing:
      "How has Salesforce's evolution translated into long-term shareholder returns? The historical performance data below provides the evidence.",
  },

  seo: {
    title: "Salesforce (CRM) Stock Returns & Performance History",
    description:
      "Explore Salesforce (CRM) historical annual stock returns since 2005, growth of $10,000, rolling returns, drawdowns, and S&P 500 comparisons.",
    socialTitle: "Salesforce (CRM) Stock Returns",
    socialDescription:
      "Explore Salesforce CRM historical returns, long-term performance, growth of $10,000, rolling performance, and comparison with the S&P 500.",
    socialImage: "/images/social/crm-stock-intelligence-og.png",
  },
}
