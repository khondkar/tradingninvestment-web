import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const xml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[character]))
export function localImage(publicDir, url) {
  if (!url) return null
  let value = url
  if (/^https?:/.test(value)) {
    const parsed = new URL(value)
    if (!['tradingninvestment.com', 'www.tradingninvestment.com'].includes(parsed.hostname)) return null
    value = parsed.pathname
  }
  if (!value.startsWith('/') || value.startsWith('//') || /[?#]/.test(value)) return null
  const target = path.resolve(publicDir, '.' + decodeURIComponent(value))
  return target.startsWith(path.resolve(publicDir) + path.sep) ? target : null
}
export function identitySvg(item) {
  const words = String(item.title).trim().split(/\s+/)
  const lines = []; let line = ''
  for (const word of words) {
    if (line && (line + ' ' + word).length > 37) { lines.push(line); line = word }
    else line += (line ? ' ' : '') + word
  }
  if (line) lines.push(line)
  const size = Math.min(52, Math.floor(280 / Math.max(1, lines.length) / 1.22))
  const gap = size * 1.22
  const name = item.symbol ? `${item.name} / ${item.symbol}` : item.name
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f6f7f0"/><rect x="0" width="14" height="630" fill="#92794e"/><text x="76" y="92" font-family="Georgia,serif" font-size="51" font-weight="bold" fill="#273c32">TNI</text><text x="186" y="83" font-family="Arial,sans-serif" font-size="17" letter-spacing="3" fill="#92794e">TRADINGNINVESTMENT</text><line x1="76" y1="126" x2="1124" y2="126" stroke="#d4d9cb"/><text x="76" y="174" font-family="Arial,sans-serif" font-size="17" letter-spacing="1.5" fill="#657360">${xml(name.slice(0,110))}</text>${lines.map((text,i)=>`<text x="76" y="${240+i*gap}" font-family="Georgia,serif" font-size="${size}" fill="#273c32">${xml(text)}</text>`).join('')}<line x1="76" y1="539" x2="1124" y2="539" stroke="#d4d9cb"/><text x="76" y="584" font-family="Arial,sans-serif" font-size="18" fill="#92794e">DATA → EVIDENCE → RESEARCH → DECISION</text><text x="1124" y="584" text-anchor="end" font-family="Arial,sans-serif" font-size="15" fill="#657360">ORIGINAL RESEARCH</text></svg>`
}
export async function generatePublicationAssets(root, items, settings) {
  const publicDir = path.join(root, 'public'); const mapping = {}; const actions = []
  const slugs = new Set()
  for (const item of items) {
    if (!/^[a-zA-Z0-9_-]+$/.test(item.slug) || slugs.has(item.slug)) throw new Error(`Invalid or duplicate image slug: ${item.slug}`)
    slugs.add(item.slug)
    const configured = settings[item.path]?.image
    const source = configured || item.sourceImage
    const filename = localImage(publicDir, source)
    if (configured && (!filename || !fs.existsSync(filename))) throw new Error(`Selected OG image does not exist locally: ${item.path}: ${configured}`)
    let usable = false
    if (filename && fs.existsSync(filename)) {
      try { const m = await sharp(filename).metadata(); usable = Boolean(m.width && m.height) } catch { if (configured) throw new Error(`Cannot decode selected image: ${configured}`) }
    }
    const targetUrl = `/images/social/research/${item.slug}-tni-og.png`
    const target = localImage(publicDir, targetUrl)
    if (usable && /\.(png|jpe?g|webp)$/i.test(filename)) {
      mapping[item.path] = '/' + path.relative(publicDir, filename).split(path.sep).join('/')
      actions.push({ path: item.path, action: 'reused', image: mapping[item.path] })
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true })
      if (usable) await sharp(filename).resize(1200,630,{fit:'contain',background:'#f6f7f0'}).png().toFile(target)
      else await sharp(Buffer.from(identitySvg(item))).png().toFile(target)
      mapping[item.path] = targetUrl
      actions.push({ path: item.path, action: usable ? 'converted to PNG' : 'created TNI title image', image: targetUrl })
    }
  }
  return { mapping, actions }
}
