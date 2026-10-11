import "./ResearchDiscovery.css"
import ResearchExperience from './ResearchExperience'
import { getItemHubs, getRelatedItems, researchItems, type ResearchHub } from '../../research/discovery'

export function ResearchHubPage({ hub }: { hub: ResearchHub }) {
  return <ResearchExperience key={hub.path} hub={hub} />
}

export function ResearchConnections({ path }: { path: string }) {
  const item = researchItems.find((candidate) => candidate.path === path)
  if (!item) return null
  const hubs = getItemHubs(item)
  const related = getRelatedItems(item)
  return <aside className="research-connections" aria-label="Explore related research">
    <span className="research-kicker">CONTINUE EXPLORING</span>
    <h2>Follow the research</h2>
    <nav className="research-connection-hubs" aria-label="Research topics">
      <a href="/research/">All research</a>
      {hubs.map((hub) => <a href={hub.path} key={hub.path}>{hub.title}</a>)}
    </nav>
    {related.length > 0 && <div className="research-related-grid">
      {related.map((candidate) => <a href={candidate.path} key={candidate.path}><small>RELATED STUDY</small><strong>{candidate.title}</strong><span>Explore ↗</span></a>)}
    </div>}
  </aside>
}

export function ResearchTrail({ path }: { path: string }) {
  const item = researchItems.find((candidate) => candidate.path === path)
  if (!item) return null
  const primary = getItemHubs(item)[0]
  return <nav className="research-article-trail" aria-label="Breadcrumb">
    <a href="/research/">Research</a><span>›</span>
    <a href={item.categories.includes('stock') ? '/research/stocks/' : '/research/indexes/'}>{item.categories.includes('stock') ? 'Stocks' : 'Indexes'}</a><span>›</span>
    {primary && <><a href={primary.path}>{primary.title}</a><span>›</span></>}
    <strong>{item.title}</strong>
  </nav>
}
