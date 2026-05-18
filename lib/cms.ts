export type CategoryType = 'district' | 'general' | 'service'
export type PostStatus = 'draft' | 'published'

export interface Category {
  id: string
  name: string
  slug: string
  type: CategoryType
  h1: string
  description: string
  metaTitle: string
  metaDescription: string
}

export interface CmsClinic {
  id: string
  name: string
  slug?: string
  description?: string
  phone?: string
  email?: string
  rating?: number
  reviewsCount?: number
  imageUrl?: string
  googleMapsUrl?: string
  categoryIds?: string[]
  specialization?: string
  address?: string
  leadDoctor?: string
  doctorAvatar?: string
}

export interface PublicClinic extends CmsClinic {
  categories: Category[]
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  image: string
  status: PostStatus
  createdAt: string
  metaTitle: string
  metaDescription: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface HomepageConfig {
  h1?: string
  metaTitle?: string
  metaDescription?: string
  bottomSeoText: string
  faq: FaqItem[]
}

export interface StaticPage {
  id: string
  title: string
  slug: string
  content: string
  metaTitle: string
  metaDescription: string
  createdAt: string
  updatedAt: string
}

export interface CmsDb {
  categories: Category[]
  clinics: CmsClinic[]
  posts: BlogPost[]
  homepageConfig?: HomepageConfig
  pages: StaticPage[]
  siteSettings?: SiteSettings
}

export interface SiteSettings {
  gaId?: string
  facebookUrl?: string
  aboutUsSlug?: string
  gscMetaTag?: string
  email?: string
  generalEmail?: string
  robotsTxt?: string
}

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  district: 'Districts',
  general: 'General',
  service: 'Services',
}

export const CATEGORY_TYPE_DE_LABELS: Record<CategoryType, string> = {
  district: 'Stadtteile',
  general: 'Allgemein',
  service: 'Leistungen',
}
