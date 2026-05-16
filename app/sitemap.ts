import { MetadataRoute } from 'next'
import { readDb } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await readDb()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zahnaerzte-cuxhaven.de'

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/ratgeber`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // 2. Dynamic CMS Pages (e.g., /uber-uns, /impressum)
  const cmsPages: MetadataRoute.Sitemap = (db.pages || []).map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: new Date(page.updatedAt || page.createdAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // 3. Category Pages
  const categoryPages: MetadataRoute.Sitemap = (db.categories || []).map((cat) => ({
    url: `${siteUrl}/kategorien/${cat.slug}`, // Based on app/kategorien/[slug]/page.tsx
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...cmsPages, ...categoryPages]
}
