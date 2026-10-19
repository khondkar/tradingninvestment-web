// Keep full-resolution research/social images; produce homepage-only derivatives.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, 'public/images/home-thumbnails')
fs.mkdirSync(out, { recursive: true })
for (const [name, source, widths] of [
  ['spy-doji', 'images/social/research/doji-candlestick-spy-26-year-study-tni-og.png', [480, 960]],
  ['market-history', 'images/social/average-stock-market-return-og.png', [480, 960]],
  ['sorbonne', 'images/citations/sorbonne.png', [160]],
]) {
  for (const width of widths) {
    await sharp(path.join(root, 'public', source)).resize({ width, withoutEnlargement: true })
      .webp({ quality: 85, effort: 5 }).toFile(path.join(out, `${name}-${width}.webp`))
  }
}
console.log('TNI responsive homepage thumbnails generated; original images preserved')
