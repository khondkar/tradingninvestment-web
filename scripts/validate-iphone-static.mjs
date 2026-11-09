import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const html = fs.readFileSync(path.join(root,'dist/new-iphone-release-apple-stock-price-history/index.html'),'utf8')
const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'')
const text = body.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim()
function check(ok, message) { if (!ok) throw new Error(`Apple static HTML: ${message}`) }
check(text.length > 7000, 'article body missing or unexpectedly short')
for(const phrase of ['The iPhone brought the world','After the announcement','Did iPhone sales move Apple shares?','New iPhone Release and Apple Stock Performance Year Over Year','Sample average']) {
  check(text.includes(phrase), `missing visible content: ${phrase}`)
}
check(!text.includes('Loading original historical article'), 'original article is still a loading placeholder')
check(!text.includes('No verified sales observations loaded'), 'sales table has no observations')
check((body.match(/<table\b/g)||[]).length >= 3, 'research tables missing')
const dataDir=path.join(root,'public/data/iphone')
const announcements=JSON.parse(fs.readFileSync(path.join(dataDir,'announcement-events.json'),'utf8'))
const sales=JSON.parse(fs.readFileSync(path.join(dataDir,'sales-history.json'),'utf8'))
for(const row of announcements) check(text.includes(row.date) && text.includes(row.model), `missing announcement ${row.date}`)
for(const row of sales) check(text.includes(row.quarter) && text.includes(row.reportDate), `missing sales row ${row.quarter}`)
const bootstrap = html.match(/<script id="tni-iphone-initial-data" type="application\/json">([\s\S]*?)<\/script>/)
check(bootstrap,'client bootstrap missing')
const initial = JSON.parse(bootstrap[1])
check(JSON.stringify(initial.announcements)===JSON.stringify(announcements),'client announcement data differs')
check(JSON.stringify(initial.sales)===JSON.stringify(sales),'client sales data differs')
check(initial.originalHtml===fs.readFileSync(path.join(dataDir,'original-2017.html'),'utf8'),'client original article differs')
const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]))
check(schemas.some(s=>s['@type']==='Article' && s.author?.name==='Kamal Khondkar'),'Article author metadata missing')
check(/<a\b[^>]*rel="author"[^>]*>Kamal Khondkar<\/a>/.test(body),'visible author missing')
check(html.includes('id="tni-iphone-static-css"'),'initial article CSS missing')
for(const tag of html.match(/<meta\b[^>]*>/gi)||[]) {
  if (/name=["'](?:robots|googlebot|bingbot)["']/i.test(tag)) check(!/noindex/i.test(tag),'indexing disabled')
}
check(html.includes('href="https://tradingninvestment.com/new-iphone-release-apple-stock-price-history/"'),'canonical missing')
console.log(`PASS: Apple HTML has ${text.length.toLocaleString()} visible characters, ${announcements.length} announcement rows, ${sales.length} sales rows, original article, author metadata and populated client data.`)
