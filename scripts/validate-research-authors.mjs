import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
let articles = 0

function inspect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      inspect(file)
      continue
    }
    if (entry.name !== 'index.html') continue

    const html = fs.readFileSync(file, 'utf8')
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]))
    const article = schemas.find((schema) => schema['@type'] === 'Article')
    if (!article) continue

    articles += 1
    const author = article.author
    const visibleAuthor = /<a\b[^>]*\brel="author"[^>]*>\s*([^<]+)\s*<\/a>/i.exec(html)
    if (
      author?.['@type'] !== 'Person' ||
      !author.name?.trim() ||
      !author.url?.trim() ||
      !visibleAuthor ||
      visibleAuthor[1].trim() !== author.name
    ) {
      throw new Error(`${path.relative(dist, file)}: a matching visible author and Article author metadata are required to publish research.`)
    }
  }
}

inspect(dist)
if (articles === 0) throw new Error('No research articles found for author validation.')
console.log(`TNI author validation passed: ${articles} published research articles.`)
