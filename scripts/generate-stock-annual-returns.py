from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import pandas as pd
import yfinance as yf


def extract_series(
    data: pd.DataFrame,
    field: str,
) -> pd.Series:
    if isinstance(data.columns, pd.MultiIndex):
        series = data[field]

        if isinstance(series, pd.DataFrame):
            series = series.iloc[:, 0]

        return series.dropna()

    return data[field].dropna()


def main() -> None:
    parser = argparse.ArgumentParser()

    parser.add_argument("--ticker", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--start", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument(
        "--asset-slug",
        required=True,
        help="Stable asset slug used for generated social assets, e.g. aapl, msft, brkb.",
    )

    args = parser.parse_args()

    ticker = args.ticker.upper()

    history = yf.download(
        ticker,
        start=args.start,
        auto_adjust=False,
        progress=False,
    )

    if history.empty:
        raise RuntimeError(
            f"No historical data returned for {ticker}"
        )

    close = extract_series(
        history,
        "Close",
    )

    adjusted_close = extract_series(
        history,
        "Adj Close",
    )

    close.index = pd.to_datetime(
        close.index
    )

    adjusted_close.index = pd.to_datetime(
        adjusted_close.index
    )

    yearly_close = (
        close
        .resample("YE")
        .last()
        .dropna()
    )

    yearly_adjusted_close = (
        adjusted_close
        .resample("YE")
        .last()
        .dropna()
    )

    returns = (
        yearly_close
        .pct_change()
        .dropna()
        * 100
    )

    total_returns = (
        yearly_adjusted_close
        .pct_change()
        .dropna()
        * 100
    )

    annual = pd.DataFrame({
        "year": returns.index.year,
        "return_pct": returns.values,
    })

    current_year = pd.Timestamp.now().year

    completed = annual[
        annual["year"] < current_year
    ].copy()

    current = annual[
        annual["year"] == current_year
    ]

    records = []

    for _, row in completed.iterrows():
        value = round(float(row["return_pct"]), 4)
        year = int(row["year"])

        records.append({
            "year": year,
            "value": value,
            "label": str(year),
            "status":
                "positive"
                if value >= 0
                else "negative",
        })

    values = completed["return_pct"].astype(float)

    best = completed.loc[values.idxmax()]
    worst = completed.loc[values.idxmin()]

    positive_years = int((values >= 0).sum())
    negative_years = int((values < 0).sum())
    total = len(completed)

    summary = {
        "completed_years_analyzed": total,
        "start_year": int(completed["year"].min()),
        "end_year": int(completed["year"].max()),
        "positive_years": positive_years,
        "negative_years": negative_years,
        "positive_year_pct": round(
            positive_years / total * 100, 2
        ),
        "negative_year_pct": round(
            negative_years / total * 100, 2
        ),
        "average_annual_return_pct": round(
            float(values.mean()), 2
        ),
        "median_annual_return_pct": round(
            float(values.median()), 2
        ),
        "best_year": {
            "year": int(best["year"]),
            "return_pct": round(
                float(best["return_pct"]), 2
            ),
        },
        "worst_year": {
            "year": int(worst["year"]),
            "return_pct": round(
                float(worst["return_pct"]), 2
            ),
        },
    }

    current_snapshot = None

    if not current.empty:
        row = current.iloc[-1]

        current_snapshot = {
            "year": current_year,
            "label": f"{current_year} YTD",
            "return_pct": round(
                float(row["return_pct"]), 2
            ),
        }

    payload = {
        "symbol": args.name,
        "ticker": ticker,
        "metric": "Annual Price Return %",
        "return_type": "price_return",
        "source": f"Yahoo Finance / {ticker}",
        "development_source_only": True,
        "methodology": {
            "calculation":
                "Annual price return is calculated using the final available close of each calendar year relative to the final available close of the prior calendar year.",
            "current_year":
                "The current calendar year is shown as YTD and is excluded from completed-year summary statistics.",
        },
        "summary": summary,
        "current_year": current_snapshot,
        "data": records,
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    output.write_text(
        json.dumps(payload, indent=2),
        encoding="utf-8",
    )

    # --------------------------------------------------------
    # Price return vs. total return dataset
    # Used by TNI's shared $10,000 D3 wealth-growth chart.
    # --------------------------------------------------------

    price_by_year = {
        int(index.year):
            float(value)
        for index, value
        in returns.items()
    }

    total_by_year = {
        int(index.year):
            float(value)
        for index, value
        in total_returns.items()
    }

    common_years = sorted(
        set(price_by_year)
        & set(total_by_year)
    )

    data_through = (
        pd.Timestamp(
            history.index.max()
        )
        .date()
        .isoformat()
    )

    return_method_rows = []

    for year in common_years:
        return_method_rows.append({
            "year": year,
            "price_return": round(
                price_by_year[year],
                4,
            ),
            "total_return": round(
                total_by_year[year],
                4,
            ),
            "is_ytd":
                year == current_year,
            "data_through":
                data_through
                if year == current_year
                else f"{year}-12-31",
            "price_source":
                f"Yahoo Finance {ticker} Close",
            "total_return_source":
                f"Yahoo Finance {ticker} Adjusted Close",
            "methodology":
                "yahoo_close_and_adjusted_close",
        })

    return_methods_payload = {
        "dataset":
            f"{args.name} price return and total return",
        "ticker": ticker,
        "start_year":
            common_years[0],
        "end_year":
            common_years[-1],
        "current_year_is_ytd":
            current_year in common_years,
        "data": return_method_rows,
    }

    methods_output = (
        output.parent /
        f"{ticker.lower()}ReturnMethods.json"
    )

    methods_output.write_text(
        json.dumps(
            return_methods_payload,
            indent=2,
        ),
        encoding="utf-8",
    )

    # --------------------------------------------------------
    # BRANDED TNI SOCIAL / OPEN GRAPH ASSET
    #
    # Every generated stock research article receives the same
    # TNI Research identity automatically.
    # --------------------------------------------------------

    root = Path(__file__).resolve().parents[1]

    social_output = (
        root
        / "public/images/social"
        / f"{args.asset_slug}-stock-intelligence-og.png"
    )

    social_generator = (
        Path(__file__).resolve().parent
        / "generate-stock-social-chart.py"
    )

    subprocess.run(
        [
            sys.executable,
            str(social_generator),
            "--data",
            str(methods_output.resolve().relative_to(root)),
            "--output",
            str(social_output.relative_to(root)),
            "--name",
            args.name,
            "--symbol",
            ticker.replace("-", "."),
        ],
        cwd=root,
        check=True,
    )

    print(f"Generated: {output}")
    print(f"Generated: {methods_output}")
    print(f"Generated: {social_output}")
    print(f"Ticker: {ticker}")
    print(f"Completed years: {total}")
    print(
        f"Range: {summary['start_year']}–"
        f"{summary['end_year']}"
    )
    print(
        f"Average annual return: "
        f"{summary['average_annual_return_pct']}%"
    )
    print(f"Current YTD: {current_snapshot}")


if __name__ == "__main__":
    main()
