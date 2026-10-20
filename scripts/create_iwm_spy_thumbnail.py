from pathlib import Path
import pandas as pd
import yfinance as yf
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
from matplotlib.patches import Rectangle

OUT = Path("public/images/social/research/iwm-returns-tni-og.png")
OUT.parent.mkdir(parents=True, exist_ok=True)

# Daily dividend- and split-adjusted closing prices.
data = {}

for ticker in ("IWM", "SPY"):
    df = yf.download(
        ticker,
        start="2000-05-22",
        end="2026-10-21",
        interval="1d",
        auto_adjust=False,
        progress=False,
        multi_level_index=False,
        threads=False,
    )

    if df.empty or "Adj Close" not in df:
        raise RuntimeError(f"No adjusted-price data for {ticker}")

    data[ticker] = pd.to_numeric(
        df["Adj Close"], errors="coerce"
    ).rename(ticker)

prices = pd.concat(data.values(), axis=1).dropna().sort_index()

if len(prices) < 5000:
    raise RuntimeError("Insufficient overlapping historical observations")

# Start both investments on the same actual trading day.
growth = prices.div(prices.iloc[0]).mul(10000)

red = "#C62828"
gray = "#737D8D"
navy = "#071D3F"

fig = plt.figure(figsize=(12, 6.3), dpi=100, facecolor="white")

fig.text(.055, .936, "TNI   |   RESEARCH",
         fontsize=18, fontweight="bold", color=navy)
fig.text(.055, .904, "T R A D I N G N I N V E S T M E N T",
         fontsize=7, color="#748198")
fig.text(.055, .824, "IWM Returns",
         fontsize=30, fontweight="bold", color=navy)
fig.text(.055, .757, "Growth of $10,000 · IWM vs SPY",
         fontsize=21, fontweight="bold", color=red)
fig.text(.055, .705, "RUSSELL 2000 ETF VS S&P 500 ETF  |  ADJUSTED DAILY PRICES",
         fontsize=8, fontweight="bold", color="#718099")

fig.text(.945, .927, "DATA", fontsize=8, color="#718099", ha="right")
fig.text(.945, .903, "INTELLIGENCE", fontsize=8, color="#718099", ha="right")
fig.text(.945, .879, "DECISIONS", fontsize=8, color="#718099", ha="right")

ax = fig.add_axes([.09, .14, .865, .49])
ax.plot(growth.index, growth["IWM"], color=red, linewidth=2.2, label="IWM")
ax.plot(growth.index, growth["SPY"], color=gray, linewidth=2.2, label="SPY")

ax.legend(loc="upper left", frameon=False, ncol=2, fontsize=10)
ax.grid(axis="y", color="#E5EAF0")
ax.set_axisbelow(True)
ax.spines[:].set_visible(False)
ax.tick_params(axis="both", length=0, labelsize=8, colors="#607089")
ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"${v:,.0f}"))
ax.margins(x=.01, y=.13)

last = growth.iloc[-1]
ax.annotate(f"IWM  ${last['IWM']:,.0f}",
            (growth.index[-1], last["IWM"]),
            xytext=(-6, 12), textcoords="offset points",
            ha="right", color=red, fontsize=9, fontweight="bold")
ax.annotate(f"SPY  ${last['SPY']:,.0f}",
            (growth.index[-1], last["SPY"]),
            xytext=(-6, -17), textcoords="offset points",
            ha="right", color=gray, fontsize=9, fontweight="bold")

fig.text(.055, .662,
         f"{growth.index[0]:%Y-%m-%d} TO {growth.index[-1]:%Y-%m-%d}  ·  "
         "DIVIDENDS REINVESTED (ADJUSTED-PRICE PROXY)",
         fontsize=8, color="#718099")

fig.patches.append(Rectangle((0, 0), 1, .075,
                             transform=fig.transFigure,
                             color=navy, zorder=10))
fig.text(.055, .03, "T R A D I N G N I N V E S T M E N T . C O M",
         fontsize=8, color="white", fontweight="bold", zorder=11)
fig.text(.945, .03, "MARKETS  |  DATA  |  RESEARCH  |  INTELLIGENCE",
         fontsize=7, color="white", ha="right", zorder=11)

fig.savefig(OUT, dpi=100, facecolor="white")
plt.close(fig)

print("Saved:", OUT)
print("Observations:", len(growth))
print("Period:", growth.index[0].date(), "to", growth.index[-1].date())
print("Final $10,000 investment values:")
print(last.round(2).to_string())
