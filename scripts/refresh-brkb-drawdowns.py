#!/usr/bin/env python3
"""Refresh Berkshire drawdowns through the annual-return snapshot date."""
import argparse
import json
from pathlib import Path
import subprocess
import sys

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--expected-through", required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]

    def run(*arguments):
        subprocess.run([sys.executable, *arguments], cwd=root, check=True)

    run(
        "scripts/generate-monthly-returns.py",
        "--symbol", "^GSPC",
        "--ticker", "SP500",
        "--name", "S&P 500",
        "--start-year", "1928",
        "--asset-id", "sp500",
        "--output", "src/data/charts/sp500MonthlyReturns.json",
    )

    import pandas as pd
    daily = pd.read_csv(root / "src/data/market/sp500/daily.csv")
    benchmark_date = pd.to_datetime(daily["Date"]).max().date().isoformat()
    if benchmark_date != args.expected_through:
        raise SystemExit(
            f"STOP: Benchmark ends {benchmark_date}; "
            f"Berkshire returns end {args.expected_through}."
        )

    destination = root / "src/data/charts/brkbVsSp500Drawdowns.json"
    pending = destination.with_name("brkbVsSp500Drawdowns.pending.json")
    try:
        run(
            "scripts/generate-stock-drawdown-comparison.py",
            "--ticker", "BRK-B",
            "--start", "1996-05-09",
            "--output", str(pending),
        )
        dataset = json.loads(pending.read_text())
        if dataset["range"]["last_date"] != args.expected_through:
            raise SystemExit("STOP: Drawdown and annual-return dates differ.")
        if dataset["range"]["daily_observations"] != len(dataset["data"]):
            raise SystemExit("STOP: Drawdown observation count is inconsistent.")
        pending.replace(destination)
        run("scripts/generate-brkb-event-comparison.py")
        print(f"BRK.B automatic drawdown refresh verified: {args.expected_through}")
    finally:
        if pending.exists():
            pending.unlink()

if __name__ == "__main__":
    main()
