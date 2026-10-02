import DividendCompoundingExplorer, {
  type ReturnMethodRow,
} from "../components/charts/DividendCompoundingExplorer"

type StockGrowthEmbedPageProps = {
  assetName: string
  canonicalUrl: string
  data: ReturnMethodRow[]
}

export default function StockGrowthEmbedPage({
  assetName,
  canonicalUrl,
  data,
}: StockGrowthEmbedPageProps) {
  return (
    <main
      style={{
        margin: 0,
        minHeight: "100vh",
        background: "#ffffff",
        color: "#10233f",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px",
        }}
      >
        <DividendCompoundingExplorer
          data={data}
          assetName={assetName}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "6px",
            paddingTop: "10px",
            borderTop: "1px solid #e6edf5",
            color: "#718096",
            fontSize: "11px",
            lineHeight: 1.5,
          }}
        >
          <span>
            © TradingNInvestment | TNI Research
          </span>

          <a
            href={canonicalUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#0b63ce",
              fontWeight: 750,
              textDecoration: "none",
            }}
          >
            Explore full research →
          </a>
        </div>

        <div
          style={{
            marginTop: "8px",
            color: "#8a97a8",
            fontSize: "10px",
            lineHeight: 1.5,
          }}
        >
          Personal, educational, and editorial
          research use permitted with
          TradingNInvestment attribution.
          Commercial reproduction,
          redistribution, resale, or use within
          commercial products or services
          requires permission from
          TradingNInvestment.
        </div>
      </div>
    </main>
  )
}
