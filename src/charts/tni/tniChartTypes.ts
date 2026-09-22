// ============================================================
// TNI CHART TYPES
// Shared reusable types for all TradingNInvestment charts
// ============================================================


// ============================================================
// TNI CHART DATA POINT
// Generic annual-return observation
// ============================================================

export type TNIAnnualReturnPoint = {
  year: number;
  value: number;
  label?: string;
  note?: string;
};


// ============================================================
// TNI CHART BRANDING
// Shared attribution and watermark configuration
// ============================================================

export type TNIChartBranding = {
  brandName: string;
  watermarkText: string;
  sourceLabel?: string;
};


// ============================================================
// TNI CHART THEME OVERRIDES
// Allows an individual chart to modify selected visual settings
// while preserving the global TNI design system
// ============================================================

export type TNIChartThemeOverrides = {
  colors?: {
    background?: string;
    textPrimary?: string;
    textSecondary?: string;

    positive?: string;
    negative?: string;

    grid?: string;
    zeroLine?: string;

    accent?: string;
    accentSoft?: string;

    tooltipBackground?: string;
    tooltipText?: string;

    watermark?: string;
    border?: string;
  };

  chart?: {
    barRadius?: number;
    barGapRatio?: number;
    animationMs?: number;
  };
};


// ============================================================
// TNI ANNUAL RETURNS CHART CONFIG
// Reusable configuration consumed by the D3 renderer
// ============================================================

export type TNIAnnualReturnsChartConfig = {
  id: string;

  title: string;
  subtitle?: string;

  symbol?: string;
  metricLabel: string;

  positiveLabel?: string;
  negativeLabel?: string;

  branding: TNIChartBranding;

  showZeroLine?: boolean;
  showWatermark?: boolean;
  showSource?: boolean;

  height?: number;

  themeOverrides?: TNIChartThemeOverrides;

  data: TNIAnnualReturnPoint[];
};


// ============================================================
// TNI HISTORICAL PRICE CHART TYPES
// Long-horizon price series with optional event annotations
// ============================================================

export type TNIHistoricalPricePoint = {
  date: string;
  close: number;
  frequency?: "annual" | "monthly";
  source?: string;
};

export type TNIHistoricalPriceAnnotation = {
  date: string;
  title: string;
  price?: number;
  declinePct?: number;
  note?: string;
};

export type TNIHistoricalPriceChartConfig = {
  id: string;

  title: string;
  subtitle?: string;

  symbol?: string;
  metricLabel: string;

  branding: TNIChartBranding;

  height?: number;
  useLogScale?: boolean;

  showWatermark?: boolean;
  showSource?: boolean;

  themeOverrides?: TNIChartThemeOverrides;

  data: TNIHistoricalPricePoint[];
  annotations?: TNIHistoricalPriceAnnotation[];
};
