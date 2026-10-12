from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path("research/doji")
df = pd.read_csv(
    ROOT / "spy_doji_analysis.csv",
    parse_dates=["Date"]
).sort_values("Date").reset_index(drop=True)

# Previous five sessions, ending on the Doji date.
df["prior_5d_return"] = (
    df["Close"] / df["Close"].shift(5) - 1
) * 100

df["is_doji"] = (
    df["body_ratio"].notna()
    & (df["body_ratio"] <= 0.10)
)

df["prior_trend"] = np.select(
    [
        df["prior_5d_return"] < -2,
        df["prior_5d_return"] > 2,
    ],
    ["Downtrend", "Uptrend"],
    default="Neutral",
)

scenarios = [
    ("Downtrend", "Bullish reversal", 1),
    ("Uptrend", "Bearish reversal", -1),
    ("Uptrend", "Bullish continuation", 1),
    ("Downtrend", "Bearish continuation", -1),
]

records = []

for horizon in [1, 3, 5, 10]:
    column = f"return_{horizon}d"

    for trend, scenario, direction in scenarios:
        eligible = df.loc[
            (df["prior_trend"] == trend)
            & df["prior_5d_return"].notna()
            & df[column].notna()
            & df["body_ratio"].notna()
        ]

        signal = eligible.loc[eligible["is_doji"]]
        control = eligible.loc[~eligible["is_doji"]]

        def success_rate(frame):
            if frame.empty:
                return np.nan
            return (
                (frame[column] * direction > 0).mean() * 100
            )

        doji_rate = success_rate(signal)
        control_rate = success_rate(control)

        records.append({
            "Scenario": scenario,
            "Prior_Trend": trend,
            "Horizon": horizon,
            "Doji_N": len(signal),
            "Control_N": len(control),
            "Doji_Success_Pct": doji_rate,
            "Control_Success_Pct": control_rate,
            "Advantage_pp": doji_rate - control_rate,
            "Doji_Avg_Return_Pct": signal[column].mean(),
            "Control_Avg_Return_Pct": control[column].mean(),
        })

results = pd.DataFrame(records)

output = ROOT / "spy_doji_reversal_continuation.csv"
results.to_csv(output, index=False, float_format="%.5f")

print("\nSPY DOJI — REVERSAL VS CONTINUATION")
print("=" * 90)

for horizon in [1, 3, 5, 10]:
    print(f"\n{horizon}-DAY FORWARD OUTCOME")

    subset = results.loc[results["Horizon"] == horizon]

    print(
        subset[
            [
                "Scenario",
                "Doji_N",
                "Control_N",
                "Doji_Success_Pct",
                "Control_Success_Pct",
                "Advantage_pp",
            ]
        ].round(2).to_string(index=False)
    )

print("\nSaved:", output)
print("Total qualifying Doji:", int(df["is_doji"].sum()))
