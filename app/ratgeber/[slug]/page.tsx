import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Header from '@/components/Header'
import { contentToHtml, normalizeExcerpt } from '@/lib/blog'
import { readDb } from '@/lib/db'

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const db = await readDb()
  const post = db.posts.find((entry) => entry.slug === slug && entry.status === 'published')

  if (!post) {
    return {
      title: 'Beitrag nicht gefunden | Zahnärzte Cuxhaven',
      description: 'Der gewünschte Blogbeitrag konnte nicht gefunden werden.',
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || normalizeExcerpt(post),
  }
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params
  const db = await readDb()

  const post = db.posts.find((entry) => entry.slug === slug && entry.status === 'published')

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <Header />

      <article className="py-10 sm:py-14">
        <nav className="mb-5 text-sm text-slate-500">
          <Link href="/" className="hover:text-primary-blue">
            Startseite
          </Link>
          <span className="mx-2">&gt;</span>
          <Link href="/ratgeber" className="hover:text-primary-blue">
            Ratgeber
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="font-medium text-primary-blue">{post.title}</span>
        </nav>

        <div className="overflow-hidden rounded-3xl border border-primary-blue/10 bg-white shadow-[0_16px_42px_rgba(18,58,99,0.06)]">
          <div className="relative aspect-[16/7] bg-light-bg">
            {post.image ? (
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Titelbild</div>
            )}
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold tracking-tight text-primary-blue sm:text-4xl">{post.title}</h1>
            <p className="mt-3 text-sm text-slate-500">
              {new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(new Date(post.createdAt))}
            </p>

            <div
              className="prose prose-slate mt-8 max-w-none prose-headings:text-primary-blue prose-a:text-accent-blue"
              dangerouslySetInnerHTML={{ __html: contentToHtml(post.content) }}
            />
          </div>
        </div>
      </article>
    </div>
  )
}
