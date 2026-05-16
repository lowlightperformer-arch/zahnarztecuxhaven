import { NextResponse } from 'next/server'

import { readDb } from '@/lib/db'

export async function GET() {
  const db = await readDb()

  const posts = db.posts
    .filter((post) => post.status === 'published')
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  return NextResponse.json({ posts })
}
