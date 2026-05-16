import { readDb } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Header from '@/components/Header'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const db = await readDb()
  const page = db.pages?.find(p => p.slug === slug)

  if (!page) return {}

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
    alternates: {
      canonical: `/${slug}`,
      languages: {
        'de-DE': `/${slug}`,
        'x-default': `/${slug}`,
      },
    },
  }
}

export default async function DynamicRoutePage({ params }: PageProps) {
  const { slug } = await params
  
  // Prevent conflicts with reserved routes
  const reservedSlugs = ['admin', 'ratgeber', 'clinics', 'kategorien', 'api']
  if (reservedSlugs.includes(slug)) {
    notFound()
  }

  const db = await readDb()
  const page = db.pages?.find(p => p.slug === slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-12 pb-24 max-w-4xl">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-blue transition-colors mb-12 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Zurück zur Startseite</span>
          </Link>

          <article>
            <header className="mb-12">
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {page.title}
              </h1>
              <div className="h-1.5 w-24 bg-accent-blue mt-8 rounded-full" />
            </header>

            <div 
              className="prose prose-slate prose-lg max-w-none 
                prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
                prose-a:text-accent-blue prose-a:no-underline hover:prose-a:underline
                prose-strong:text-slate-900
                prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-slate-100"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </article>
        </div>
      </main>
    </div>
  )
}
