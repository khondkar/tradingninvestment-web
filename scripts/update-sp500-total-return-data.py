from pathlib import Path
from datetime import date, timedelta
import json

import numpy as np
import pandas as pd
import yfinance as yf


# ============================================================
# TNI S&P 500 / U.S. EQUITY HISTORICAL RETURN DATA ENGINE
# ============================================================
#
# PERIODS
#
# 1872-1927
#   Robert Shiller / Yale reconstructed U.S. equity-market data.
#   This is NOT labeled as the modern S&P 500.
#
# 1928-2022
#   Price return:
#       Existing TNI conventional annual price-return series.
#
#   Total return:
#       Aswath Damodaran / NYU Stern dividend-inclusive
#       large-cap / S&P historical return series.
#
# 2023-present
#   Price return:
#       Yahoo Finance ^GSPC
#
#   Total return:
#       Yahoo Finance ^SP500TR
#
# Inflation
#   Historical:
#       Shiller CPI / Damodaran historical CPI.
#
#   Modern:
#       CPI-U, not seasonally adjusted, via FRED.
#
# Real Total Return
#
#       (1 + total return)
#       ------------------ - 1
#       (1 + inflation)
#
# Current-year real return is aligned to the latest available
# CPI month instead of mixing a later market date with an
# earlier inflation endpoint.
# ============================================================


ROOT = Path(__file__).resolve().parents[1]

SHILLER_PATH = (
    ROOT
    / "public"
    / "data"
    / "source"
    / "shiller-us-stock-market-monthly.csv"
)

DAMODARAN_PATH = (
    ROOT
    / "public"
    / "data"
    / "source"
    / "damodaran-sp500-total-returns.csv"
)

TNI_PRICE_PATH = (
    ROOT
    / "src"
    / "data"
    / "charts"
    / "sp500AnnualReturns.json"
)

OUTPUT_PATH = (
    ROOT
    / "public"
    / "data"
    / "sp500-historical-return-methods.csv"
)

OUTPUT_JSON_PATH = (
    ROOT
    / "public"
    / "data"
    / "sp500-historical-return-methods.json"
)

SRC_OUTPUT_JSON_PATH = (
    ROOT
    / "src"
    / "data"
    / "sp500-historical-return-methods.json"
)

FRED_CPI_URL = (
    "https://fred.stlouisfed.org/graph/"
    "fredgraph.csv?id=CPIAUCNS"
)

PRICE_TICKER = "^GSPC"
TOTAL_TICKER = "^SP500TR"

PRE_1928_START = 1872
DAMODARAN_START = 1928
MODERN_START = 2023

# Need 2022 year-end baseline to calculate 2023.
YAHOO_START = "2022-01-01"


# ============================================================
# HELPERS
# ============================================================

def pct_return(end, start):
    return (end / start - 1.0) * 100.0


def real_return(total_return, inflation):
    return (
        (1.0 + total_return / 100.0)
        / (1.0 + inflation / 100.0)
        - 1.0
    ) * 100.0


def require_file(path):
    if not path.exists():
        raise FileNotFoundError(
            f"Required source file not found: {path}"
        )


# ============================================================
# SHILLER
# ============================================================

def load_shiller():
    require_file(SHILLER_PATH)

    df = pd.read_csv(SHILLER_PATH)

    required = {"date", "price", "dividend", "cpi"}

    missing = required - set(df.columns)

    if missing:
        raise RuntimeError(
            f"Shiller source missing columns: {sorted(missing)}"
        )

    for col in required:
        df[col] = pd.to_numeric(
            df[col],
            errors="coerce",
        )

    df = df.dropna(
        subset=["date", "price", "cpi"]
    ).copy()

    df["year"] = df["date"].astype(int)

    df["month"] = (
        (df["date"] - df["year"]) * 100
    ).round().astype(int)

    df["period"] = pd.to_datetime(
        dict(
            year=df["year"],
            month=df["month"],
            day=1,
        )
    )

    return (
        df.sort_values("period")
        .reset_index(drop=True)
    )


def build_pre_1928_shiller(df):
    """
    Reconstructed pre-1928 U.S. equity-market history.

    Shiller's historical observations are monthly averages.
    Dividend is an annualized dividend series.

    TNI reconstructs a monthly total-return approximation
    using D/12 and compounds monthly observations.

    These rows are explicitly labeled reconstructed and must
    NOT be presented as literal modern S&P 500 history.
    """

    work = df.copy()

    work["previous_price"] = work["price"].shift(1)
    work["previous_cpi"] = work["cpi"].shift(1)

    work["monthly_dividend"] = (
        work["dividend"] / 12.0
    )

    work["price_factor"] = (
        work["price"]
        / work["previous_price"]
    )

    work["total_factor"] = (
        work["price"]
        + work["monthly_dividend"]
    ) / work["previous_price"]

    work["inflation_factor"] = (
        work["cpi"]
        / work["previous_cpi"]
    )

    rows = []

    for year in range(
        PRE_1928_START,
        DAMODARAN_START,
    ):
        group = work[
            work["year"] == year
        ].copy()

        if len(group) != 12:
            raise RuntimeError(
                f"Incomplete Shiller year: {year} "
                f"({len(group)} months)"
            )

        required = [
            "price_factor",
            "total_factor",
            "inflation_factor",
        ]

        if group[required].isna().any().any():
            raise RuntimeError(
                f"Missing Shiller return inputs for {year}"
            )

        price_ret = (
            group["price_factor"].prod() - 1
        ) * 100

        total_ret = (
            group["total_factor"].prod() - 1
        ) * 100

        inflation = (
            group["inflation_factor"].prod() - 1
        ) * 100

        real_ret = real_return(
            total_ret,
            inflation,
        )

        rows.append(
            {
                "year": year,
                "price_return": price_ret,
                "total_return": total_ret,
                "real_total_return": real_ret,
                "inflation": inflation,
                "is_ytd": False,
                "data_through": f"{year}-12-01",
                "inflation_through": f"{year}-12-01",
                "real_return_through": f"{year}-12-01",
                "period_type": (
                    "reconstructed_us_equity_market"
                ),
                "price_source": (
                    "Robert Shiller / Yale"
                ),
                "total_return_source": (
                    "Robert Shiller / Yale; "
                    "TNI reconstructed calculation"
                ),
                "inflation_source": (
                    "Robert Shiller / Yale CPI"
                ),
                "methodology": (
                    "shiller_reconstructed_monthly"
                ),
            }
        )

    return pd.DataFrame(rows)


# ============================================================
# EXISTING TNI PRICE RETURN SERIES
# ============================================================

def load_tni_price_returns():
    require_file(TNI_PRICE_PATH)

    with open(
        TNI_PRICE_PATH,
        "r",
        encoding="utf-8",
    ) as f:
        raw = json.load(f)

    rows = raw.get("data", [])

    if not rows:
        raise RuntimeError(
            "TNI S&P price-return JSON has no data."
        )

    df = pd.DataFrame(rows)

    df["year"] = pd.to_numeric(
        df["year"],
        errors="coerce",
    )

    df["value"] = pd.to_numeric(
        df["value"],
        errors="coerce",
    )

    df = df.dropna(
        subset=["year", "value"]
    ).copy()

    df["year"] = df["year"].astype(int)

    return df[
        ["year", "value"]
    ].rename(
        columns={"value": "price_return"}
    )


# ============================================================
# DAMODARAN
# ============================================================

def load_damodaran():
    require_file(DAMODARAN_PATH)

    df = pd.read_csv(DAMODARAN_PATH)

    required = {
        "year",
        "total_return",
        "inflation",
        "real_total_return",
    }

    missing = required - set(df.columns)

    if missing:
        raise RuntimeError(
            "Damodaran snapshot missing columns: "
            f"{sorted(missing)}"
        )

    df["year"] = pd.to_numeric(
        df["year"],
        errors="coerce",
    )

    for col in [
        "total_return",
        "inflation",
        "real_total_return",
    ]:
        df[col] = pd.to_numeric(
            df[col],
            errors="coerce",
        )

    df = df.dropna(
        subset=["year", "total_return"]
    ).copy()

    df["year"] = df["year"].astype(int)

    return df


def build_1928_2022(
    price,
    damodaran,
):
    price = price[
        price["year"].between(
            DAMODARAN_START,
            MODERN_START - 1,
        )
    ].copy()

    total = damodaran[
        damodaran["year"].between(
            DAMODARAN_START,
            MODERN_START - 1,
        )
    ].copy()

    merged = price.merge(
        total[
            [
                "year",
                "total_return",
                "inflation",
                "real_total_return",
            ]
        ],
        on="year",
        how="inner",
        validate="one_to_one",
    )

    expected = set(
        range(
            DAMODARAN_START,
            MODERN_START,
        )
    )

    actual = set(merged["year"])

    missing = sorted(expected - actual)

    if missing:
        raise RuntimeError(
            f"Missing 1928-2022 years: {missing}"
        )

    # Recalculate real return ourselves.
    merged["real_total_return"] = merged.apply(
        lambda r: real_return(
            r["total_return"],
            r["inflation"],
        ),
        axis=1,
    )

    merged["is_ytd"] = False

    merged["data_through"] = (
        merged["year"].astype(str)
        + "-12-31"
    )

    merged["inflation_through"] = (
        merged["year"].astype(str)
        + "-12"
    )

    merged["real_return_through"] = (
        merged["year"].astype(str)
        + "-12"
    )

    merged["period_type"] = (
        "sp500_and_predecessor_large_cap"
    )

    merged["price_source"] = (
        "TNI conventional annual price-return series"
    )

    merged["total_return_source"] = (
        "Aswath Damodaran / NYU Stern"
    )

    merged["inflation_source"] = (
        "Damodaran historical CPI-U series"
    )

    merged["methodology"] = (
        "conventional_annual_history"
    )

    return merged


# ============================================================
# YAHOO
# ============================================================

def load_yahoo(ticker):
    end = (
        date.today() + timedelta(days=1)
    ).isoformat()

    df = yf.download(
        ticker,
        start=YAHOO_START,
        end=end,
        interval="1d",
        auto_adjust=False,
        progress=False,
        multi_level_index=False,
    )

    if df.empty:
        raise RuntimeError(
            f"No Yahoo data for {ticker}"
        )

    if "Close" not in df.columns:
        raise RuntimeError(
            f"Yahoo Close missing for {ticker}"
        )

    out = df[["Close"]].copy()

    out.columns = ["level"]

    out["level"] = pd.to_numeric(
        out["level"],
        errors="coerce",
    )

    return (
        out.dropna()
        .sort_index()
    )


# ============================================================
# FRED CPI
# ============================================================

def load_fred_cpi():
    df = pd.read_csv(FRED_CPI_URL)

    required = {
        "observation_date",
        "CPIAUCNS",
    }

    missing = required - set(df.columns)

    if missing:
        raise RuntimeError(
            f"FRED CPI missing columns: {sorted(missing)}"
        )

    df["date"] = pd.to_datetime(
        df["observation_date"]
    )

    df["cpi"] = pd.to_numeric(
        df["CPIAUCNS"],
        errors="coerce",
    )

    return (
        df[["date", "cpi"]]
        .dropna()
        .sort_values("date")
        .reset_index(drop=True)
    )


# ============================================================
# MARKET LEVEL HELPERS
# ============================================================

def final_market_observation(df, year):
    group = df[df.index.year == year]

    if group.empty:
        return None

    return (
        group.index[-1],
        float(group.iloc[-1]["level"]),
    )


def market_on_or_before(df, target):
    eligible = df[
        df.index <= pd.Timestamp(target)
    ]

    if eligible.empty:
        return None

    return (
        eligible.index[-1],
        float(eligible.iloc[-1]["level"]),
    )


def december_cpi(cpi, year):
    group = cpi[
        (cpi["date"].dt.year == year)
        & (cpi["date"].dt.month == 12)
    ]

    if group.empty:
        return None

    row = group.iloc[-1]

    return row["date"], float(row["cpi"])


# ============================================================
# MODERN 2023+
# ============================================================

def build_modern(price, total, cpi):
    current_year = date.today().year

    rows = []

    for year in range(
        MODERN_START,
        current_year + 1,
    ):
        previous_year = year - 1

        price_start = final_market_observation(
            price,
            previous_year,
        )

        price_end = final_market_observation(
            price,
            year,
        )

        total_start = final_market_observation(
            total,
            previous_year,
        )

        total_end = final_market_observation(
            total,
            year,
        )

        if not all(
            [
                price_start,
                price_end,
                total_start,
                total_end,
            ]
        ):
            raise RuntimeError(
                f"Missing modern market levels for {year}"
            )

        price_ret = pct_return(
            price_end[1],
            price_start[1],
        )

        total_ret = pct_return(
            total_end[1],
            total_start[1],
        )

        market_through = min(
            price_end[0],
            total_end[0],
        )

        is_ytd = year == current_year

        inflation = np.nan
        real_ret = np.nan
        inflation_through = ""
        real_return_through = ""

        if not is_ytd:
            cpi_start = december_cpi(
                cpi,
                previous_year,
            )

            cpi_end = december_cpi(
                cpi,
                year,
            )

            if not cpi_start or not cpi_end:
                raise RuntimeError(
                    f"Missing December CPI for {year}"
                )

            inflation = pct_return(
                cpi_end[1],
                cpi_start[1],
            )

            real_ret = real_return(
                total_ret,
                inflation,
            )

            inflation_through = (
                cpi_end[0].strftime("%Y-%m")
            )

            real_return_through = (
                market_through.strftime(
                    "%Y-%m-%d"
                )
            )

        else:
            # ------------------------------------------------
            # CURRENT-YEAR REAL RETURN
            #
            # Align the market total-return endpoint with the
            # latest CPI month.
            #
            # Example:
            # latest CPI = August 2026
            #
            # inflation:
            # Dec 2025 CPI -> Aug 2026 CPI
            #
            # market:
            # Dec 2025 ^SP500TR ->
            # last trading day of Aug 2026
            #
            # Therefore the real return is genuinely aligned.
            # ------------------------------------------------

            current_cpi = cpi[
                cpi["date"].dt.year == year
            ]

            if not current_cpi.empty:
                latest_cpi = current_cpi.iloc[-1]

                prior_dec = december_cpi(
                    cpi,
                    previous_year,
                )

                if prior_dec:
                    inflation = pct_return(
                        float(latest_cpi["cpi"]),
                        prior_dec[1],
                    )

                    month_end = (
                        latest_cpi["date"]
                        + pd.offsets.MonthEnd(0)
                    )

                    aligned_total_end = (
                        market_on_or_before(
                            total,
                            month_end,
                        )
                    )

                    if aligned_total_end:
                        aligned_total_ret = pct_return(
                            aligned_total_end[1],
                            total_start[1],
                        )

                        real_ret = real_return(
                            aligned_total_ret,
                            inflation,
                        )

                        real_return_through = (
                            aligned_total_end[0]
                            .strftime("%Y-%m-%d")
                        )

                    inflation_through = (
                        latest_cpi["date"]
                        .strftime("%Y-%m")
                    )

        rows.append(
            {
                "year": year,
                "price_return": price_ret,
                "total_return": total_ret,
                "real_total_return": real_ret,
                "inflation": inflation,
                "is_ytd": is_ytd,
                "data_through": (
                    market_through.strftime(
                        "%Y-%m-%d"
                    )
                ),
                "inflation_through": (
                    inflation_through
                ),
                "real_return_through": (
                    real_return_through
                ),
                "period_type": (
                    "modern_sp500"
                ),
                "price_source": (
                    "Yahoo Finance ^GSPC"
                ),
                "total_return_source": (
                    "Yahoo Finance ^SP500TR"
                ),
                "inflation_source": (
                    "BLS CPI-U via FRED CPIAUCNS"
                ),
                "methodology": (
                    "modern_index_levels"
                ),
            }
        )

    return pd.DataFrame(rows)


# ============================================================
# VALIDATION
# ============================================================

def validate(final):
    if final.empty:
        raise RuntimeError(
            "Final dataset is empty."
        )

    if final["year"].duplicated().any():
        years = final.loc[
            final["year"].duplicated(),
            "year",
        ].tolist()

        raise RuntimeError(
            f"Duplicate years: {years}"
        )

    expected = set(
        range(
            PRE_1928_START,
            date.today().year + 1,
        )
    )

    actual = set(
        final["year"].astype(int)
    )

    missing = sorted(expected - actual)

    if missing:
        raise RuntimeError(
            f"Missing years: {missing}"
        )

    required_returns = [
        "price_return",
        "total_return",
    ]

    if final[
        required_returns
    ].isna().any().any():
        bad = final[
            final[
                required_returns
            ].isna().any(axis=1)
        ]

        raise RuntimeError(
            "Missing required returns:\n"
            + bad.to_string(index=False)
        )

    completed = final[
        final["is_ytd"] == False
    ]

    if completed[
        "real_total_return"
    ].isna().any():
        bad = completed[
            completed[
                "real_total_return"
            ].isna()
        ]

        raise RuntimeError(
            "Missing completed-year real returns:\n"
            + bad.to_string(index=False)
        )

    if (
        final["year"].iloc[0]
        != PRE_1928_START
    ):
        raise RuntimeError(
            "Unexpected first year."
        )

    if (
        final["year"].iloc[-1]
        != date.today().year
    ):
        raise RuntimeError(
            "Unexpected final year."
        )


# ============================================================
# OUTPUT
# ============================================================

def normalize_output(final):
    final = final.sort_values(
        "year"
    ).reset_index(drop=True)

    numeric = [
        "price_return",
        "total_return",
        "real_total_return",
        "inflation",
    ]

    for col in numeric:
        final[col] = pd.to_numeric(
            final[col],
            errors="coerce",
        ).round(4)

    columns = [
        "year",
        "price_return",
        "total_return",
        "real_total_return",
        "inflation",
        "is_ytd",
        "data_through",
        "inflation_through",
        "real_return_through",
        "period_type",
        "price_source",
        "total_return_source",
        "inflation_source",
        "methodology",
    ]

    return final[columns]


def save_outputs(final):
    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    final.to_csv(
        OUTPUT_PATH,
        index=False,
    )

    records = (
        final.replace({np.nan: None})
        .to_dict(orient="records")
    )

    payload = {
        "dataset": (
            "TNI Historical U.S. Equity / "
            "S&P 500 Return Methods"
        ),
        "start_year": int(
            final["year"].min()
        ),
        "end_year": int(
            final["year"].max()
        ),
        "current_year_is_ytd": bool(
            final.iloc[-1]["is_ytd"]
        ),
        "methodology_periods": [
            {
                "start": 1872,
                "end": 1927,
                "type": (
                    "reconstructed_us_equity_market"
                ),
                "description": (
                    "Robert Shiller/Yale historical "
                    "U.S. equity-market observations. "
                    "TNI reconstructs annual price and "
                    "dividend-reinvested returns from "
                    "monthly observations. This period "
                    "is not represented as the modern "
                    "S&P 500."
                ),
            },
            {
                "start": 1928,
                "end": 2022,
                "type": (
                    "sp500_and_predecessor_large_cap"
                ),
                "description": (
                    "TNI conventional annual price "
                    "returns combined with Aswath "
                    "Damodaran/NYU Stern dividend-"
                    "inclusive large-cap/S&P returns."
                ),
            },
            {
                "start": 2023,
                "end": int(
                    final["year"].max()
                ),
                "type": "modern_sp500",
                "description": (
                    "Yahoo Finance S&P 500 Price Index "
                    "(^GSPC), S&P 500 Total Return "
                    "Index (^SP500TR), and BLS CPI-U "
                    "via FRED."
                ),
            },
        ],
        "real_return_formula": (
            "(1 + total_return) / "
            "(1 + inflation) - 1"
        ),
        "data": records,
    }

    for json_path in (
        OUTPUT_JSON_PATH,
        SRC_OUTPUT_JSON_PATH,
    ):
        json_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with open(
            json_path,
            "w",
            encoding="utf-8",
        ) as f:
            json.dump(
                payload,
                f,
                indent=2,
                allow_nan=False,
            )


# ============================================================
# REPORT
# ============================================================

def report(final):
    print("\n" + "=" * 74)
    print("TNI FINAL HISTORICAL RETURN DATASET")
    print("=" * 74)

    print(
        "\nYEARS:",
        final["year"].min(),
        "->",
        final["year"].max(),
    )

    print("ROWS:", len(final))

    print("\nPERIOD COUNTS:")
    print(
        final["period_type"]
        .value_counts()
        .to_string()
    )

    print("\nTRANSITION CHECK:")
    print(
        final.loc[
            final["year"].isin(
                [
                    1926,
                    1927,
                    1928,
                    1929,
                    2021,
                    2022,
                    2023,
                    2024,
                    2025,
                    date.today().year,
                ]
            ),
            [
                "year",
                "price_return",
                "total_return",
                "real_total_return",
                "inflation",
                "is_ytd",
                "period_type",
            ],
        ].to_string(index=False)
    )

    current = final.iloc[-1]

    print("\nCURRENT YEAR:")
    print(
        "Price/Total market data through:",
        current["data_through"],
    )
    print(
        "Inflation through:",
        current["inflation_through"],
    )
    print(
        "Real-return market alignment through:",
        current["real_return_through"],
    )

    print("\nCSV:")
    print(OUTPUT_PATH)

    print("\nJSON:")
    print(OUTPUT_JSON_PATH)

    print("\nVALIDATION: PASS")
    print("=" * 74)


# ============================================================
# MAIN
# ============================================================

def main():
    print(
        "1/8 Loading Shiller historical source..."
    )
    shiller = load_shiller()

    print(
        "2/8 Building reconstructed 1872-1927 history..."
    )
    reconstructed = build_pre_1928_shiller(
        shiller
    )

    print(
        "3/8 Loading existing TNI price-return history..."
    )
    tni_price = load_tni_price_returns()

    print(
        "4/8 Loading Damodaran total-return history..."
    )
    damodaran = load_damodaran()

    print(
        "5/8 Building 1928-2022 conventional history..."
    )
    historical = build_1928_2022(
        tni_price,
        damodaran,
    )

    print(
        "6/8 Downloading modern market/CPI data..."
    )
    price = load_yahoo(
        PRICE_TICKER
    )

    total = load_yahoo(
        TOTAL_TICKER
    )

    cpi = load_fred_cpi()

    print(
        "7/8 Building 2023-present modern history..."
    )
    modern = build_modern(
        price,
        total,
        cpi,
    )

    final = pd.concat(
        [
            reconstructed,
            historical,
            modern,
        ],
        ignore_index=True,
    )

    final = normalize_output(
        final
    )

    print(
        "8/8 Validating and writing master dataset..."
    )

    validate(final)
    save_outputs(final)
    report(final)


if __name__ == "__main__":
    main()
