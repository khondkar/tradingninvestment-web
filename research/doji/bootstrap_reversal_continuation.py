from pathlib import Path
import numpy as np
import pandas as pd

root = Path("research/doji")
df = pd.read_csv(root / "spy_doji_analysis.csv").sort_values("Date").reset_index(drop=True)

df["prior_5d"] = (df["Close"] / df["Close"].shift(5) - 1) * 100
df["is_doji"] = df["body_ratio"].notna() & (df["body_ratio"] <= 0.10)

scenarios = [
    ("Bullish reversal", "down", 1),
    ("Bearish reversal", "up", -1),
    ("Bullish continuation", "up", 1),
    ("Bearish continuation", "down", -1),
]

rng = np.random.default_rng(42)
n = len(df)
block = 20
reps = 2000

def effect(sample, trend, direction):
    prior = sample["prior_5d"]
    mask = (prior < -2) if trend == "down" else (prior > 2)
    valid = mask & sample["return_10d"].notna() & sample["body_ratio"].notna()
    signal = valid & sample["is_doji"]
    control = valid & ~sample["is_doji"]

    if signal.sum() == 0 or control.sum() == 0:
        return np.nan

    success = sample["return_10d"] * direction > 0
    return 100 * (success[signal].mean() - success[control].mean())

records = []

# Resample contiguous rows, retaining their already-computed
# prior-trend labels and forward outcomes.
for name, trend, direction in scenarios:
    observed = effect(df, trend, direction)
    draws = []

    for _ in range(reps):
        starts = rng.integers(0, n, size=(n + block - 1) // block)
        indices = np.concatenate([
            (start + np.arange(block)) % n for start in starts
        ])[:n]

        estimate = effect(df.iloc[indices], trend, direction)
        if np.isfinite(estimate):
            draws.append(estimate)

    lo, hi = np.percentile(draws, [2.5, 97.5])

    records.append({
        "Scenario": name,
        "Observed_pp": observed,
        "CI_Low": lo,
        "CI_High": hi,
        "Bootstrap_Replicates": len(draws),
        "Block_Length": block,
    })

result = pd.DataFrame(records)
result.to_csv(root / "spy_doji_reversal_bootstrap.csv", index=False)

print("\n10-DAY REVERSAL VS CONTINUATION — BOOTSTRAP")
print(result.round(3).to_string(index=False))
