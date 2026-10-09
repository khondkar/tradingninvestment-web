#!/usr/bin/env python3
"""Generate TNI stock vs S&P 500 synchronized drawdowns."""

import argparse
import json
from pathlib import Path

import pandas as pd
import yfinance as yf


def summarize(data):
    trough = data["drawdown_pct"].idxmin()
    peak = data.loc[:trough, "adjusted_close"].idxmax()
    peak_price = float(data.loc[peak, "adjusted_close"])

    future = data.loc[data.index > trough]
    recovered = future[
        future["adjusted_close"] >= peak_price
    ]
    recovery = recovered.index[0] if len(recovered) else None

    return {
        "max_drawdown_pct": round(float(data["drawdown_pct"].min()), 4),
        "peak_date": peak.date().isoformat(),
        "trough_date": trough.date().isoformat(),
        "recovery_date": recovery.date().isoformat() if recovery is not None else None,
        "calendar_days_peak_to_trough": int((trough - peak).days),
        "calendar_days_trough_to_recovery": (
            int((recovery - trough).days) if recovery is not None else None
        ),
        "total_calendar_days_underwater": (
            int((recovery - peak).days) if recovery is not None else None
        ),
        "current_drawdown_pct": round(float(data["drawdown_pct"].iloc[-1]), 4),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticker", required=True)
    parser.add_argument("--start", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    benchmark_path = root / "src/data/market/sp500/daily.csv"

    benchmark = pd.read_csv(
        benchmark_path,
        parse_dates=["Date"],
    ).set_index("Date")["Adj Close"]

    history = yf.download(
        args.ticker,
        start=args.start,
        auto_adjust=False,
        progress=False,
    )

    if history.empty:
        raise RuntimeError("No stock price history returned")

    prices = history["Adj Close"]
    if isinstance(prices, pd.DataFrame):
        prices = prices[args.ticker.upper()]

    prices.index = pd.to_datetime(prices.index).tz_localize(None).normalize()
    benchmark.index = pd.to_datetime(benchmark.index).normalize()

    common = pd.concat(
        [
            prices.rename("asset"),
            benchmark.rename("benchmark"),
        ],
        axis=1,
        join="inner",
    ).dropna().sort_index()

    common = common.loc[common.index >= pd.Timestamp(args.start)]
    common = common[
        (common["asset"] > 0) &
        (common["benchmark"] > 0)
    ]

    if len(common) < 100:
        raise RuntimeError("Insufficient synchronized daily observations")

    asset = pd.DataFrame({
        "adjusted_close": common["asset"],
    })
    benchmark_data = pd.DataFrame({
        "adjusted_close": common["benchmark"],
    })

    for frame in (asset, benchmark_data):
        frame["drawdown_pct"] = (
            frame["adjusted_close"] /
            frame["adjusted_close"].cummax() - 1
        ) * 100

    rows = []
    for date in common.index:
        rows.append({
            "date": date.date().isoformat(),
            "asset_adjusted_close": round(float(asset.loc[date, "adjusted_close"]), 6),
            "asset_drawdown_pct": round(float(asset.loc[date, "drawdown_pct"]), 4),
            "benchmark_adjusted_close": round(float(benchmark_data.loc[date, "adjusted_close"]), 6),
            "benchmark_drawdown_pct": round(float(benchmark_data.loc[date, "drawdown_pct"]), 4),
        })

    payload = {
        "dataset": f"{args.ticker.upper()} vs S&P 500 drawdowns",
        "asset": args.ticker.upper(),
        "benchmark": "S&P 500",
        "asset_type": "stock",
        "price_basis": "adjusted_close",
        "source": "Yahoo Finance (stock); TNI S&P 500 daily dataset",
        "methodology": "running_peak_drawdown_on_synchronized_adjusted_close",
        "range": {
            "first_date": rows[0]["date"],
            "last_date": rows[-1]["date"],
            "daily_observations": len(rows),
        },
        "asset_summary": summarize(asset),
        "benchmark_summary": summarize(benchmark_data),
        "data": rows,
    }

    output = root / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, indent=2) + "\n")

    print(f"Generated: {output}")
    print(f"Observations: {len(rows)}")
    print(f"Period: {rows[0]['date']} through {rows[-1]['date']}")
    print(f"CRM maximum drawdown: {payload['asset_summary']['max_drawdown_pct']}%")
    print(f"S&P 500 maximum drawdown: {payload['benchmark_summary']['max_drawdown_pct']}%")


if __name__ == "__main__":
    main()
