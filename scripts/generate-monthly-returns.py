#!/usr/bin/env python3

import argparse
import json
import math
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import yfinance as yf


MONTH_NAMES = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
}


def safe_round(value, digits=4):
    if value is None:
        return None

    value = float(value)

    if not math.isfinite(value):
        return None

    return round(value, digits)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate TNI monthly price-return research data."
    )

    parser.add_argument("--symbol", required=True)
    parser.add_argument("--ticker", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--start-year", required=True, type=int)
    parser.add_argument("--asset-id", required=True)
    parser.add_argument("--output", required=True)

    return parser.parse_args()


def main():
    args = parse_args()

    market_dir = Path("src/data/market") / args.asset_id
    market_dir.mkdir(parents=True, exist_ok=True)

    raw_path = market_dir / "daily.csv"
    metadata_path = market_dir / "metadata.json"

    # One prior year gives us the previous month-end required
    # to calculate January of the requested start year.
    fetch_start = f"{args.start_year - 1}-01-01"

    print("=" * 78)
    print("TNI GENERIC MONTHLY RETURNS GENERATOR")
    print("=" * 78)

    print("SYMBOL:", args.symbol)
    print("TICKER:", args.ticker)
    print("NAME:", args.name)
    print("START YEAR:", args.start_year)
    print("FETCH START:", fetch_start)

    # ---------------------------------------------------------------------
    # 1. DOWNLOAD RAW MARKET DATA
    # ---------------------------------------------------------------------

    df = yf.Ticker(args.symbol).history(
        start=fetch_start,
        auto_adjust=False,
        actions=False,
    )

    if df.empty:
        raise RuntimeError(
            f"No Yahoo Finance data returned for {args.symbol}"
        )

    required_columns = [
        "Open",
        "High",
        "Low",
        "Close",
        "Adj Close",
        "Volume",
    ]

    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise RuntimeError(
            f"Missing required columns: {missing}"
        )

    raw = df[required_columns].copy()

    if getattr(raw.index, "tz", None) is not None:
        raw.index = raw.index.tz_localize(None)

    raw.index.name = "Date"

    # ---------------------------------------------------------------------
    # 2. SAVE RAW DAILY ARCHIVE
    # ---------------------------------------------------------------------

    raw.to_csv(
        raw_path,
        date_format="%Y-%m-%d",
        float_format="%.6f",
    )

    metadata = {
        "symbol": args.symbol,
        "ticker": args.ticker,
        "name": args.name,
        "provider": "Yahoo Finance",
        "frequency": "daily",
        "return_basis": "Close",
        "dividends_included": False,
        "first_date": raw.index.min().strftime("%Y-%m-%d"),
        "last_date": raw.index.max().strftime("%Y-%m-%d"),
        "rows": int(len(raw)),
        "retrieved_at_utc": datetime.now(
            timezone.utc
        ).isoformat(),
        "columns": required_columns,
    }

    metadata_path.write_text(
        json.dumps(metadata, indent=2) + "\n"
    )

    # ---------------------------------------------------------------------
    # 3. CALCULATE MONTH-END CLOSE
    # ---------------------------------------------------------------------

    close = raw["Close"].dropna()

    monthly_close = close.resample("ME").last().dropna()

    monthly_returns = (
        monthly_close.pct_change(fill_method=None) * 100
    ).dropna()

    records = []

    for date, value in monthly_returns.items():
        year = int(date.year)
        month = int(date.month)

        if year < args.start_year:
            continue

        records.append(
            {
                "year": year,
                "month": month,
                "month_name": MONTH_NAMES[month],
                "value": safe_round(value),
                "status": (
                    "positive"
                    if value > 0
                    else "negative"
                    if value < 0
                    else "flat"
                ),
            }
        )

    if not records:
        raise RuntimeError(
            "No monthly returns were generated."
        )

    data = pd.DataFrame(records)

    # ---------------------------------------------------------------------
    # CURRENT MONTH / MTD SEPARATION
    # ---------------------------------------------------------------------
    #
    # The latest calendar month may still be in progress.
    # Preserve that observation for the page as MTD, but exclude it
    # from completed historical month statistics.
    # ---------------------------------------------------------------------

    latest_market_date = raw.index.max()
    latest_year = int(latest_market_date.year)
    latest_month_number = int(latest_market_date.month)

    current_month_mask = (
        (data["year"] == latest_year)
        & (data["month"] == latest_month_number)
    )

    current_month_rows = data.loc[current_month_mask]

    if current_month_rows.empty:
        current_month = None
        historical_data = data.copy()

    else:
        current_row = current_month_rows.iloc[-1]

        current_month = {
            "year": int(current_row["year"]),
            "month": int(current_row["month"]),
            "month_name": current_row["month_name"],
            "label": (
                f"{current_row['month_name']} "
                f"{int(current_row['year'])} MTD"
            ),
            "return_pct": safe_round(
                current_row["value"],
                4,
            ),
            "through_date": latest_market_date.strftime(
                "%Y-%m-%d"
            ),
        }

        historical_data = data.loc[
            ~current_month_mask
        ].copy()

    # ---------------------------------------------------------------------
    # 4. CALCULATE JANUARY–DECEMBER COMPLETED-MONTH STATISTICS
    # ---------------------------------------------------------------------

    month_statistics = []

    for month in range(1, 13):

        values = historical_data.loc[
            historical_data["month"] == month,
            "value",
        ].astype(float)

        observations = int(len(values))
        positive_count = int((values > 0).sum())
        negative_count = int((values < 0).sum())
        flat_count = int((values == 0).sum())

        positive_pct = (
            positive_count / observations * 100
            if observations
            else None
        )

        negative_pct = (
            negative_count / observations * 100
            if observations
            else None
        )

        month_statistics.append(
            {
                "month": month,
                "month_name": MONTH_NAMES[month],
                "observations": observations,
                "positive_count": positive_count,
                "negative_count": negative_count,
                "flat_count": flat_count,
                "positive_pct": safe_round(
                    positive_pct,
                    2,
                ),
                "negative_pct": safe_round(
                    negative_pct,
                    2,
                ),
                "average_return_pct": safe_round(
                    values.mean(),
                    4,
                ),
                "median_return_pct": safe_round(
                    values.median(),
                    4,
                ),
                "best_return_pct": safe_round(
                    values.max(),
                    4,
                ),
                "worst_return_pct": safe_round(
                    values.min(),
                    4,
                ),
            }
        )

    stats = pd.DataFrame(month_statistics)

    # ---------------------------------------------------------------------
    # 5. IDENTIFY MONTHLY PATTERN LEADERS
    # ---------------------------------------------------------------------

    highest_positive = stats.loc[
        stats["positive_pct"].idxmax()
    ].to_dict()

    highest_negative = stats.loc[
        stats["negative_pct"].idxmax()
    ].to_dict()

    highest_average = stats.loc[
        stats["average_return_pct"].idxmax()
    ].to_dict()

    lowest_average = stats.loc[
        stats["average_return_pct"].idxmin()
    ].to_dict()

    first_record = records[0]
    last_record = records[-1]

    # ---------------------------------------------------------------------
    # 6. WRITE DERIVED MONTHLY DATASET
    # ---------------------------------------------------------------------

    payload = {
        "symbol": args.symbol,
        "ticker": args.ticker,
        "name": args.name,

        "metric": "monthly_return_pct",
        "return_type": "price_return",

        "source": f"Yahoo Finance — {args.symbol}",

        "methodology": (
            "Calendar-month price return calculated from "
            "the final closing price of each month relative "
            "to the final closing price of the previous month. "
            "Dividends are excluded. The current month is "
            "month-to-date through the latest available close."
        ),

        "range": {
            "start_year": first_record["year"],
            "start_month": first_record["month"],
            "end_year": last_record["year"],
            "end_month": last_record["month"],
            "observations": len(records),
        },

        "current_month": current_month,

        "leaders": {
            "highest_positive_frequency": {
                "month_name":
                    highest_positive["month_name"],
                "positive_pct":
                    safe_round(
                        highest_positive["positive_pct"],
                        2,
                    ),
                "positive_count":
                    int(highest_positive["positive_count"]),
                "negative_count":
                    int(highest_positive["negative_count"]),
            },

            "highest_negative_frequency": {
                "month_name":
                    highest_negative["month_name"],
                "negative_pct":
                    safe_round(
                        highest_negative["negative_pct"],
                        2,
                    ),
                "negative_count":
                    int(highest_negative["negative_count"]),
                "positive_count":
                    int(highest_negative["positive_count"]),
            },

            "highest_average_return": {
                "month_name":
                    highest_average["month_name"],
                "average_return_pct":
                    safe_round(
                        highest_average[
                            "average_return_pct"
                        ],
                        4,
                    ),
            },

            "lowest_average_return": {
                "month_name":
                    lowest_average["month_name"],
                "average_return_pct":
                    safe_round(
                        lowest_average[
                            "average_return_pct"
                        ],
                        4,
                    ),
            },
        },

        "month_statistics": month_statistics,
        "data": records,
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path.write_text(
        json.dumps(
            payload,
            indent=2,
            ensure_ascii=False,
        )
        + "\n"
    )

    # ---------------------------------------------------------------------
    # 7. VALIDATION OUTPUT
    # ---------------------------------------------------------------------

    print()
    print("=" * 78)
    print("RAW ARCHIVE")
    print("=" * 78)

    print("ROWS:", len(raw))
    print(
        "DATE RANGE:",
        metadata["first_date"],
        "→",
        metadata["last_date"],
    )
    print("SAVED:", raw_path)
    print("METADATA:", metadata_path)

    print()
    print("=" * 78)
    print("MONTHLY RETURNS")
    print("=" * 78)

    print("MONTHLY OBSERVATIONS:", len(records))

    print(
        "RANGE:",
        f"{first_record['month_name']} "
        f"{first_record['year']}",
        "→",
        f"{last_record['month_name']} "
        f"{last_record['year']}",
    )

    print()
    print("MONTH STATISTICS")

    print(
        stats[
            [
                "month_name",
                "observations",
                "positive_count",
                "negative_count",
                "positive_pct",
                "negative_pct",
                "average_return_pct",
                "median_return_pct",
            ]
        ].to_string(index=False)
    )

    print()
    print("PATTERN LEADERS")

    print(
        "Highest positive frequency:",
        highest_positive["month_name"],
        f"{highest_positive['positive_pct']:.2f}%",
    )

    print(
        "Highest negative frequency:",
        highest_negative["month_name"],
        f"{highest_negative['negative_pct']:.2f}%",
    )

    print(
        "Highest average return:",
        highest_average["month_name"],
        f"{highest_average['average_return_pct']:.4f}%",
    )

    print(
        "Lowest average return:",
        lowest_average["month_name"],
        f"{lowest_average['average_return_pct']:.4f}%",
    )

    print()
    print("MONTHLY JSON:", output_path)


if __name__ == "__main__":
    main()
