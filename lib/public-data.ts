import { readDb } from './db'
import type { Category, PublicClinic } from './cms'

export async function getPublicData() {
  const db = await readDb()

  const categoryMap = new Map(db.categories.map((category) => [category.id, category]))

  const clinics: PublicClinic[] = db.clinics.map((clinic) => ({
    ...clinic,
    categories: (clinic.categoryIds ?? [])
      .map((categoryId) => categoryMap.get(categoryId))
      .filter((category): category is Category => Boolean(category)),
  }))

  return {
    categories: db.categories,
    clinics,
  }
}

export async function getCategoryBySlug(slug: string) {
  const db = await readDb()
  return db.categories.find((category) => category.slug === slug) ?? null
}

export async function getClinicsByCategorySlug(slug: string) {
  const db = await readDb()
  const category = db.categories.find((entry) => entry.slug === slug)

  if (!category) {
    return { category: null, clinics: [] }
  }

  const categoryMap = new Map(db.categories.map((entry) => [entry.id, entry]))

  const clinics = db.clinics
    .filter((clinic) => (clinic.categoryIds ?? []).includes(category.id))
    .map((clinic) => ({
      ...clinic,
      categories: (clinic.categoryIds ?? [])
        .map((categoryId) => categoryMap.get(categoryId))
        .filter((entry): entry is Category => Boolean(entry)),
    }))

  return {
    category,
    clinics,
  }
}
