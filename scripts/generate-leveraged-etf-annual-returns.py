from __future__ import annotations

import argparse
import csv
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


def calculate_annual_returns(
    ticker: str,
    start: str,
) -> tuple[
    pd.DataFrame,
    pd.Series,
    pd.Series,
    pd.Timestamp,
    pd.Series,
]:
    history = yf.download(
        ticker,
        start=start,
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

    close.index = pd.to_datetime(close.index)
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

    data_through = pd.Timestamp(
        history.index.max()
    )

    return (
        annual,
        returns,
        total_returns,
        data_through,
        adjusted_close,
    )


def calculate_drawdown_series(
    adjusted_close: pd.Series,
) -> pd.DataFrame:
    series = (
        adjusted_close
        .dropna()
        .sort_index()
        .astype(float)
    )

    running_peak = series.cummax()

    drawdown = (
        series / running_peak - 1.0
    ) * 100.0

    return pd.DataFrame({
        "adjusted_close": series,
        "drawdown_pct": drawdown,
    })


def summarize_drawdown(
    data: pd.DataFrame,
) -> dict:
    if data.empty:
        raise RuntimeError(
            "Cannot summarize an empty drawdown series"
        )

    trough_date = data[
        "drawdown_pct"
    ].idxmin()

    trough_position = (
        data.index.get_loc(trough_date)
    )

    through_trough = data.iloc[
        : trough_position + 1
    ]

    peak_date = through_trough[
        "adjusted_close"
    ].idxmax()

    peak_close = float(
        data.loc[
            peak_date,
            "adjusted_close",
        ]
    )

    trough_close = float(
        data.loc[
            trough_date,
            "adjusted_close",
        ]
    )

    after_trough = data.loc[
        data.index > trough_date
    ]

    recovered_rows = after_trough[
        after_trough[
            "adjusted_close"
        ] >= peak_close
    ]

    recovery_date = (
        recovered_rows.index[0]
        if not recovered_rows.empty
        else None
    )

    return {
        "max_drawdown_pct": round(
            float(
                data[
                    "drawdown_pct"
                ].min()
            ),
            4,
        ),
        "peak_date":
            peak_date.date().isoformat(),
        "trough_date":
            trough_date.date().isoformat(),
        "recovery_date":
            recovery_date.date().isoformat()
            if recovery_date is not None
            else None,
        "calendar_days_peak_to_trough":
            int(
                (
                    trough_date -
                    peak_date
                ).days
            ),
        "calendar_days_trough_to_recovery":
            int(
                (
                    recovery_date -
                    trough_date
                ).days
            )
            if recovery_date is not None
            else None,
        "total_calendar_days_underwater":
            int(
                (
                    recovery_date -
                    peak_date
                ).days
            )
            if recovery_date is not None
            else None,
        "current_drawdown_pct": round(
            float(
                data[
                    "drawdown_pct"
                ].iloc[-1]
            ),
            4,
        ),
    }


def build_annual_payload(
    name: str,
    ticker: str,
    annual: pd.DataFrame,
    asset_type: str,
) -> dict:
    current_year = pd.Timestamp.now().year

    completed = annual[
        annual["year"] < current_year
    ].copy()

    current = annual[
        annual["year"] == current_year
    ]

    if completed.empty:
        raise RuntimeError(
            f"No completed annual observations for {ticker}"
        )

    records = []

    for _, row in completed.iterrows():
        value = round(
            float(row["return_pct"]),
            4,
        )
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

    values = completed[
        "return_pct"
    ].astype(float)

    best = completed.loc[
        values.idxmax()
    ]

    worst = completed.loc[
        values.idxmin()
    ]

    positive_years = int(
        (values >= 0).sum()
    )

    negative_years = int(
        (values < 0).sum()
    )

    total = len(completed)

    summary = {
        "completed_years_analyzed": total,
        "start_year":
            int(completed["year"].min()),
        "end_year":
            int(completed["year"].max()),
        "positive_years":
            positive_years,
        "negative_years":
            negative_years,
        "positive_year_pct":
            round(
                positive_years
                / total
                * 100,
                2,
            ),
        "negative_year_pct":
            round(
                negative_years
                / total
                * 100,
                2,
            ),
        "average_annual_return_pct":
            round(
                float(values.mean()),
                2,
            ),
        "median_annual_return_pct":
            round(
                float(values.median()),
                2,
            ),
        "best_year": {
            "year":
                int(best["year"]),
            "return_pct":
                round(
                    float(
                        best["return_pct"]
                    ),
                    2,
                ),
        },
        "worst_year": {
            "year":
                int(worst["year"]),
            "return_pct":
                round(
                    float(
                        worst["return_pct"]
                    ),
                    2,
                ),
        },
    }

    current_snapshot = None

    if not current.empty:
        row = current.iloc[-1]

        current_snapshot = {
            "year": current_year,
            "label":
                f"{current_year} YTD",
            "return_pct":
                round(
                    float(
                        row["return_pct"]
                    ),
                    2,
                ),
        }

    return {
        "symbol": name,
        "ticker": ticker,
        "asset_type": asset_type,
        "metric":
            "Annual Price Return %",
        "return_type":
            "price_return",
        "source":
            f"Yahoo Finance / {ticker}",
        "development_source_only":
            True,
        "methodology": {
            "calculation":
                "Annual price return is calculated using the final available close of each calendar year relative to the final available close of the prior calendar year.",
            "current_year":
                "The current calendar year is shown as YTD and is excluded from completed-year summary statistics.",
        },
        "summary": summary,
        "current_year":
            current_snapshot,
        "data": records,
    }


def main() -> None:
    root = Path(__file__).resolve().parents[1]

    parser = argparse.ArgumentParser()

    parser.add_argument("--ticker", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--start", required=True)
    parser.add_argument("--output", required=True)

    # Leveraged ETF identity
    parser.add_argument("--issuer", required=True)
    parser.add_argument("--leverage", required=True)
    parser.add_argument(
        "--direction",
        required=True,
        choices=["long", "inverse"],
    )
    parser.add_argument("--benchmark", required=True)
    parser.add_argument("--benchmark-ticker", required=True)
    parser.add_argument("--comparison-ticker", required=True)
    parser.add_argument("--inception-date", required=True)
    parser.add_argument(
        "--asset-slug",
        required=True,
        help="Stable asset slug used for generated social assets, e.g. aapl, msft, brkb.",
    )

    args = parser.parse_args()

    ticker = args.ticker.upper()

    (
        annual,
        returns,
        total_returns,
        latest_market_date,
        adjusted_close,
    ) = calculate_annual_returns(
        ticker,
        args.start,
    )

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
        "asset_type": "leveraged_etf",
        "issuer": args.issuer,
        "leverage": args.leverage,
        "direction": args.direction,
        "benchmark": args.benchmark,
        "benchmark_ticker": args.benchmark_ticker,
        "inception_date": args.inception_date,
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

    csv_output = (
        root
        / "public"
        / "data"
        / f"{args.asset_slug}-annual-returns.csv"
    )

    csv_output.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    annual_rows = payload.get(
        "data",
        [],
    )

    if not annual_rows:
        raise RuntimeError(
            "Annual-return CSV has no rows"
        )

    csv_fields = list(
        annual_rows[0].keys()
    )

    with csv_output.open(
        "w",
        newline="",
        encoding="utf-8",
    ) as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=csv_fields,
        )
        writer.writeheader()
        writer.writerows(
            annual_rows,
        )

    # --------------------------------------------------------
    # INVESTABLE COMPARISON BENCHMARK
    #
    # Example:
    # TQQQ -> QQQ
    #
    # Uses the same annual price-return methodology as the
    # leveraged ETF so benchmark comparisons remain like-for-like.
    # --------------------------------------------------------

    comparison_ticker = (
        args.comparison_ticker.upper()
    )

    (
        comparison_annual,
        _comparison_returns,
        _comparison_total_returns,
        _comparison_latest_date,
        comparison_adjusted_close,
    ) = calculate_annual_returns(
        comparison_ticker,
        args.start,
    )

    comparison_payload = build_annual_payload(
        name=comparison_ticker,
        ticker=comparison_ticker,
        annual=comparison_annual,
        asset_type="etf",
    )

    comparison_output = (
        output.parent
        / f"{comparison_ticker.lower()}AnnualReturns.json"
    )

    # Preserve an existing canonical comparison dataset.
    #
    # The leveraged-ETF generator only needs the freshly
    # downloaded comparison series for like-for-like analysis
    # and drawdowns. It must not truncate or replace a benchmark
    # dataset that may contain a longer independent history.
    if comparison_output.exists():
        print(
            "Preserved existing comparison dataset: "
            f"{comparison_output}"
        )
    else:
        comparison_output.write_text(
            json.dumps(
                comparison_payload,
                indent=2,
            ),
            encoding="utf-8",
        )

    # --------------------------------------------------------
    # DAILY DRAWDOWN COMPARISON
    #
    # Both assets use adjusted close over the identical
    # overlapping date range so the risk comparison is
    # directly comparable.
    # --------------------------------------------------------

    primary_drawdown = (
        calculate_drawdown_series(
            adjusted_close,
        )
    )

    comparison_drawdown = (
        calculate_drawdown_series(
            comparison_adjusted_close,
        )
    )

    common_dates = (
        primary_drawdown.index
        .intersection(
            comparison_drawdown.index
        )
        .sort_values()
    )

    if common_dates.empty:
        raise RuntimeError(
            "No overlapping daily observations "
            f"for {ticker} and {comparison_ticker}"
        )

    primary_drawdown = (
        primary_drawdown
        .loc[common_dates]
        .copy()
    )

    comparison_drawdown = (
        comparison_drawdown
        .loc[common_dates]
        .copy()
    )

    # Recalculate drawdowns after synchronization so both
    # series begin from exactly the same comparison date.
    primary_drawdown = (
        calculate_drawdown_series(
            primary_drawdown[
                "adjusted_close"
            ]
        )
    )

    comparison_drawdown = (
        calculate_drawdown_series(
            comparison_drawdown[
                "adjusted_close"
            ]
        )
    )

    drawdown_rows = []

    for date in common_dates:
        drawdown_rows.append({
            "date":
                date.date().isoformat(),
            "asset_adjusted_close": round(
                float(
                    primary_drawdown.loc[
                        date,
                        "adjusted_close",
                    ]
                ),
                6,
            ),
            "asset_drawdown_pct": round(
                float(
                    primary_drawdown.loc[
                        date,
                        "drawdown_pct",
                    ]
                ),
                4,
            ),
            "benchmark_adjusted_close": round(
                float(
                    comparison_drawdown.loc[
                        date,
                        "adjusted_close",
                    ]
                ),
                6,
            ),
            "benchmark_drawdown_pct": round(
                float(
                    comparison_drawdown.loc[
                        date,
                        "drawdown_pct",
                    ]
                ),
                4,
            ),
        })

    drawdown_payload = {
        "dataset":
            f"{ticker} vs {comparison_ticker} drawdowns",
        "asset": ticker,
        "benchmark": comparison_ticker,
        "asset_type": "leveraged_etf",
        "price_basis": "adjusted_close",
        "source": "Yahoo Finance",
        "methodology":
            "running_peak_drawdown_on_synchronized_adjusted_close",
        "range": {
            "first_date":
                common_dates[0]
                .date()
                .isoformat(),
            "last_date":
                common_dates[-1]
                .date()
                .isoformat(),
            "daily_observations":
                len(common_dates),
        },
        "asset_summary":
            summarize_drawdown(
                primary_drawdown,
            ),
        "benchmark_summary":
            summarize_drawdown(
                comparison_drawdown,
            ),
        "data": drawdown_rows,
    }

    drawdown_output = (
        output.parent /
        (
            f"{ticker.lower()}"
            f"Vs{comparison_ticker.title()}"
            "Drawdowns.json"
        )
    )

    drawdown_output.write_text(
        json.dumps(
            drawdown_payload,
            indent=2,
        ),
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
        latest_market_date
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
        "asset_type": "leveraged_etf",
        "issuer": args.issuer,
        "leverage": args.leverage,
        "direction": args.direction,
        "benchmark": args.benchmark,
        "benchmark_ticker": args.benchmark_ticker,
        "inception_date": args.inception_date,
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
    # Every generated leveraged ETF research article receives the same
    # TNI Research identity automatically.
    # --------------------------------------------------------

    social_output = (
        root
        / "public/images/social"
        / f"{args.asset_slug}-leveraged-etf-intelligence-og.png"
    )

    social_generator = (
        Path(__file__).resolve().parent
        / "generate-leveraged-etf-social-chart.py"
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
            "--benchmark",
            args.benchmark,
            "--benchmark-ticker",
            args.benchmark_ticker,
            "--comparison-ticker",
            args.comparison_ticker,
            "--leverage",
            args.leverage,
            "--start",
            args.start,
        ],
        cwd=root,
        check=True,
    )

    print(f"Generated: {output}")
    print(f"Generated: {csv_output}")
    print(f"Generated: {comparison_output}")
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
