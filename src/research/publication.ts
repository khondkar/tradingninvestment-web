import settings from './publication-settings.json'
import generatedImages from './generated/publication-images.json'

export type HomepagePlacement = 'none' | 'regular' | 'featured'
export type PublicationOptions = { homepagePlacement?: HomepagePlacement; image?: string }
export const publicationSettings = settings as Record<string, PublicationOptions>
export const publicationImages = generatedImages as Record<string, string>
export const getHomepagePlacement = (path: string): HomepagePlacement =>
  publicationSettings[path]?.homepagePlacement || 'none'
export const defaultResearchImage = (slug: string) =>
  `/images/social/research/${encodeURIComponent(slug)}-tni-og.png`
export const getPublicationImage = (path: string, slug: string, source?: string) =>
  publicationImages[path] || publicationSettings[path]?.image || source || defaultResearchImage(slug)
