import raw from './funded-metrics.json'
export type Metric = { value: string; source: string }
export type Research = { plan: string; checkedAt: string; metrics: Record<string, Metric> }
export const research: Record<string, Research> = raw
export const metricGroups = [
 { title: 'Pricing & account sizes', id: 'pricing', fields: [['sizes','Account sizes'],['fee','Evaluation / entry fee'],['activation','Activation fee'],['reset','Reset fee'],['refund','Fee refund'],['data','Market data fees']] },
 { title: 'Evaluation & risk limits', id: 'evaluation', fields: [['evaluation','Evaluation type'],['target','Profit targets'],['drawdown','Drawdown type'],['maxLoss','Maximum loss'],['dailyLoss','Daily loss limit'],['days','Minimum trading days'],['consistency','Consistency rule']] },
 { title: 'Profit share & payouts', id: 'payouts', fields: [['split','Trader profit share'],['payout','Payout frequency / eligibility'],['payoutLimits','Payout limits & buffer']] },
 { title: 'Platforms & trading rules', id: 'rules', fields: [['platforms','Trading platforms'],['contracts','Contract limits'],['leverage','Leverage'],['news','News trading'],['holding','Overnight / weekend'],['restrictions','Other trading restrictions'],['account','Account environment']] },
 { title: 'Company & eligibility', id: 'company', fields: [['established','Established'],['headquarters','Headquarters'],['us','US trader eligibility'],['countries','Country restrictions'],['rating','Independent review rating']] },
] as const
export const allFields = metricGroups.flatMap(g=>[...g.fields])
export const summaryFields = [['sizes','Account sizes'],['fee','Evaluation / entry fee'],['split','Profit share'],['drawdown','Drawdown type'],['evaluation','Evaluation'],['rating','Review rating']] as const
export function getMetric(id: string, key: string) {return research[id]?.metrics[key]}
export function baseSplit(id: string) {return Number(getMetric(id,'split')?.value.match(/^(\d+)%/)?.[1]??NaN)}
export function matchesSize(id: string, size: string) {return !size || (getMetric(id,'sizes')?.value.match(/\$[\d.]+[KM]/g)??[] as string[]).some(s=>s===size)}
export function usdFee(id: string) {return Number(getMetric(id,'fee')?.value.match(/^(?:From |Approx\. )?\$([\d,.]+)/)?.[1]?.replaceAll(',','')??NaN)}
