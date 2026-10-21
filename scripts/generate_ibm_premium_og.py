#!/usr/bin/env python3
"""Generate IBM Nike-layout 1200x630 OG from TNI local JSON datasets.
Run from tradingninvestment-web repository root.
IBM version of the existing TNI premium performance card.
"""
import json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
from PIL import Image

ROOT=Path.cwd()
IBM=ROOT/'src/data/charts/ibmReturnMethods.json'
SP=ROOT/'src/data/sp500-historical-return-methods.json'
DD=ROOT/'src/data/charts/ibmVsSp500Drawdowns.json'
OUT=ROOT/'public/images/social/ibm-stock-premium-og.png'
for p in (IBM,SP,DD):
    if not p.is_file(): raise SystemExit(f'Missing dataset: {p}')
j=json.loads(IBM.read_text()); s=json.loads(SP.read_text()); d=json.loads(DD.read_text())
jrows={int(r['year']):r for r in j['data'] if isinstance(r.get('total_return'),(int,float))}
srows={int(r['year']):r for r in s['data'] if isinstance(r.get('total_return'),(int,float))}
years=sorted(y for y in jrows.keys() & srows.keys() if not jrows[y].get('is_ytd') and not srows[y].get('is_ytd'))
if len(years)<10: raise SystemExit('Insufficient matched complete years')
jret=np.array([jrows[y]['total_return'] for y in years],dtype=float)
sret=np.array([srows[y]['total_return'] for y in years],dtype=float)
if np.any(jret<=-100) or np.any(sret<=-100): raise SystemExit('Invalid total return <= -100%')
# Annual compounded points; no fabricated daily interpolation.
jgrowth=(np.cumprod(1+jret/100)-1)*100
sgrowth=(np.cumprod(1+sret/100)-1)*100
jytd=next((r for r in j['data'] if r.get('is_ytd')),None)
sytd=next((r for r in s['data'] if r.get('is_ytd')),None)
if not jytd or not sytd: raise SystemExit('Missing current-year YTD observations')
navy='#10233f'; muted='#607493'; blue='#0968ee'; red='#ed283b'; green='#009765'; bg='#f6f9fd'; border='#d6e3f3'
fig=plt.figure(figsize=(12,6.3),dpi=100,facecolor=bg)
fig.text(.038,.925,'TNI STOCK INTELLIGENCE',color=blue,fontsize=13.5,fontweight='bold')
fig.text(.038,.874,'IBM (IBM) vs. S&P 500',color=navy,fontsize=22.5,fontweight='bold')
fig.text(.038,.822,f'Total returns with dividends reinvested  ·  {years[0]}–{jytd["year"]} YTD',color=muted,fontsize=11)
fig.text(.755,.928,'IBM  ·  IBM',color=navy,fontsize=9,fontweight='bold')
fig.text(.755,.890,'STOCK PERFORMANCE',color=muted,fontsize=7)
# Place genuine optional branding assets only when user provides local files.
logo=ROOT/'public/images/brands/ibm-logo.png'
if logo.is_file():
    axlogo=fig.add_axes([.87,.852,.12,.105]); axlogo.imshow(Image.open(logo));axlogo.axis('off')
photo=ROOT/'public/images/brands/ibm-270-park-avenue.jpg'
if photo.is_file():
    axphoto=fig.add_axes([.91,.855,.075,.105]);axphoto.imshow(Image.open(photo));axphoto.axis('off')

def card(x,title,left,right,ly,ry):
    fig.add_artist(FancyBboxPatch((x,.604),.235,.178,boxstyle='round,pad=0.005,rounding_size=0.016',transform=fig.transFigure,facecolor='white',edgecolor=border,linewidth=.8))
    fig.text(x+.014,.754,title,color=muted,fontsize=7.4,fontweight='bold')
    fig.text(x+.014,.724,'IBM',color=navy,fontsize=7.4,fontweight='bold')
    fig.text(x+.13,.724,'S&P 500',color=navy,fontsize=7.4,fontweight='bold')
    fig.add_artist(plt.Line2D([x+.119,x+.119],[.63,.718],transform=fig.transFigure,color=border,lw=1))
    fig.text(x+.014,.668,f'{left:+.2f}%',color=green if left>=0 else red,fontsize=14.3,fontweight='bold')
    fig.text(x+.13,.668,f'{right:+.2f}%',color=green if right>=0 else red,fontsize=14.3,fontweight='bold')
    fig.text(x+.014,.632,ly,color=muted,fontsize=6.6)
    fig.text(x+.13,.632,ry,color=muted,fontsize=6.6)

xs=[.032,.274,.516,.758]
card(xs[0],'AVG. ANNUAL RETURN',jret.mean(),sret.mean(),f'{years[0]}–{years[-1]}',f'{years[0]}–{years[-1]}')
ib=int(np.argmax(jret));isb=int(np.argmax(sret))
card(xs[1],'BEST ANNUAL RETURN',jret[ib],sret[isb],str(years[ib]),str(years[isb]))
ad=d['asset_summary'];bd=d['benchmark_summary']
card(xs[2],'MAX. DRAWDOWN',ad['max_drawdown_pct'],bd['max_drawdown_pct'],ad['peak_date'][:7]+' → '+ad['trough_date'][:7],bd['peak_date'][:7]+' → '+bd['trough_date'][:7])
card(xs[3],f'{jytd["year"]} YTD RETURN',float(jytd['total_return']),float(sytd['total_return']),f'Through {jytd["data_through"][5:]}',f'Through {sytd["data_through"][5:]}')
fig.add_artist(FancyBboxPatch((.025,.10),.95,.482,boxstyle='round,pad=0.004,rounding_size=0.015',transform=fig.transFigure,facecolor='white',edgecolor=border,linewidth=.9,zorder=0))
fig.text(.048,.55,'Cumulative Total Return (Dividends Reinvested)',color=navy,fontsize=10.2,fontweight='bold')
ax=fig.add_axes([.082,.175,.856,.305],facecolor='white')
ax.plot(years,jgrowth,color=blue,lw=2,label='IBM (IBM)')
ax.plot(years,sgrowth,color=red,lw=1.8,label='S&P 500')
ax.axhline(0,color='#d4dfec',lw=.8)
ax.grid(True,color='#d8e5f4',linewidth=.55)
ax.set_xlim(years[0]-.5,years[-1]+.5)
ax.tick_params(axis='both',colors=muted,labelsize=8,length=0,pad=8)
ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v,pos:f'{v:,.0f}%'))
for spine in ax.spines.values(): spine.set_visible(False)
ax.legend(loc='upper left',frameon=False,ncol=2,fontsize=8,bbox_to_anchor=(0,1.05))
fig.text(.038,.070,f'{years[0]}–{years[-1]} completed years  ·  {jytd["year"]} YTD through {jytd["data_through"]} (IBM) / {sytd["data_through"]} (S&P 500)  ·  Annual total-return compounding',fontsize=6.8,color=muted)
fig.text(.038,.043,'Source: Yahoo Finance IBM adjusted close; TNI S&P 500 total-return series  ·  Drawdowns: IBM adjusted close vs. S&P 500 price index  ·  Past performance is not predictive',fontsize=6.4,color=muted)
fig.text(.815,.044,'TRADINGNINVESTMENT.COM',fontsize=7.5,color=navy,fontweight='bold')
OUT.parent.mkdir(parents=True,exist_ok=True)
fig.savefig(OUT,dpi=100,facecolor=bg)
plt.close(fig)
print(f'Created: {OUT} (1200x630)')
print(f'Matched completed years: {years[0]}–{years[-1]} ({len(years)})')
print(f'Average total returns: IBM {jret.mean():.2f}% | S&P 500 {sret.mean():.2f}%')
print('NOTE: Cumulative chart uses annual observations; drawdowns use different price bases.')
