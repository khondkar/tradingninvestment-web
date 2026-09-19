#!/usr/bin/env python3

import csv
import json
import math
import statistics
from bisect import bisect_left
from datetime import date, datetime
from pathlib import Path


SOURCE_PATH = Path("src/data/market/sp500/daily.csv")
OUTPUT_PATH = Path("public/data/research/sp500-drawdowns.json")

CORRECTION_THRESHOLD = -10.0
BEAR_MARKET_THRESHOLD = -20.0


def safe_round(value, digits=4):
    if value is None:
        return None

    value = float(value)

    if not math.isfinite(value):
        return None

    return round(value, digits)


def main():
    print("=" * 78)
    print("TNI S&P 500 DRAWDOWN RESEARCH GENERATOR")
    print("=" * 78)

    if not SOURCE_PATH.exists():
        raise FileNotFoundError(
            f"Missing source dataset: {SOURCE_PATH}"
        )

    # --------------------------------------------------------------
    # LOAD VERIFIED DAILY ARCHIVE
    # --------------------------------------------------------------

    rows_by_date = {}

    with SOURCE_PATH.open(
        newline="",
        encoding="utf-8",
    ) as handle:
        reader = csv.DictReader(handle)

        required = {"Date", "Close"}
        available = set(reader.fieldnames or [])
        missing = required - available

        if missing:
            raise RuntimeError(
                f"Missing required columns: {sorted(missing)}"
            )

        for source_row in reader:
            date_text = source_row.get("Date", "").strip()
            close_text = source_row.get("Close", "").strip()

            if not date_text or not close_text:
                continue

            date = datetime.strptime(
                date_text,
                "%Y-%m-%d",
            ).date()

            close = float(close_text)

            if close <= 0:
                raise RuntimeError(
                    f"Invalid Close on {date}: {close}"
                )

            rows_by_date[date] = {
                "date": date,
                "close": close,
            }

    rows = [
        rows_by_date[date]
        for date in sorted(rows_by_date)
    ]

    if not rows:
        raise RuntimeError("Source dataset is empty.")

    # --------------------------------------------------------------
    # FIND DISTINCT 10%+ PEAK-TO-RECOVERY EPISODES
    #
    # Peak:
    #   latest closing high before the decline.
    #
    # Qualification:
    #   first close at least 10% below that peak.
    #
    # Trough:
    #   deepest closing decline before recovery.
    #
    # Recovery:
    #   first close at or above the prior peak.
    #
    # Bear market:
    #   event whose maximum closing drawdown reaches 20%+.
    # --------------------------------------------------------------

    events = []

    peak_idx = 0
    peak_price = rows[0]["close"]

    in_event = False
    event_peak_idx = None
    event_peak_price = None
    correction_idx = None
    bear_idx = None
    trough_idx = None
    trough_drawdown = 0.0

    for i in range(1, len(rows)):
        close = rows[i]["close"]

        if not in_event:
            if close >= peak_price:
                peak_idx = i
                peak_price = close
                continue

            drawdown = (
                (close / peak_price) - 1.0
            ) * 100.0

            if drawdown <= CORRECTION_THRESHOLD:
                in_event = True

                event_peak_idx = peak_idx
                event_peak_price = peak_price

                correction_idx = i

                bear_idx = (
                    i
                    if drawdown <= BEAR_MARKET_THRESHOLD
                    else None
                )

                trough_idx = i
                trough_drawdown = drawdown

        else:
            drawdown = (
                (close / event_peak_price) - 1.0
            ) * 100.0

            if (
                bear_idx is None
                and drawdown <= BEAR_MARKET_THRESHOLD
            ):
                bear_idx = i

            if drawdown < trough_drawdown:
                trough_idx = i
                trough_drawdown = drawdown

            if close >= event_peak_price:
                events.append(
                    {
                        "peak_idx": event_peak_idx,
                        "correction_idx": correction_idx,
                        "bear_idx": bear_idx,
                        "trough_idx": trough_idx,
                        "recovery_idx": i,
                    }
                )

                in_event = False

                peak_idx = i
                peak_price = close

                event_peak_idx = None
                event_peak_price = None
                correction_idx = None
                bear_idx = None
                trough_idx = None
                trough_drawdown = 0.0

    # Keep an active unrecovered correction at dataset end.
    if in_event:
        events.append(
            {
                "peak_idx": event_peak_idx,
                "correction_idx": correction_idx,
                "bear_idx": bear_idx,
                "trough_idx": trough_idx,
                "recovery_idx": None,
            }
        )

    if not events:
        raise RuntimeError(
            "No 10%+ drawdown events were detected."
        )

    # --------------------------------------------------------------
    # BUILD EVENT RECORDS
    # --------------------------------------------------------------

    records = []

    for number, event in enumerate(events, start=1):
        peak_idx = event["peak_idx"]
        correction_idx = event["correction_idx"]
        bear_idx = event["bear_idx"]
        trough_idx = event["trough_idx"]
        recovery_idx = event["recovery_idx"]

        peak = rows[peak_idx]
        correction = rows[correction_idx]
        trough = rows[trough_idx]

        drawdown_pct = (
            (trough["close"] / peak["close"]) - 1.0
        ) * 100.0

        classification = (
            "bear_market"
            if drawdown_pct <= BEAR_MARKET_THRESHOLD
            else "correction"
        )

        bear_threshold_date = None

        if bear_idx is not None:
            bear_threshold_date = (
                rows[bear_idx]["date"].isoformat()
            )

        recovery_date = None
        recovery_close = None
        trading_days_trough_to_recovery = None
        calendar_days_trough_to_recovery = None
        total_trading_days_underwater = None
        total_calendar_days_underwater = None

        if recovery_idx is not None:
            recovery = rows[recovery_idx]

            recovery_date = (
                recovery["date"].isoformat()
            )

            recovery_close = recovery["close"]

            trading_days_trough_to_recovery = (
                recovery_idx - trough_idx
            )

            calendar_days_trough_to_recovery = (
                recovery["date"] - trough["date"]
            ).days

            total_trading_days_underwater = (
                recovery_idx - peak_idx
            )

            total_calendar_days_underwater = (
                recovery["date"] - peak["date"]
            ).days

        record = {
            "event": number,
            "classification": classification,

            "peak_date":
                peak["date"].isoformat(),

            "peak_close":
                safe_round(peak["close"], 4),

            "correction_threshold_date":
                correction["date"].isoformat(),

            "bear_market_threshold_date":
                bear_threshold_date,

            "trough_date":
                trough["date"].isoformat(),

            "trough_close":
                safe_round(trough["close"], 4),

            "drawdown_pct":
                safe_round(drawdown_pct, 4),

            "trading_days_peak_to_correction":
                correction_idx - peak_idx,

            "calendar_days_peak_to_correction":
                (
                    correction["date"]
                    - peak["date"]
                ).days,

            "trading_days_peak_to_trough":
                trough_idx - peak_idx,

            "calendar_days_peak_to_trough":
                (
                    trough["date"]
                    - peak["date"]
                ).days,

            "recovery_date":
                recovery_date,

            "recovery_close":
                safe_round(recovery_close, 4),

            "trading_days_trough_to_recovery":
                trading_days_trough_to_recovery,

            "calendar_days_trough_to_recovery":
                calendar_days_trough_to_recovery,

            "total_trading_days_underwater":
                total_trading_days_underwater,

            "total_calendar_days_underwater":
                total_calendar_days_underwater,

            "recovered":
                recovery_idx is not None,
        }

        records.append(record)

    # --------------------------------------------------------------
    # SUMMARY STATISTICS
    # --------------------------------------------------------------

    def mean(values):
        values = [
            value
            for value in values
            if value is not None
        ]

        return (
            statistics.fmean(values)
            if values
            else None
        )

    def median(values):
        values = [
            value
            for value in values
            if value is not None
        ]

        return (
            statistics.median(values)
            if values
            else None
        )

    bear_count = sum(
        record["classification"] == "bear_market"
        for record in records
    )

    correction_count = len(records)

    correction_only_count = (
        correction_count - bear_count
    )

    recovered_records = [
        record
        for record in records
        if record["recovered"]
    ]

    drawdowns = [
        record["drawdown_pct"]
        for record in records
    ]

    peak_to_trough = [
        record["calendar_days_peak_to_trough"]
        for record in records
    ]

    trough_to_recovery = [
        record["calendar_days_trough_to_recovery"]
        for record in recovered_records
    ]

    underwater = [
        record["total_calendar_days_underwater"]
        for record in recovered_records
    ]

    # --------------------------------------------------------------
    # RECOVERY EXTREMES
    #
    # Keep recovery examples in the generated research dataset so
    # the article never depends on hard-coded historical events.
    # --------------------------------------------------------------

    fastest_recovery = min(
        recovered_records,
        key=lambda record:
            record["calendar_days_trough_to_recovery"],
    )

    longest_recovery = max(
        recovered_records,
        key=lambda record:
            record["calendar_days_trough_to_recovery"],
    )

    # --------------------------------------------------------------
    # HISTORICAL THRESHOLD FREQUENCY
    #
    # Measure spacing between first threshold crossings for each
    # independent drawdown episode. Using calendar days / 365.2425
    # keeps the calculation tied to actual event dates.
    # --------------------------------------------------------------

    correction_threshold_dates = [
        datetime.fromisoformat(
            record["correction_threshold_date"]
        ).date()
        for record in records
        if record["correction_threshold_date"]
    ]

    bear_threshold_dates = [
        datetime.fromisoformat(
            record["bear_market_threshold_date"]
        ).date()
        for record in records
        if record["bear_market_threshold_date"]
    ]

    correction_intervals_years = [
        (
            correction_threshold_dates[i]
            - correction_threshold_dates[i - 1]
        ).days / 365.2425
        for i in range(
            1,
            len(correction_threshold_dates),
        )
    ]

    bear_intervals_years = [
        (
            bear_threshold_dates[i]
            - bear_threshold_dates[i - 1]
        ).days / 365.2425
        for i in range(
            1,
            len(bear_threshold_dates),
        )
    ]

    summary = {
        "drawdowns_10pct_or_more":
            correction_count,

        "average_years_between_10pct_thresholds":
            safe_round(
                mean(correction_intervals_years),
                2,
            ),

        "median_years_between_10pct_thresholds":
            safe_round(
                median(correction_intervals_years),
                2,
            ),

        "average_years_between_20pct_thresholds":
            safe_round(
                mean(bear_intervals_years),
                2,
            ),

        "median_years_between_20pct_thresholds":
            safe_round(
                median(bear_intervals_years),
                2,
            ),

        "corrections_10_to_20pct":
            correction_only_count,

        "bear_markets_20pct_or_more":
            bear_count,

        "pct_10pct_drawdowns_reaching_20pct":
            safe_round(
                bear_count
                / correction_count
                * 100.0,
                2,
            ),

        "average_max_drawdown_pct":
            safe_round(
                mean(drawdowns),
                4,
            ),

        "median_max_drawdown_pct":
            safe_round(
                median(drawdowns),
                4,
            ),

        "average_calendar_days_peak_to_trough":
            safe_round(
                mean(peak_to_trough),
                2,
            ),

        "median_calendar_days_peak_to_trough":
            safe_round(
                median(peak_to_trough),
                2,
            ),

        "average_calendar_days_trough_to_recovery":
            safe_round(
                mean(trough_to_recovery),
                2,
            ),

        "median_calendar_days_trough_to_recovery":
            safe_round(
                median(trough_to_recovery),
                2,
            ),

        "average_total_calendar_days_underwater":
            safe_round(
                mean(underwater),
                2,
            ),

        "median_total_calendar_days_underwater":
            safe_round(
                median(underwater),
                2,
            ),
    }

    # --------------------------------------------------------------
    # FORWARD RETURNS AFTER DRAWDOWN THRESHOLD CROSSINGS
    #
    # Forward returns are measured from the first trading day on
    # which an independent episode reaches the specified drawdown
    # threshold. Calendar targets use the first available trading
    # day on or after the target date.
    #
    # This avoids measuring from the eventual trough, which would
    # introduce hindsight into the analysis.
    # --------------------------------------------------------------

    dates = [
        row["date"]
        for row in rows
    ]

    closes = [
        row["close"]
        for row in rows
    ]

    def add_months(source_date, months):
        month_index = (
            source_date.month - 1 + months
        )

        year = (
            source_date.year
            + month_index // 12
        )

        month = (
            month_index % 12 + 1
        )

        month_days = [
            31,
            (
                29
                if (
                    year % 4 == 0
                    and (
                        year % 100 != 0
                        or year % 400 == 0
                    )
                )
                else 28
            ),
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31,
        ]

        day = min(
            source_date.day,
            month_days[month - 1],
        )

        return datetime(
            year,
            month,
            day,
        ).date()

    def row_on_or_after(target_date):
        index = bisect_left(
            dates,
            target_date,
        )

        if index >= len(rows):
            return None

        return rows[index]

    forward_horizons = {
        "3m": 3,
        "6m": 6,
        "1y": 12,
        "3y": 36,
        "5y": 60,
    }

    def build_forward_return_research(
        threshold_field,
    ):
        results = {}

        for horizon, months in (
            forward_horizons.items()
        ):
            observations = []

            for record in records:
                threshold_text = record[
                    threshold_field
                ]

                if threshold_text is None:
                    continue

                threshold_date = (
                    datetime.strptime(
                        threshold_text,
                        "%Y-%m-%d",
                    ).date()
                )

                start_row = row_on_or_after(
                    threshold_date
                )

                target_date = add_months(
                    threshold_date,
                    months,
                )

                end_row = row_on_or_after(
                    target_date
                )

                if (
                    start_row is None
                    or end_row is None
                ):
                    continue

                forward_return_pct = (
                    (
                        end_row["close"]
                        / start_row["close"]
                    )
                    - 1.0
                ) * 100.0

                observations.append(
                    {
                        "event":
                            record["event"],

                        "threshold_date":
                            threshold_text,

                        "threshold_close":
                            safe_round(
                                start_row["close"],
                                4,
                            ),

                        "target_date":
                            target_date.isoformat(),

                        "observation_date":
                            end_row["date"].isoformat(),

                        "observation_close":
                            safe_round(
                                end_row["close"],
                                4,
                            ),

                        "forward_return_pct":
                            safe_round(
                                forward_return_pct,
                                4,
                            ),
                    }
                )

            values = [
                observation[
                    "forward_return_pct"
                ]
                for observation in observations
            ]

            positive_count = sum(
                value > 0
                for value in values
            )

            results[horizon] = {
                "months":
                    months,

                "n":
                    len(values),

                "average_return_pct":
                    safe_round(
                        mean(values),
                        2,
                    ),

                "median_return_pct":
                    safe_round(
                        median(values),
                        2,
                    ),

                "positive_count":
                    positive_count,

                "positive_pct":
                    (
                        safe_round(
                            positive_count
                            / len(values)
                            * 100.0,
                            2,
                        )
                        if values
                        else None
                    ),

                "observations":
                    observations,
            }

        return results

    forward_returns = {
        "methodology": (
            "Forward price returns are measured from the first "
            "closing-price threshold crossing within each "
            "independent drawdown episode. Calendar horizons use "
            "the first available trading day on or after the "
            "target date. Dividends are excluded. Measuring from "
            "the threshold crossing rather than the eventual "
            "trough avoids hindsight in the starting point."
        ),

        "after_10pct_decline":
            build_forward_return_research(
                "correction_threshold_date",
            ),

        "after_20pct_decline":
            build_forward_return_research(
                "bear_market_threshold_date",
            ),
    }

    # --------------------------------------------------------------
    # CURRENT DRAWDOWN
    # --------------------------------------------------------------

    latest = rows[-1]

    current_peak_idx = max(
        range(len(rows)),
        key=lambda i: rows[i]["close"],
    )

    current_peak = rows[current_peak_idx]

    current_drawdown_pct = (
        (
            latest["close"]
            / current_peak["close"]
        )
        - 1.0
    ) * 100.0

    current_drawdown = {
        "date":
            latest["date"].isoformat(),

        "close":
            safe_round(latest["close"], 4),

        "all_time_closing_high_date":
            current_peak["date"].isoformat(),

        "all_time_closing_high":
            safe_round(current_peak["close"], 4),

        "drawdown_from_all_time_closing_high_pct":
            safe_round(
                current_drawdown_pct,
                4,
            ),
    }

    # --------------------------------------------------------------
    # DAILY DRAWDOWN CHART SERIES
    #
    # This is the chart source of truth.
    #
    # Every daily observation is preserved so the D3 chart can provide
    # exact date-level hover/tap inspection. Nothing in the visualization
    # needs historical values hard-coded into TypeScript.
    #
    # Each observation is measured from the running all-time closing high.
    # Updating daily.csv and rerunning this generator automatically extends
    # the visualization and recalculates all drawdown values.
    # --------------------------------------------------------------

    chart_series = []

    running_peak_close = rows[0]["close"]

    for row in rows:
        if row["close"] >= running_peak_close:
            running_peak_close = row["close"]

        daily_drawdown_pct = (
            (row["close"] / running_peak_close) - 1.0
        ) * 100.0

        chart_series.append(
            {
                "date": row["date"].isoformat(),
                "close": safe_round(row["close"], 4),
                "drawdown_pct": safe_round(
                    daily_drawdown_pct,
                    4,
                ),
            }
        )

    # --------------------------------------------------------------
    # OUTPUT
    # --------------------------------------------------------------

    payload = {
        "symbol": "^GSPC",
        "ticker": "SP500",
        "name": "S&P 500",

        "metric":
            "peak_to_trough_drawdown",

        "return_type":
            "price_return",

        "source":
            "Yahoo Finance — ^GSPC via TNI daily archive",

        "source_file":
            str(SOURCE_PATH),

        "methodology": (
            "Drawdowns are calculated from daily S&P 500 "
            "closing prices. A distinct event begins at a "
            "prior closing high and qualifies when the index "
            "closes at least 10% below that peak. The event "
            "trough is the lowest closing price before the "
            "index recovers to or above the prior closing "
            "high. Events reaching at least a 20% decline "
            "are classified as bear markets. Dividends are "
            "excluded."
        ),

        "thresholds": {
            "correction_pct": 10,
            "bear_market_pct": 20,
        },

        "range": {
            "first_date":
                rows[0]["date"].isoformat(),

            "last_date":
                rows[-1]["date"].isoformat(),

            "daily_observations":
                len(rows),
        },

        "current_drawdown":
            current_drawdown,

        "summary":
            summary,

        "recovery_extremes": {
            "fastest": {
                "event":
                    fastest_recovery["event"],

                "peak_date":
                    fastest_recovery["peak_date"],

                "trough_date":
                    fastest_recovery["trough_date"],

                "recovery_date":
                    fastest_recovery["recovery_date"],

                "calendar_days_trough_to_recovery":
                    fastest_recovery[
                        "calendar_days_trough_to_recovery"
                    ],
            },

            "longest": {
                "event":
                    longest_recovery["event"],

                "peak_date":
                    longest_recovery["peak_date"],

                "trough_date":
                    longest_recovery["trough_date"],

                "recovery_date":
                    longest_recovery["recovery_date"],

                "calendar_days_trough_to_recovery":
                    longest_recovery[
                        "calendar_days_trough_to_recovery"
                    ],
            },
        },

        "forward_returns":
            forward_returns,

        "series":
            chart_series,

        "events":
            records,
    }

    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_PATH.write_text(
        json.dumps(
            payload,
            ensure_ascii=False,
            separators=(",", ":"),
        )
        + "\n",
        encoding="utf-8",
    )

    # --------------------------------------------------------------
    # VALIDATION REPORT
    # --------------------------------------------------------------

    print(
        "SOURCE:",
        SOURCE_PATH,
    )

    print(
        "ROWS:",
        len(rows),
    )

    print(
        "DATE RANGE:",
        rows[0]["date"].isoformat(),
        "→",
        rows[-1]["date"].isoformat(),
    )

    print()

    print(
        "10%+ DRAWDOWNS:",
        correction_count,
    )

    print(
        "10% TO <20%:",
        correction_only_count,
    )

    print(
        "20%+ BEAR MARKETS:",
        bear_count,
    )

    print(
        "% REACHING 20%:",
        summary[
            "pct_10pct_drawdowns_reaching_20pct"
        ],
    )

    print()

    print(
        f"{'#':>2}  "
        f"{'TYPE':<11} "
        f"{'PEAK':<10}  "
        f"{'TROUGH':<10}  "
        f"{'DD%':>8}  "
        f"{'RECOVERY':<10}"
    )

    print("-" * 72)

    for record in records:
        recovery = (
            record["recovery_date"]
            or "ACTIVE"
        )

        print(
            f"{record['event']:>2}  "
            f"{record['classification']:<11} "
            f"{record['peak_date']:<10}  "
            f"{record['trough_date']:<10}  "
            f"{record['drawdown_pct']:>8.2f}  "
            f"{recovery:<10}"
        )

    print()

    print(
        "CURRENT DRAWDOWN:",
        f"{current_drawdown_pct:.2f}%",
    )

    print(
        "OUTPUT:",
        OUTPUT_PATH,
    )


if __name__ == "__main__":
    main()
