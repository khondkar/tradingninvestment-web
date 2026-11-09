#!/usr/bin/env python3
"""UPRO/TQQQ/SPY OG card from the article's existing synchronized data."""
from pathlib import Path
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
from matplotlib.ticker import PercentFormatter

ROOT=Path(__file__).resolve().parents[1]

def chart_data(dd,pair):
    if dd['range']['last_date'] != pair['through']:
        raise RuntimeError('Article comparison dates differ; refresh data before creating OG.')
    a=pd.DataFrame(dd['data']).set_index('date')
    b=pd.DataFrame(pair['data']).set_index('date')
    a=a.loc[b.index[0]:]
    if not a.index.equals(b.index):raise RuntimeError('Common trading dates do not match.')
    if not np.allclose(a.asset_adjusted_close,b.upro,rtol=1e-5,atol=1e-5):
        raise RuntimeError('UPRO prices differ across datasets; refresh all research data together.')
    prices=pd.DataFrame({'UPRO':a.asset_adjusted_close,'TQQQ':b.tqqq,'SPY':a.benchmark_adjusted_close})
    if not np.isfinite(prices.to_numpy()).all() or (prices<=0).any().any():raise RuntimeError('Invalid prices')
    prices.index=pd.to_datetime(prices.index)
    drawdowns=(prices/prices.cummax()-1)*100
    stats={}
    for ticker in prices:
        trough=drawdowns[ticker].idxmin()
        peak=prices[ticker].loc[:trough].idxmax()
        recovered=prices[ticker].loc[prices.index>trough]
        recovered=recovered[recovered>=prices[ticker].loc[peak]]
        recovery=recovered.index[0] if len(recovered) else None
        stats[ticker]={'return':(prices[ticker].iloc[-1]/prices[ticker].iloc[0]-1)*100,
                       'drawdown':drawdowns[ticker].min(),
                       'recovery_days':(recovery-trough).days if recovery is not None else None}
    return prices,drawdowns,stats

def generate(dd,pair,output):
    prices,drawdowns,stats=chart_data(dd,pair)
    colors={'UPRO':'#075ac8','TQQQ':'#ba263e','SPY':'#067047'}
    navy='#10233f';bg='#f4f7fb'
    plt.rcParams.update({'font.weight':'bold','axes.labelweight':'bold','font.size':11})
    fig=plt.figure(figsize=(12,6.3),dpi=100,facecolor=bg)
    fig.text(.035,.948,'TNI ETF INTELLIGENCE',color='#075ac8',fontsize=12,weight='bold')
    fig.text(.035,.883,'UPRO vs TQQQ vs SPY',color=navy,fontsize=29,weight='bold')
    fig.text(.035,.835,'Historical returns, drawdowns & recovery',color=navy,fontsize=17,weight='bold')
    fig.text(.965,.946,f"{prices.index[0].date()} to {prices.index[-1].date()}",ha='right',fontsize=11,color=navy)
    for i,(ticker,s) in enumerate(stats.items()):
        x=.035+i*.315
        fig.add_artist(FancyBboxPatch((x,.607),.3,.195,boxstyle='round,pad=0.006,rounding_size=0.012',transform=fig.transFigure,facecolor='white',edgecolor='#bdcbdc',linewidth=1))
        fig.text(x+.013,.766,ticker,color=colors[ticker],fontsize=17,weight='bold')
        for yy,label,value in [(.721,'Total return',f"{s['return']:+,.1f}%"),(.676,'Max drawdown',f"{s['drawdown']:.1f}%"),(.631,'Low to recovery',f"{s['recovery_days']:,} days" if s['recovery_days'] is not None else 'Not recovered')]:
            fig.text(x+.013,yy,label,color=navy,fontsize=11)
            fig.text(x+.286,yy,value,color=colors[ticker],fontsize=12,ha='right')
    fig.text(.035,.565,'DRAWDOWN FROM PREVIOUS PEAK',color=navy,fontsize=11)
    ax=fig.add_axes([.075,.172,.89,.355],facecolor='white')
    for ticker in prices:ax.plot(prices.index,drawdowns[ticker],color=colors[ticker],lw=2.2,label=ticker)
    ax.yaxis.set_major_formatter(PercentFormatter(100,decimals=0))
    ax.set_ylim(min(-10,float(drawdowns.min().min())*1.08),2)
    ax.set_xlim(prices.index[0],prices.index[-1])
    ax.grid(axis='y',color='#c9d3e0',lw=.7)
    ax.tick_params(colors=navy,labelsize=11,length=0,pad=7)
    for spine in ax.spines.values():spine.set_visible(False)
    legend=ax.legend(loc='lower left',ncol=3,frameon=True,facecolor='white',framealpha=1,fontsize=10)
    legend.get_frame().set_edgecolor('white')
    fig.text(.035,.086,'Same dates · Adjusted-close returns · Recovery measured in calendar days',color=navy,fontsize=10)
    fig.text(.035,.044,'Source: Yahoo Finance · Past performance is not predictive',color=navy,fontsize=9.5)
    fig.text(.965,.044,'TRADINGNINVESTMENT.COM',ha='right',color=navy,fontsize=10)
    output=Path(output);output.parent.mkdir(parents=True,exist_ok=True)
    fig.savefig(output,dpi=100,facecolor=bg);plt.close(fig)
    print(f'Created three-fund OG: {output.name} | through {prices.index[-1].date()}')
    return stats

if __name__=='__main__':
    dd=json.loads((ROOT/'src/data/charts/uproVsSpyDrawdowns.json').read_text())
    pair=json.loads((ROOT/'src/data/charts/uproVsTqqqComparison.json').read_text())
    generate(dd,pair,ROOT/'public/images/social/upro-tqqq-spy-drawdown-og.png')
