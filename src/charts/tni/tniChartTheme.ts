// ============================================================
// TNI CHART THEME
// Shared visual system for TradingNInvestment research charts
// ============================================================

export const tniChartTheme = {
  colors: {
    background: "#FFFFFF",
    textPrimary: "#0B1F33",
    textSecondary: "#5B6B7A",

    positive: "#148A4B",
    negative: "#C73A3A",

    grid: "#E7EDF3",
    zeroLine: "#9AA8B5",

    accent: "#1677FF",
    accentSoft: "#DCEBFF",

    tooltipBackground: "#071B2F",
    tooltipText: "#FFFFFF",

    watermark: "#C7D1DB",
    border: "#DCE4EC",
  },

  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    titleSize: 24,
    subtitleSize: 14,
    axisSize: 12,
    tooltipSize: 13,
    watermarkSize: 18,
  },

  spacing: {
    top: 70,
    right: 28,
    bottom: 56,
    left: 58,
  },

  chart: {
    defaultHeight: 520,
    barRadius: 3,
    barGapRatio: 0.16,
    animationMs: 650,
  },
} as const;
