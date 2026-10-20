import access from './articleAccess.json'
export function isArticlePublic(path: string): boolean {
  const slug = path.replace(/^\/+|\/+$/g, '')
  const entry = (access as Record<string, {visibility: string}>)[slug]
  return !entry || entry.visibility === 'public'
}
