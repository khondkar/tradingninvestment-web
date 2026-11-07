#!/usr/bin/env python3
"""Register existing or new stock datasets without publishing an article."""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / 'src/research/annual-returns/stockDataRegistry.ts'
DATA = ROOT / 'src/data/charts'


def locate(ticker: str, suffix: str) -> Path:
    candidates = [ticker.lower(), ticker.lower().replace('.', '-'), ticker.lower().replace('.', '')]
    matches = [DATA / f'{s}{suffix}.json' for s in dict.fromkeys(candidates) if (DATA / f'{s}{suffix}.json').is_file()]
    if len(matches) != 1:
        raise ValueError(f'Expected one {suffix} JSON for {ticker}; found {len(matches)}: {matches}')
    return matches[0]


def validate(path: Path, ticker: str, annual: bool) -> None:
    obj = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(obj, dict) or not isinstance(obj.get('data'), list) or not obj['data']:
        raise ValueError(f'Invalid or empty data array: {path}')
    symbol = obj.get('ticker')
    if symbol and str(symbol).upper().replace('-', '.') != ticker:
        raise ValueError(f'Ticker mismatch in {path}: {symbol} != {ticker}')
    years = []
    for row in obj['data']:
        if not isinstance(row, dict) or type(row.get('year')) is not int:
            raise ValueError(f'Invalid year in {path}')
        years.append(row['year'])
        if annual:
            if not isinstance(row.get('value'), (int, float)):
                raise ValueError(f'Missing annual value in {path}')
        elif not isinstance(row.get('total_return'), (int, float)):
            raise ValueError(f'Missing total_return in {path}')
    if len(years) != len(set(years)):
        raise ValueError(f'Duplicate years in {path}')


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--ticker', required=True)
    p.add_argument('--dry-run', action='store_true')
    args = p.parse_args()
    ticker = args.ticker.upper().replace('-', '.')
    if not re.fullmatch(r'[A-Z][A-Z0-9]*(?:\.[A-Z0-9]+)?', ticker):
        p.error('Unsupported ticker format')
    try:
        annual = locate(ticker, 'AnnualReturns')
        methods = locate(ticker, 'ReturnMethods')
        validate(annual, ticker, True)
        validate(methods, ticker, False)
        source = REGISTRY.read_text(encoding='utf-8')
        key = f'"{ticker}"' if '.' in ticker else ticker
        entries = list(re.finditer(r'^    ("[A-Z0-9.]+"|[A-Z][A-Z0-9]*)\s*:\s*\{', source, re.M))
        match = next((m for m in entries if m.group(1).strip('"') == ticker), None)
        # Existing registrations are not rewritten: avoid overwriting hand-tuned entries.
        if match:
            end = next((m.start() for m in entries if m.start() > match.start()), source.index('\n  }', match.end()))
            block = source[match.start():end]
            if re.search(r'\breturnMethods\s*:', block):
                print(f'{ticker}: total-return data already registered; no changes.')
                return
            if not re.search(r'\bannualReturns\s*:', block):
                raise ValueError(f'{ticker}: existing entry lacks annualReturns; refusing modification')
        else:
            if 'stockResearchDataRegistry' not in source:
                raise ValueError('Registry declaration not found')
        # Generate unique identifiers and detect import-name collisions.
        suffix = re.sub(r'[^a-z0-9]', '', ticker.lower())
        a_var, m_var = suffix + 'AnnualReturns', suffix + 'ReturnMethods'
        a_import = f'import {a_var} from "../../data/charts/{annual.name}"'
        m_import = f'import {m_var} from "../../data/charts/{methods.name}"'
        additions = []
        if not match:
            for variable, imp in [(a_var, a_import), (m_var, m_import)]:
                existing = re.findall(rf'^import\s+{re.escape(variable)}\s+from\s+["\']([^"\']+)["\']', source, re.M)
                if existing and not any(imp.endswith(f'"{x}"') for x in existing):
                    raise ValueError(f'Import name collision: {variable}')
                if not existing:
                    additions.append(imp)
            insertion = source.find('\n  }\n', source.find('export const stockResearchDataRegistry'))
            if insertion < 0:
                raise ValueError('Could not locate registry closing brace')
            source = source[:insertion] + f'\n    {key}: {{\n      annualReturns: {a_var} as AnnualReturnsPageData,\n      returnMethods: {m_var}.data as ReturnMethodRow[],\n    }},\n' + source[insertion:]
        else:
            if m_import not in source and not re.search(rf'^import\s+{re.escape(m_var)}\s+from', source, re.M):
                additions.append(m_import)
            elif m_import not in source:
                raise ValueError(f'Import name collision: {m_var}')
            pos = match.end()
            source = source[:pos] + f'\n      returnMethods: {m_var}.data as ReturnMethodRow[],' + source[pos:]
        if additions:
            source = '\n'.join(additions) + '\n' + source
        if args.dry_run:
            print(f'DRY RUN: would register {ticker} with {annual.name} and {methods.name}')
            return
        # Refuse a concurrent change instead of clobbering it.
        old = REGISTRY.read_text(encoding='utf-8')
        if match and not re.search(rf'^    {re.escape(key)}\s*:', old, re.M):
            raise ValueError('Registry changed during operation')
        backup = REGISTRY.with_name(REGISTRY.name + '.bak-auto-register')
        if backup.exists():
            raise ValueError(f'Backup already exists: {backup}; move it before retrying')
        backup.write_text(old, encoding='utf-8')
        REGISTRY.write_text(source, encoding='utf-8')
        print(f'Registered {ticker}. Backup: {backup}')
        print('Publication registry unchanged; new stock is NOT published.')
    except (ValueError, OSError, json.JSONDecodeError) as e:
        raise SystemExit(f'STOP: {e}')

if __name__ == '__main__':
    main()
