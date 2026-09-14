// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — ARTICLE ADAPTER
//
// Purpose:
// - Preserve the existing S&P 500 page component boundary.
// - Delegate reusable article rendering to GenericAnnualReturnsArticle.
// - Keep asset-specific page code separate from the shared article template.
// ============================================================================

import GenericAnnualReturnsArticle from "../../templates/GenericAnnualReturnsArticle"
import type {
  GenericAnnualReturnsArticleProps,
} from "../../templates/GenericAnnualReturnsArticle"

// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — ADAPTER PROPS
// ============================================================================

type SP500HistoricalReturnsArticleProps =
  GenericAnnualReturnsArticleProps

// ============================================================================
// TNI S&P 500 ANNUAL RETURNS — THIN ARTICLE ADAPTER
// ============================================================================

export default function SP500HistoricalReturnsArticle(
  props: SP500HistoricalReturnsArticleProps,
) {
  return (
    <GenericAnnualReturnsArticle
      {...props}
    />
  )
}
