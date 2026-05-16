import { MetadataRoute } from 'next'
import { readDb } from '@/lib/db'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const db = await readDb()
  const settings = db.siteSettings
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zahnaerzte-cuxhaven.de'

  // If custom robots.txt is provided, we can't easily parse it into the Robots object 
  // without a complex parser, but Next.js robots.ts expects a structured object.
  // Most users just want simple Allow/Disallow.
  
  if (settings?.robotsTxt) {
    // Basic support for custom rules: This is a simplification.
    // For full custom robots.txt, one might use a custom route at /robots.txt
    // But for this project, we'll map the common "User-agent: *" use case.
    return {
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
