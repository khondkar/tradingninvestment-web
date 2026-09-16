import { sp500MonthlyReturnsConfig } from "./sp500"

export const monthlyReturnsRegistry = [
  {
    config: {
      ...sp500MonthlyReturnsConfig,

      seo: {
        ...sp500MonthlyReturnsConfig.seo,

        socialTitle:
          "S&P 500 Monthly Returns: Historical Returns by Month",

        socialDescription:
          "Explore S&P 500 monthly returns from 1928 to the present, including average returns by month, positive and negative frequency, seasonal patterns, historical monthly performance, and current month-to-date performance.",
      },
    },

    featured: false,

    // Optional research-card image.
    // We can add a dedicated monthly chart preview later.
    previewImage: undefined,
  },
]
