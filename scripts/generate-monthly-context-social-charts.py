import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

from tni_research_og import (
    add_tni_research_header,
    add_tni_research_identity,
)

ROOT = Path(__file__).resolve().parents[1]

parser = argparse.ArgumentParser(
    description=(
        "Generate TNI monthly return-context and "
        "risk-context social charts."
    )
)

parser.add_argument("--data", required=True)
parser.add_argument("--name", required=True)
parser.add_argument("--symbol", required=True)
parser.add_argument("--return-output", required=True)
parser.add_argument("--risk-output", required=True)

args = parser.parse_args()

DATA = ROOT / args.data
RETURN_OUTPUT = ROOT / args.return_output
RISK_OUTPUT = ROOT / args.risk_output

with DATA.open() as f:
    dataset = json.load(f)

current = dataset.get("current_month")

if not current:
    raise RuntimeError(
        "Dataset has no current_month observation."
    )

risk = dataset.get("current_month_risk")

if not risk:
    raise RuntimeError(
        "Dataset has no current_month_risk observation."
    )

month = int(current["month"])
year = int(current["year"])
month_name = current["month_name"]
through_date = current["through_date"]
current_return = float(current["return_pct"])

historical_rows = [
    row
    for row in dataset["data"]
    if int(row["month"]) == month
    and not (
        int(row["year"]) == year
        and int(row["month"]) == month
    )
]

if not historical_rows:
    raise RuntimeError(
        f"No historical {month_name} observations found."
    )

historical_values = np.array(
    [
        float(row["value"])
        for row in historical_rows
    ],
    dtype=float,
)

average_return = float(
    historical_values.mean()
)

median_return = float(
    np.median(historical_values)
)

best_row = max(
    historical_rows,
    key=lambda row: float(row["value"]),
)

worst_row = min(
    historical_rows,
    key=lambda row: float(row["value"]),
)

percentile = float(
    (
        historical_values <= current_return
    ).sum()
    / len(historical_values)
    * 100.0
)

range_low = float(
    np.percentile(
        historical_values,
        10,
    )
)

range_high = float(
    np.percentile(
        historical_values,
        90,
    )
)

observations = len(historical_rows)

navy = "#07152f"
text = "#172033"
muted = "#667085"
border = "#e4e7ec"
soft = "#f8fafc"
background = "#ffffff"
blue = "#0868e8"
green = "#087a55"
red = "#c4323d"


def fmt_pct(value):
    value = float(value)

    if abs(value) < 0.005:
        return "0.00%"

    return f"{value:+.2f}%"


def add_metric(
    fig,
    *,
    x,
    y,
    label,
    value,
    detail=None,
    value_color=text,
):
    fig.text(
        x,
        y,
        label.upper(),
        fontsize=7.3,
        fontweight="bold",
        color=muted,
        va="top",
    )

    fig.text(
        x,
        y - 0.045,
        value,
        fontsize=17,
        fontweight="bold",
        color=value_color,
        va="top",
    )

    if detail:
        fig.text(
            x,
            y - 0.086,
            detail,
            fontsize=7.3,
            color=muted,
            va="top",
        )


def add_card(
    fig,
    *,
    x,
    y,
    width,
    height,
):
    from matplotlib.patches import FancyBboxPatch

    card = FancyBboxPatch(
        (x, y),
        width,
        height,
        boxstyle=(
            "round,pad=0.008,"
            "rounding_size=0.012"
        ),
        transform=fig.transFigure,
        facecolor=background,
        edgecolor=border,
        linewidth=1.0,
    )

    fig.add_artist(card)


def base_figure(
    *,
    subtitle,
    descriptor,
):
    fig = plt.figure(
        figsize=(12, 6.3),
        dpi=100,
    )

    fig.patch.set_facecolor(
        background
    )

    add_tni_research_identity(
        fig,
        navy=navy,
        muted=muted,
        background=background,
    )

    add_tni_research_header(
        fig,
        title=(
            f"{args.name} "
            f"{month_name} {year}"
        ),
        subtitle=subtitle,
        descriptor=descriptor,
        range_label=(
            f"Through {through_date}"
        ),
        navy=navy,
        muted=muted,
        accent=blue,
    )

    return fig


# ============================================================
# RETURN CONTEXT
# ============================================================

fig = base_figure(
    subtitle=(
        f"{month_name} Return Context"
    ),
    descriptor=(
        f"{args.symbol} MONTHLY RETURN INTELLIGENCE"
    ),
)

add_card(
    fig,
    x=0.055,
    y=0.155,
    width=0.89,
    height=0.48,
)

fig.text(
    0.085,
    0.575,
    f"{month_name} {year} MTD",
    fontsize=8,
    fontweight="bold",
    color=muted,
    va="top",
)

fig.text(
    0.085,
    0.515,
    fmt_pct(current_return),
    fontsize=36,
    fontweight="bold",
    color=(
        green
        if current_return >= 0
        else red
    ),
    va="top",
)

fig.text(
    0.085,
    0.425,
    (
        f"{percentile:.0f}th percentile "
        f"among {observations} completed "
        f"{month_name} observations"
    ),
    fontsize=9,
    color=text,
    va="top",
)

fig.text(
    0.085,
    0.375,
    (
        "Historical 10th–90th percentile range  "
        f"{fmt_pct(range_low)} to "
        f"{fmt_pct(range_high)}"
    ),
    fontsize=8.5,
    color=muted,
    va="top",
)

add_metric(
    fig,
    x=0.53,
    y=0.56,
    label="Historical Average",
    value=fmt_pct(average_return),
)

add_metric(
    fig,
    x=0.73,
    y=0.56,
    label="Historical Median",
    value=fmt_pct(median_return),
)

add_metric(
    fig,
    x=0.53,
    y=0.36,
    label=f"Best {month_name}",
    value=fmt_pct(
        best_row["value"]
    ),
    detail=str(best_row["year"]),
    value_color=green,
)

add_metric(
    fig,
    x=0.73,
    y=0.36,
    label=f"Worst {month_name}",
    value=fmt_pct(
        worst_row["value"]
    ),
    detail=str(worst_row["year"]),
    value_color=red,
)

fig.text(
    0.085,
    0.19,
    (
        "Current partial month is excluded "
        "from historical statistics."
    ),
    fontsize=7.2,
    color=muted,
)

RETURN_OUTPUT.parent.mkdir(
    parents=True,
    exist_ok=True,
)

fig.savefig(
    RETURN_OUTPUT,
    dpi=100,
    facecolor=background,
)

plt.close(fig)


# ============================================================
# RISK CONTEXT
# ============================================================

fig = base_figure(
    subtitle=(
        f"{month_name} Downside Risk Context"
    ),
    descriptor=(
        f"{args.symbol} MONTHLY RISK INTELLIGENCE"
    ),
)

add_card(
    fig,
    x=0.055,
    y=0.155,
    width=0.89,
    height=0.48,
)

current_drawdown = float(
    risk["current_max_drawdown_pct"]
)

current_adverse = float(
    risk["current_adverse_excursion_pct"]
)

fig.text(
    0.085,
    0.575,
    "INTRADAY ADVERSE EXCURSION",
    fontsize=8,
    fontweight="bold",
    color=muted,
    va="top",
)

fig.text(
    0.085,
    0.515,
    fmt_pct(current_adverse),
    fontsize=36,
    fontweight="bold",
    color=(
        red
        if current_adverse < 0
        else green
    ),
    va="top",
)

fig.text(
    0.085,
    0.425,
    (
        "Prior month-end close → "
        "lowest intraday low"
    ),
    fontsize=9,
    color=text,
    va="top",
)

fig.text(
    0.085,
    0.375,
    (
        "Current max closing drawdown  "
        f"{fmt_pct(current_drawdown)}"
    ),
    fontsize=8.5,
    color=muted,
    va="top",
)

add_metric(
    fig,
    x=0.53,
    y=0.56,
    label="Median Max Drawdown",
    value=fmt_pct(
        risk[
            "median_max_drawdown_pct"
        ]
    ),
)

add_metric(
    fig,
    x=0.73,
    y=0.56,
    label="Average Max Drawdown",
    value=fmt_pct(
        risk[
            "average_max_drawdown_pct"
        ]
    ),
)

add_metric(
    fig,
    x=0.53,
    y=0.36,
    label=f"Worst {month_name} Drawdown",
    value=fmt_pct(
        risk[
            "worst_max_drawdown_pct"
        ]
    ),
    detail=str(
        risk[
            "worst_max_drawdown_year"
        ]
    ),
    value_color=red,
)

add_metric(
    fig,
    x=0.73,
    y=0.36,
    label="Median Adverse Excursion",
    value=fmt_pct(
        risk[
            "median_adverse_excursion_pct"
        ]
    ),
)

fig.text(
    0.085,
    0.19,
    (
        f"{risk['historical_observations']} "
        f"completed {month_name} observations · "
        "current partial month excluded from "
        "historical statistics."
    ),
    fontsize=7.2,
    color=muted,
)

RISK_OUTPUT.parent.mkdir(
    parents=True,
    exist_ok=True,
)

fig.savefig(
    RISK_OUTPUT,
    dpi=100,
    facecolor=background,
)

plt.close(fig)

print(
    f"RETURN SOCIAL: {RETURN_OUTPUT}"
)

print(
    f"RISK SOCIAL: {RISK_OUTPUT}"
)
