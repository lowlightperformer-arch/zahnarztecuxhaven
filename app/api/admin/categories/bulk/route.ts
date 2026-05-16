import { NextResponse } from 'next/server'

import { readDb, writeDb } from '@/lib/db'
import type { Category, CategoryType } from '@/lib/cms'

type BulkCategoryInput = {
  name: string
  slug: string
  type: CategoryType
  h1: string
  description: string
  metaTitle: string
  metaDescription: string
}

function normalizeType(value: string): CategoryType {
  if (value === 'district' || value === 'general' || value === 'service') {
    return value
  }

  return 'general'
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function parseInput(payload: unknown): BulkCategoryInput[] {
  const raw = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { categories?: unknown }).categories)
      ? (payload as { categories: unknown[] }).categories
      : null

  if (!raw) {
    throw new Error('Ungültiges Format. Erwartet wird ein JSON-Array mit Kategorien.')
  }

  const requiredFields: Array<keyof BulkCategoryInput> = [
    'name',
    'slug',
    'type',
    'h1',
    'description',
    'metaTitle',
    'metaDescription',
  ]

  return raw.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`Eintrag ${index + 1} ist kein gültiges Objekt.`)
    }

    const record = entry as Record<string, unknown>

    for (const field of requiredFields) {
      if (typeof record[field] !== 'string' || !record[field].trim()) {
        throw new Error(`Feld "${field}" fehlt oder ist leer (Eintrag ${index + 1}).`)
      }
    }

    const type = normalizeType(String(record.type).trim())

    return {
      name: String(record.name).trim(),
      slug: createSlug(String(record.slug).trim()),
      type,
      h1: String(record.h1).trim(),
      description: String(record.description).trim(),
      metaTitle: String(record.metaTitle).trim(),
      metaDescription: String(record.metaDescription).trim(),
    }
  })
}

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = (await request.json()) as unknown
  } catch {
    return NextResponse.json({ message: 'Ungültiges JSON. Bitte prüfe die Syntax.' }, { status: 400 })
  }

  let categoriesToImport: BulkCategoryInput[]

  try {
    categoriesToImport = parseInput(payload)
  } catch (parseError) {
    return NextResponse.json(
      { message: parseError instanceof Error ? parseError.message : 'Importdaten sind ungültig.' },
      { status: 400 },
    )
  }

  if (categoriesToImport.length === 0) {
    return NextResponse.json({ message: 'Das JSON-Array ist leer.' }, { status: 400 })
  }

  const db = await readDb()
  const existingSlugs = new Set(db.categories.map((category) => category.slug.toLowerCase()))
  const incomingSlugs = new Set<string>()

  for (const category of categoriesToImport) {
    const slug = category.slug.toLowerCase()

    if (existingSlugs.has(slug)) {
      return NextResponse.json({ message: `Slug bereits vorhanden: ${category.slug}` }, { status: 409 })
    }

    if (incomingSlugs.has(slug)) {
      return NextResponse.json({ message: `Doppelter Slug im Import: ${category.slug}` }, { status: 409 })
    }

    incomingSlugs.add(slug)
  }

  const newCategories: Category[] = categoriesToImport.map((entry) => ({
    id: `cat-${crypto.randomUUID()}`,
    name: entry.name,
    slug: entry.slug,
    type: entry.type,
    h1: entry.h1,
    description: entry.description,
    metaTitle: entry.metaTitle,
    metaDescription: entry.metaDescription,
  }))

  db.categories.push(...newCategories)
  await writeDb(db)

  return NextResponse.json({ addedCount: newCategories.length, categories: newCategories }, { status: 201 })
}
