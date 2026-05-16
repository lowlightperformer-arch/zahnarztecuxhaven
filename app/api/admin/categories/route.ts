import { NextResponse } from 'next/server'

import { readDb, writeDb } from '@/lib/db'
import type { Category, CategoryType } from '@/lib/cms'

function normalizeType(value: string): CategoryType {
  if (value === 'district' || value === 'general' || value === 'service') {
    return value
  }

  return 'general'
}

export async function GET() {
  const db = await readDb()
  return NextResponse.json({ categories: db.categories })
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<Category>

  const name = payload.name?.trim() ?? ''
  const slug = payload.slug?.trim() ?? ''

  if (!name || !slug) {
    return NextResponse.json({ message: 'Name und Slug sind erforderlich.' }, { status: 400 })
  }

  const db = await readDb()

  if (db.categories.some((category) => category.slug === slug)) {
    return NextResponse.json({ message: 'Slug bereits vorhanden.' }, { status: 409 })
  }

  const category: Category = {
    id: `cat-${crypto.randomUUID()}`,
    name,
    slug,
    type: normalizeType(payload.type ?? 'general'),
    h1: payload.h1?.trim() || name,
    description: payload.description?.trim() || '',
    metaTitle: payload.metaTitle?.trim() || name,
    metaDescription: payload.metaDescription?.trim() || '',
  }

  db.categories.push(category)
  await writeDb(db)

  return NextResponse.json({ category }, { status: 201 })
}
