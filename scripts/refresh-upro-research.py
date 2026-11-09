#!/usr/bin/env python3
"""Refresh the complete UPRO research bundle from synchronized daily observations."""
import argparse
import csv
import importlib.util
import json
import os
from pathlib import Path
import tempfile
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib
matplotlib.use('Agg')
from upro_tqqq_data import build_comparison
from upro_comparison_csv import write_comparison_csv
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('tni_leveraged', ROOT/'scripts/generate-leveraged-etf-annual-returns.py')
shared = importlib.util.module_from_spec(spec)
spec.loader.exec_module(shared)


def load_prices(through):
    frames = {}
    for ticker in ('UPRO', 'SPY'):
        raw = yf.download(ticker, start='2009-06-23', end=(through + timedelta(days=1)).isoformat(),
                          auto_adjust=False, progress=False)
        frame = pd.DataFrame({key: shared.extract_series(raw, key) for key in ('Close', 'Adj Close')})
        frame.index = pd.to_datetime(frame.index).tz_localize(None)
        if frame.empty or frame.index.has_duplicates or not np.isfinite(frame.to_numpy()).all() or (frame <= 0).any().any():
            raise RuntimeError(f'{ticker}: missing, duplicate or invalid prices')
        frames[ticker] = frame.sort_index()
    first = max(frame.index[0] for frame in frames.values())
    frames = {ticker: frame.loc[first:] for ticker, frame in frames.items()}
    if not frames['UPRO'].index.equals(frames['SPY'].index):
        raise RuntimeError('UPRO and SPY trading dates differ; resolve missing observations before publication.')
    if (through - frames['UPRO'].index[-1].date()).days > 4:
        raise RuntimeError('Market data is stale; no files were published.')
    return frames


def annual_payload(frame, ticker, through):
    annual = frame['Close'].resample('YE').last().pct_change().dropna() * 100
    payload = shared.build_annual_payload('ProShares UltraPro S&P500' if ticker == 'UPRO' else 'SPY', ticker,
        pd.DataFrame({'year': annual.index.year, 'return_pct': annual.values}),
        'leveraged_etf' if ticker == 'UPRO' else 'etf')
    payload['data_through'] = through
    if payload['current_year']:
        payload['current_year']['through_date'] = through
    return payload


def period_rows(frame, frequency):
    grouped = frame.resample(frequency).last() if frequency else frame
    changes = grouped.pct_change().dropna() * 100
    result = []
    for date, row in changes.iterrows():
        # Partial weeks/months are visible but excluded from complete-period averages.
        status = 'partial' if frequency and date > frame.index[-1] else 'complete'
        result.append({'date': min(date, frame.index[-1]).date().isoformat(),
                       'asset_return': round(float(row['UPRO']), 6),
                       'benchmark_return': round(float(row['SPY']), 6),
                       'difference': round(float(row['UPRO'] - row['SPY']), 6), 'status': status})
    return result


def social_chart(dataset, output):
    rows = dataset['data']
    dates = pd.to_datetime([row['date'] for row in rows])
    navy, blue, red = '#10233f', '#075ac8', '#bb2134'
    plt.rcParams.update({'font.weight': 'bold', 'axes.labelweight': 'bold', 'font.size': 11})
    fig = plt.figure(figsize=(12, 6.3), dpi=100, facecolor='#f5f8fc')
    fig.text(.04,.93,'TNI ETF INTELLIGENCE',color=blue,fontsize=13,weight='bold')
    fig.text(.04,.86,'UPRO vs SPY: How deep were the drawdowns?',color=navy,fontsize=22,weight='bold')
    fig.text(.04,.805,f"Daily adjusted closes · {dates[0].date()} to {dates[-1].date()}",color=navy,fontsize=12)
    for xpos, label, key, color in ((.04,'UPRO','asset',red),(.53,'SPY','benchmark',blue)):
        summary = dataset[key+'_summary']
        days = summary['calendar_days_trough_to_recovery']
        recovery = f'{days:,} calendar days from low to recovery' if days is not None else 'Previous peak not yet recovered'
        fig.text(xpos,.735,f"{label} maximum drawdown: {summary['max_drawdown_pct']:.1f}%",color=color,fontsize=15)
        fig.text(xpos,.692,recovery,color=navy,fontsize=10.5)
    ax = fig.add_axes([.08,.19,.88,.44],facecolor='white')
    for key,label,color in (('asset','UPRO',red),('benchmark','SPY',blue)):
        ax.plot(dates,[row[key+'_drawdown_pct'] for row in rows],label=label,color=color,lw=2.4)
    ax.yaxis.set_major_formatter(PercentFormatter(100,decimals=0))
    ax.grid(axis='y',color='#c8d2df',lw=.7)
    ax.tick_params(colors=navy,labelsize=11,length=0,pad=8)
    ax.legend(frameon=False,loc='lower left',ncol=2)
    ax.set_xlim(dates[0],dates[-1])
    for spine in ax.spines.values(): spine.set_visible(False)
    fig.text(.04,.075,'Source: Yahoo Finance · Same trading dates · Historical results are not forecasts',color=navy,fontsize=10)
    fig.text(.04,.035,'UPRO targets 3× DAILY S&P 500 returns. SPY is the comparison ETF.',color=navy,fontsize=9.5)
    fig.text(.96,.035,'TRADINGNINVESTMENT.COM',ha='right',color=navy,fontsize=10)
    fig.savefig(output,dpi=100,facecolor=fig.get_facecolor())
    plt.close(fig)


def main():
    now = datetime.now(ZoneInfo('America/New_York'))
    cutoff = now.date() if (now.hour, now.minute) >= (17, 30) else now.date()-timedelta(days=1)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--through', type=lambda value: datetime.strptime(value,'%Y-%m-%d').date(), default=cutoff)
    args = parser.parse_args()
    if args.through > cutoff:
        raise SystemExit('Requested date is not a completed closing-price session yet.')
    frames = load_prices(args.through)
    through = frames['UPRO'].index[-1].date().isoformat()
    annual = {ticker: annual_payload(frame,ticker,through) for ticker,frame in frames.items()}
    adjusted = pd.DataFrame({ticker:frame['Adj Close'] for ticker,frame in frames.items()})
    price = pd.DataFrame({ticker:frame['Close'] for ticker,frame in frames.items()})
    series = {ticker:shared.calculate_drawdown_series(adjusted[ticker]) for ticker in frames}
    dd = {'dataset':'UPRO vs SPY drawdowns','asset':'UPRO','benchmark':'SPY','asset_type':'leveraged_etf','price_basis':'adjusted_close',
          'source':'Yahoo Finance','methodology':'running_peak_drawdown_on_synchronized_adjusted_close',
          'range':{'first_date':through,'last_date':through,'daily_observations':len(adjusted)},
          'asset_summary':shared.summarize_drawdown(series['UPRO']),
          'benchmark_summary':shared.summarize_drawdown(series['SPY']),'data':[]}
    dd['range']['first_date'] = adjusted.index[0].date().isoformat()
    for date in adjusted.index:
        row={'date':date.date().isoformat()}
        for key,ticker in (('asset','UPRO'),('benchmark','SPY')):
            row[key+'_adjusted_close'] = float(adjusted.loc[date,ticker])
            row[key+'_drawdown_pct'] = round(float(series[ticker].loc[date,'drawdown_pct']),6)
        dd['data'].append(row)
    returns = frames['UPRO'].resample('YE').last().pct_change().dropna()*100
    methods = {'ticker':'UPRO','data':[
        {'year':int(date.year),'price_return':float(row['Close']),'total_return':float(row['Adj Close']),
         'is_ytd':date.year==now.year,'data_through':through if date.year==now.year else f'{date.year}-12-31'}
        for date,row in returns.iterrows()]}
    periods={'asset':'UPRO','benchmark':'SPY','return_type':'price_return','price_basis':'close',
             'source':'Yahoo Finance','methodology':'Synchronized closing prices; partial periods excluded from completed-period summaries.',
             'range':dd['range'], 'daily':period_rows(price,None),'weekly':period_rows(price,'W-FRI'),
             'monthly':period_rows(price,'ME')}
    outputs={'uproAnnualReturns.json':annual['UPRO'],'uproBenchmarkAnnualReturns.json':annual['SPY'],
             'uproReturnMethods.json':methods,'uproVsSpyDrawdowns.json':dd,'uproVsSpyPeriodReturns.json':periods}
    outputs['uproVsTqqqComparison.json'] = build_comparison(frames['UPRO']['Adj Close'].copy(), through)
    # Stage every generated output before replacing any current artifact.
    with tempfile.TemporaryDirectory(dir=ROOT) as temp:
        stage=Path(temp)
        pairs=[]
        for filename,payload in outputs.items():
            file=stage/filename
            file.write_text(json.dumps(payload,indent=2,allow_nan=False)+'\n')
            pairs.append((file,ROOT/'src/data/charts'/filename))
        csvfile=stage/'upro-annual-returns.csv'
        with csvfile.open('w',newline='') as stream:
            writer=csv.DictWriter(stream,fieldnames=list(annual['UPRO']['data'][0]),lineterminator='\n')
            writer.writeheader();writer.writerows(annual['UPRO']['data'])
        pairs.append((csvfile,ROOT/'public/data'/csvfile.name))
        comparison_csv=stage/'upro-tqqq-spy-comparison.csv'
        write_comparison_csv(dd, outputs['uproVsTqqqComparison.json'], comparison_csv)
        pairs.append((comparison_csv, ROOT/'public/data'/comparison_csv.name))
        image=stage/'upro-tqqq-spy-drawdown-og.png'
        og_spec = importlib.util.spec_from_file_location('upro_three_og', ROOT/'scripts/generate-upro-three-fund-og.py')
        og_module = importlib.util.module_from_spec(og_spec)
        og_spec.loader.exec_module(og_module)
        og_module.generate(dd, outputs['uproVsTqqqComparison.json'], image)
        pairs.append((image,ROOT/'public/images/social'/image.name))
        for source,destination in pairs:
            destination.parent.mkdir(parents=True,exist_ok=True)
            os.replace(source,destination)
    print(f'PASS: UPRO and SPY returns, drawdowns, recovery, period tables and OG refreshed through {through}.')
    print(json.dumps(dd['asset_summary'],indent=2))

if __name__=='__main__':
    main()
