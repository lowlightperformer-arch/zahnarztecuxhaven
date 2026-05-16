import Image from 'next/image'
import Link from 'next/link'

import Header from '@/components/Header'
import { normalizeExcerpt } from '@/lib/blog'
import { readDb } from '@/lib/db'

export const metadata = {
  title: 'Zahnmedizinischer Ratgeber - Cuxhaven',
  description: 'Aktuelle Ratgeber und Fachwissen rund um Zahngesundheit in Cuxhaven.',
}

export default async function RatgeberPage() {
  const db = await readDb()

  const posts = db.posts
    .filter((post) => post.status === 'published')
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  return (
    <div className="min-h-screen bg-light-bg">
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <div className="mb-8 rounded-3xl border border-primary-blue/10 bg-white p-8 shadow-[0_16px_42px_rgba(18,58,99,0.06)]">
          <h1 className="text-3xl font-bold tracking-tight text-primary-blue sm:text-4xl">Ratgeber</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Tipps, Fachwissen und lokale Informationen für Zahngesundheit in Cuxhaven.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-primary-blue/10 bg-white shadow-[0_12px_32px_rgba(18,58,99,0.06)]"
              >
                <div className="relative aspect-video bg-light-bg">
                  {post.image ? (
                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">16:9</div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-semibold text-primary-blue">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{normalizeExcerpt(post)}</p>
                  <Link
                    href={`/ratgeber/${post.slug}`}
                    className="mt-4 inline-flex items-center rounded-xl bg-primary-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-blue/90"
                  >
                    Weiterlesen
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary-blue/20 bg-white px-6 py-10 text-sm text-slate-600">
            Aktuell sind noch keine veröffentlichten Ratgeber-Artikel vorhanden.
          </div>
        )}
      </section>
    </div>
  )
}
