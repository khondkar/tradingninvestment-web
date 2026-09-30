import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import Patch
from matplotlib.ticker import FuncFormatter

from tni_research_og import (
    TNI_RESEARCH_CHART_RECT,
    add_tni_research_header,
    add_tni_research_identity,
)


ROOT = Path(__file__).resolve().parents[1]

DATA = (
    ROOT
    / "src/data/sp500-historical-return-methods.json"
)

OUTPUT = (
    ROOT
    / "public/images/social/dividend-compounding-150-year.png"
)

STARTING_INVESTMENT = 10_000
PERIOD_YEARS = 150


# ------------------------------------------------------------
# LOAD DATA
# ------------------------------------------------------------

with DATA.open() as f:
    dataset = json.load(f)

completed_rows = [
    row
    for row in dataset["data"]
    if (
        not row.get("is_ytd", False)
        and row.get("price_return") is not None
        and row.get("total_return") is not None
    )
]

completed_rows.sort(
    key=lambda row: int(row["year"])
)

if len(completed_rows) < PERIOD_YEARS:
    raise RuntimeError(
        f"Need at least {PERIOD_YEARS} completed observations; "
        f"found {len(completed_rows)}."
    )

rows = completed_rows[-PERIOD_YEARS:]

start_year = int(rows[0]["year"])
end_year = int(rows[-1]["year"])


# ------------------------------------------------------------
# COMPOUND WEALTH PATHS
# ------------------------------------------------------------

years = []
price_wealth = []
total_wealth = []

price_value = STARTING_INVESTMENT
total_value = STARTING_INVESTMENT

for row in rows:
    year = int(row["year"])

    price_value *= (
        1 + float(row["price_return"]) / 100
    )

    total_value *= (
        1 + float(row["total_return"]) / 100
    )

    years.append(year)
    price_wealth.append(price_value)
    total_wealth.append(total_value)


price_ending = price_wealth[-1]
total_ending = total_wealth[-1]

dividend_contribution = (
    total_ending - price_ending
)

contribution_pct = (
    dividend_contribution
    / total_ending
    * 100
)

price_cagr = (
    (price_ending / STARTING_INVESTMENT)
    ** (1 / PERIOD_YEARS)
    - 1
) * 100

total_cagr = (
    (total_ending / STARTING_INVESTMENT)
    ** (1 / PERIOD_YEARS)
    - 1
) * 100


# ------------------------------------------------------------
# TNI RESEARCH PALETTE
# ------------------------------------------------------------

navy = "#07152f"
muted = "#667085"
grid = "#e6ebf2"
background = "#ffffff"

price_color = "#6F91B8"
total_color = "#D65A4A"
contribution_color = "#F4C7C1"


# ------------------------------------------------------------
# FORMATTERS
# ------------------------------------------------------------

def money(value):
    absolute = abs(value)

    if absolute >= 1_000_000_000:
        return f"${value / 1_000_000_000:.2f}B"

    if absolute >= 1_000_000:
        return f"${value / 1_000_000:.2f}M"

    if absolute >= 1_000:
        return f"${value / 1_000:.0f}K"

    return f"${value:,.0f}"


def axis_money(value, _):
    if value >= 1_000_000_000:
        return f"${value / 1_000_000_000:.0f}B"

    if value >= 1_000_000:
        return f"${value / 1_000_000:.0f}M"

    if value >= 1_000:
        return f"${value / 1_000:.0f}K"

    return f"${value:,.0f}"


# ------------------------------------------------------------
# 1200 × 630 TNI RESEARCH CANVAS
# ------------------------------------------------------------

fig = plt.figure(
    figsize=(12, 6.3),
    dpi=100,
)

fig.patch.set_facecolor(background)


# ------------------------------------------------------------
# SHARED TNI IDENTITY
# ------------------------------------------------------------

add_tni_research_identity(
    fig,
    navy=navy,
    muted=muted,
    background=background,
)

add_tni_research_header(
    fig,
    title="The Power of Reinvested Dividends",
    subtitle=(
        f"Growth of $10,000 Over {PERIOD_YEARS} Years"
    ),
    descriptor=(
        "P R I C E   R E T U R N   ·   "
        "T O T A L   R E T U R N   ·   "
        "D I V I D E N D   C O M P O U N D I N G"
    ),
    range_label=f"{start_year}–{end_year}",
    navy=navy,
    muted=muted,
    accent=total_color,
)


# ------------------------------------------------------------
# HERO VISUALIZATION
# ------------------------------------------------------------

ax = fig.add_axes(
    TNI_RESEARCH_CHART_RECT
)

ax.set_facecolor(background)

positions = list(range(len(years)))


# Contribution area

ax.fill_between(
    positions,
    price_wealth,
    total_wealth,
    color=contribution_color,
    alpha=0.72,
    linewidth=0,
    zorder=1,
)


# Price-return wealth path

ax.plot(
    positions,
    price_wealth,
    color=price_color,
    linewidth=2.6,
    label="Price Return",
    zorder=3,
)


# Total-return wealth path

ax.plot(
    positions,
    total_wealth,
    color=total_color,
    linewidth=2.8,
    label="Total Return",
    zorder=4,
)


# ------------------------------------------------------------
# GRID / AXES
# ------------------------------------------------------------

ax.yaxis.grid(
    True,
    color=grid,
    linewidth=0.7,
    alpha=0.85,
)

ax.set_axisbelow(True)

target_tick_count = 10

tick_step = max(
    1,
    len(years) // target_tick_count,
)

tick_positions = list(
    range(
        0,
        len(years),
        tick_step,
    )
)

if (
    len(years) - 1
    not in tick_positions
):
    tick_positions.append(
        len(years) - 1
    )

ax.set_xticks(tick_positions)

ax.set_xticklabels(
    [
        str(years[index])
        for index in tick_positions
    ],
    fontsize=7.5,
    color=muted,
)

ax.tick_params(
    axis="x",
    length=0,
    pad=5,
)

ax.tick_params(
    axis="y",
    labelsize=7.5,
    colors=muted,
    length=0,
)

ax.yaxis.set_major_formatter(
    FuncFormatter(axis_money)
)

for spine in ax.spines.values():
    spine.set_visible(False)


# ------------------------------------------------------------
# END-POINT LABELS
# ------------------------------------------------------------

ax.annotate(
    f"TOTAL RETURN  {money(total_ending)}",
    xy=(
        positions[-1],
        total_wealth[-1],
    ),
    xytext=(-8, 9),
    textcoords="offset points",
    horizontalalignment="right",
    fontsize=7.8,
    fontweight="bold",
    color=total_color,
)

ax.annotate(
    f"PRICE RETURN  {money(price_ending)}",
    xy=(
        positions[-1],
        price_wealth[-1],
    ),
    xytext=(-8, 9),
    textcoords="offset points",
    horizontalalignment="right",
    fontsize=8.0,
    fontweight="bold",
    color=price_color,
)


# ------------------------------------------------------------
# LEGEND
# ------------------------------------------------------------

handles, labels = ax.get_legend_handles_labels()

handles.append(
    Patch(
        facecolor=contribution_color,
        edgecolor="none",
        alpha=0.72,
        label="Dividend + Reinvestment Contribution",
    )
)

labels.append(
    "Dividend + Reinvestment Contribution"
)

legend = ax.legend(
    handles,
    labels,
    loc="upper left",
    frameon=False,
    fontsize=7.2,
    ncol=3,
)

for text_item in legend.get_texts():
    text_item.set_color(navy)


# ------------------------------------------------------------
# KEY RESEARCH RESULT
# ------------------------------------------------------------

fig.text(
    0.945,
    0.682,
    (
        f"TOTAL CAGR  {total_cagr:.2f}%   ·   "
        f"PRICE CAGR  {price_cagr:.2f}%   ·   "
        f"DIVIDEND + REINVESTMENT  "
        f"{money(dividend_contribution)} "
        f"({contribution_pct:.1f}%)"
    ),
    fontsize=6.5,
    fontweight="bold",
    color=navy,
    horizontalalignment="right",
)


# ------------------------------------------------------------
# EXPORT
# ------------------------------------------------------------

OUTPUT.parent.mkdir(
    parents=True,
    exist_ok=True,
)

fig.savefig(
    OUTPUT,
    dpi=100,
    facecolor=background,
)

plt.close(fig)


print(
    "TNI dividend compounding social chart generated:"
)

print(OUTPUT)

print(
    f"Period: {start_year}–{end_year}"
)

print(
    f"Price ending value: {money(price_ending)}"
)

print(
    f"Total ending value: {money(total_ending)}"
)

print(
    "Dividend + reinvestment contribution: "
    f"{money(dividend_contribution)} "
    f"({contribution_pct:.1f}%)"
)

print(
    f"Price CAGR: {price_cagr:.2f}%"
)

print(
    f"Total CAGR: {total_cagr:.2f}%"
)
