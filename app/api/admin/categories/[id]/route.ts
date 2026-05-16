import { NextResponse } from 'next/server'

import { readDb, writeDb } from '@/lib/db'
import type { Category, CategoryType } from '@/lib/cms'

function normalizeType(value: string): CategoryType {
  if (value === 'district' || value === 'general' || value === 'service') {
    return value
  }

  return 'general'
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const payload = (await request.json()) as Partial<Category>

  const db = await readDb()
  const index = db.categories.findIndex((category) => category.id === id)

  if (index === -1) {
    return NextResponse.json({ message: 'Kategorie nicht gefunden.' }, { status: 404 })
  }

  const name = payload.name?.trim() ?? ''
  const slug = payload.slug?.trim() ?? ''

  if (!name || !slug) {
    return NextResponse.json({ message: 'Name und Slug sind erforderlich.' }, { status: 400 })
  }

  if (db.categories.some((category) => category.id !== id && category.slug === slug)) {
    return NextResponse.json({ message: 'Slug bereits vorhanden.' }, { status: 409 })
  }

  const updated: Category = {
    ...db.categories[index],
    name,
    slug,
    type: normalizeType(payload.type ?? db.categories[index].type),
    h1: payload.h1?.trim() || name,
    description: payload.description?.trim() || '',
    metaTitle: payload.metaTitle?.trim() || name,
    metaDescription: payload.metaDescription?.trim() || '',
  }

  db.categories[index] = updated
  await writeDb(db)

  return NextResponse.json({ category: updated })
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const db = await readDb()

  const exists = db.categories.some((category) => category.id === id)
  if (!exists) {
    return NextResponse.json({ message: 'Kategorie nicht gefunden.' }, { status: 404 })
  }

  db.categories = db.categories.filter((category) => category.id !== id)
  db.clinics = db.clinics.map((clinic) => ({
    ...clinic,
    categoryIds: (clinic.categoryIds || []).filter((categoryId) => categoryId !== id),
  }))

  await writeDb(db)

  return NextResponse.json({ ok: true })
}
