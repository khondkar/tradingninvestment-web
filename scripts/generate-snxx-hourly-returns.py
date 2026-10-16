#!/usr/bin/env python3
"""Generate SNXX hourly weekday returns from Yahoo 30-minute OHLC."""

import argparse
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import pandas as pd
import yfinance as yf

INTERVALS = [
    ("09:30", "10:00"),
    ("10:00", "11:00"),
    ("11:00", "12:00"),
    ("12:00", "13:00"),
    ("13:00", "14:00"),
    ("14:00", "15:00"),
    ("15:00", "16:00"),
]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
ET = ZoneInfo("America/New_York")


def rounded(value):
    return round(float(value), 4) if value is not None and math.isfinite(float(value)) else None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", default=".")
    args = parser.parse_args()

    output = Path(args.project) / "src/data/charts/snxxHourlyWeekdayReturns.json"

    history = yf.download(
        "SNXX",
        period="60d",
        interval="30m",
        auto_adjust=False,
        progress=False,
        threads=False,
    )
    if history.empty:
        raise RuntimeError("Yahoo returned no SNXX intraday data; preserving existing JSON")

    if isinstance(history.columns, pd.MultiIndex):
        history.columns = history.columns.get_level_values(0)

    if history.index.tz is None:
        raise RuntimeError("Intraday timestamps have no timezone; preserving existing JSON")

    history.index = history.index.tz_convert(ET)
    history = history.sort_index()

    observations = {day: [] for day in DAYS}

    for session_date, session in history.groupby(history.index.date):
        if session_date.weekday() >= 5:
            continue

        day = DAYS[session_date.weekday()]
        session = session.between_time("09:30", "15:59")
        if session.empty:
            continue

        times = {ts.strftime("%H:%M"): row for ts, row in session.iterrows()}

        # Require all 13 expected 30-minute regular-session candles.
        expected = pd.date_range(
            f"{session_date} 09:30",
            periods=13,
            freq="30min",
            tz=ET,
        )
        if any(ts.strftime("%H:%M") not in times for ts in expected):
            continue

        values = []
        for start, end in INTERVALS:
            start_time = datetime.strptime(start, "%H:%M")
            end_time = datetime.strptime(end, "%H:%M")
            duration = int((end_time - start_time).total_seconds() / 1800)
            last = (
                pd.Timestamp(f"{session_date} {start}", tz=ET)
                + pd.Timedelta(minutes=30 * (duration - 1))
            ).strftime("%H:%M")

            opening = float(times[start]["Open"])
            closing = float(times[last]["Close"])

            if not (math.isfinite(opening) and math.isfinite(closing) and opening > 0):
                values = []
                break

            values.append((closing / opening - 1) * 100)

        if len(values) == len(INTERVALS):
            observations[day].append((session_date.isoformat(), values))

    weekdays = {}

    for day in DAYS:
        sessions = observations[day][-20:]
        if not sessions:
            raise RuntimeError(f"No valid {day} sessions; preserving existing JSON")

        intervals = []
        for i, (start, end) in enumerate(INTERVALS):
            returns = [values[i] for _, values in sessions]
            gains = [value for value in returns if value > 0]
            losses = [value for value in returns if value < 0]

            intervals.append({
                "start": start,
                "end": end,
                "averageReturnPct": rounded(sum(returns) / len(returns)),
                "positiveCount": len(gains),
                "negativeCount": len(losses),
                "neutralCount": len(returns) - len(gains) - len(losses),
                "averageGainPct": rounded(sum(gains) / len(gains)) if gains else None,
                "averageLossPct": rounded(sum(losses) / len(losses)) if losses else None,
            })

        weekdays[day] = {
            "sampleSize": len(sessions),
            "firstDate": sessions[0][0],
            "lastDate": sessions[-1][0],
            "intervals": intervals,
        }

    payload = {
        "ticker": "SNXX",
        "source": "Yahoo Finance 30-minute historical OHLC",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "weekdays": weekdays,
    }

    # Avoid unnecessary commits when the underlying data is unchanged.
    if output.exists():
        existing = json.loads(output.read_text())
        if (
            existing.get("ticker") == payload["ticker"]
            and existing.get("source") == payload["source"]
            and existing.get("weekdays") == payload["weekdays"]
        ):
            print("SNXX hourly data unchanged; keeping existing JSON.")
            return

    # Only write after every weekday has been validated.
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(payload, indent=2) + "\n")
    temporary.replace(output)

    print("Updated:", output)
    print("Valid sessions:", {day: weekdays[day]["sampleSize"] for day in DAYS})


if __name__ == "__main__":
    main()
