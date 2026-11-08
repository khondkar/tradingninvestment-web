#!/usr/bin/env python3
"""Publish NVDA annual returns and synchronized drawdowns together."""
import argparse
import fcntl
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--annual-input', required=True)
    parser.add_argument('--annual-output', required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    annual = json.loads(Path(args.annual_input).read_text())
    expected = annual['current_year']['through_date']
    destination = root / 'src/data/charts/nvdaVsSp500Drawdowns.json'
    annual_destination = Path(args.annual_output).resolve()
    if annual_destination != root / 'src/data/charts/nvdaAnnualReturns.json':
        raise SystemExit('Unexpected NVDA annual-return destination.')
    lock_key = hashlib.sha256(str(root).encode()).hexdigest()[:20]
    lock_path = Path(tempfile.gettempdir()) / f'tni-nvda-{lock_key}.lock'

    def run(*arguments):
        subprocess.run([sys.executable, *arguments], cwd=root, check=True)

    with lock_path.open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        run(
            'scripts/generate-monthly-returns.py',
            '--symbol', '^GSPC', '--ticker', 'SP500', '--name', 'S&P 500',
            '--start-year', '1928', '--asset-id', 'sp500',
            '--output', 'src/data/charts/sp500MonthlyReturns.json',
        )
        with tempfile.TemporaryDirectory(prefix='nvda-refresh-', dir=destination.parent) as temporary:
            folder = Path(temporary)
            pending = folder / 'drawdowns.json'
            run(
                'scripts/generate-stock-drawdown-comparison.py',
                '--ticker', 'NVDA', '--start', '2000-01-01', '--output', str(pending),
            )
            dataset = json.loads(pending.read_text())
            if dataset['range']['last_date'] != expected:
                raise SystemExit(f'STOP: drawdowns end {dataset["range"]["last_date"]}; returns end {expected}.')
            rows = dataset['data']
            if not rows or dataset['range']['daily_observations'] != len(rows) or rows[-1]['date'] != expected:
                raise SystemExit('STOP: drawdown observations are inconsistent.')
            # Keep the existing NVDA annual chart's YTD observation.
            current = annual['current_year']
            annual['data'] = [row for row in annual['data'] if row['year'] != current['year']]
            annual['data'].append({
                'year': current['year'], 'value': current['return_pct'],
                'label': current['label'],
                'status': 'positive' if current['return_pct'] >= 0 else 'negative',
            })
            staged_annual = folder / 'annual.json'
            staged_annual.write_text(json.dumps(annual, indent=2) + '\n')
            targets = [(pending, destination), (staged_annual, annual_destination)]
            backups = []
            for index, (_, target) in enumerate(targets):
                backup = folder / f'original-{index}.json'
                existed = target.exists()
                if existed:
                    shutil.copy2(target, backup)
                backups.append((target, backup, existed))
            try:
                for staged, target in targets:
                    staged.replace(target)
            except Exception:
                for target, backup, existed in backups:
                    if existed:
                        shutil.copy2(backup, target)
                    else:
                        target.unlink(missing_ok=True)
                raise
    print(f'NVDA returns, drawdowns and recovery synchronized through {expected}.')


if __name__ == '__main__':
    main()
