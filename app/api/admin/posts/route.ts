import { NextResponse } from 'next/server'

import { createSlug, normalizePostStatus } from '@/lib/blog'
import { readDb, writeDb } from '@/lib/db'
import type { BlogPost } from '@/lib/cms'

type PostInput = Partial<BlogPost>

type AdminPostsPayload = {
  mode?: 'create' | 'update' | 'delete' | 'bulk'
  post?: PostInput
  posts?: PostInput[]
  id?: string
}

function normalizePostInput(input: PostInput, existing?: BlogPost): BlogPost {
  const title = input.title?.trim() || existing?.title || ''
  const content = input.content?.trim() || existing?.content || ''

  if (!title || !content) {
    throw new Error('Titel und Inhalt sind erforderlich.')
  }

  const slug = createSlug(input.slug?.trim() || title)
  if (!slug) {
    throw new Error('Slug konnte nicht erzeugt werden.')
  }

  const nowIso = new Date().toISOString()

  return {
    id: existing?.id || input.id?.trim() || `post-${crypto.randomUUID()}`,
    title,
    slug,
    content,
    excerpt: input.excerpt?.trim() || existing?.excerpt || '',
    image: input.image?.trim() || existing?.image || '',
    status: normalizePostStatus(input.status || existing?.status || 'draft'),
    createdAt: existing?.createdAt || input.createdAt || nowIso,
    metaTitle: input.metaTitle?.trim() || title,
    metaDescription: input.metaDescription?.trim() || input.excerpt?.trim() || existing?.metaDescription || '',
  }
}

function assertUniqueSlug(posts: BlogPost[], candidate: BlogPost) {
  const duplicate = posts.find((post) => post.slug === candidate.slug && post.id !== candidate.id)
  if (duplicate) {
    throw new Error('Slug bereits vorhanden.')
  }
}

export async function GET() {
  const db = await readDb()

  const posts = db.posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
  let payload: AdminPostsPayload

  try {
    payload = (await request.json()) as AdminPostsPayload
  } catch {
    return NextResponse.json({ message: 'Ungültiges JSON.' }, { status: 400 })
  }

  const mode = payload.mode ?? 'create'
  const db = await readDb()

  try {
    if (mode === 'bulk') {
      const source = Array.isArray(payload.posts) ? payload.posts : []
      if (source.length === 0) {
        return NextResponse.json({ message: 'Keine Posts für Bulk-Import übergeben.' }, { status: 400 })
      }

      const upserted: BlogPost[] = []

      for (const input of source) {
        const existingIndex = db.posts.findIndex((post) => post.id === input.id)
        const existing = existingIndex >= 0 ? db.posts[existingIndex] : undefined
        const normalized = normalizePostInput(input, existing)

        assertUniqueSlug(db.posts, normalized)

        if (existingIndex >= 0) {
          db.posts[existingIndex] = normalized
        } else {
          db.posts.unshift(normalized)
        }

        upserted.push(normalized)
      }

      await writeDb(db)
      return NextResponse.json({ posts: upserted, count: upserted.length })
    }

    if (mode === 'delete') {
      const id = payload.id?.trim() || payload.post?.id?.trim()
      if (!id) {
        return NextResponse.json({ message: 'Post-ID fehlt.' }, { status: 400 })
      }

      const exists = db.posts.some((post) => post.id === id)
      if (!exists) {
        return NextResponse.json({ message: 'Post nicht gefunden.' }, { status: 404 })
      }

      db.posts = db.posts.filter((post) => post.id !== id)
      await writeDb(db)
      return NextResponse.json({ ok: true })
    }

    const input = payload.post
    if (!input) {
      return NextResponse.json({ message: 'Post-Daten fehlen.' }, { status: 400 })
    }

    if (mode === 'update') {
      const id = input.id?.trim()
      if (!id) {
        return NextResponse.json({ message: 'Post-ID fehlt.' }, { status: 400 })
      }

      const index = db.posts.findIndex((post) => post.id === id)
      if (index === -1) {
        return NextResponse.json({ message: 'Post nicht gefunden.' }, { status: 404 })
      }

      const updated = normalizePostInput(input, db.posts[index])
      assertUniqueSlug(db.posts, updated)
      db.posts[index] = updated
      await writeDb(db)
      return NextResponse.json({ post: updated })
    }

    const created = normalizePostInput(input)
    assertUniqueSlug(db.posts, created)
    db.posts.unshift(created)
    await writeDb(db)

    return NextResponse.json({ post: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Post konnte nicht gespeichert werden.' },
      { status: 400 },
    )
  }
}
