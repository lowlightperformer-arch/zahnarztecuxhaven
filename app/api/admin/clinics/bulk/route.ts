import { NextResponse } from 'next/server'

import { readDb, writeDb } from '@/lib/db'
import type { CmsClinic } from '@/lib/cms'

type BulkClinicInput = {
  clinicName: string
  description?: string
  phone?: string
  email?: string
  rating?: number
  reviewsCount?: number
  image?: string
  googleMapsUrl?: string
  leadDoctor?: string
  categorySlugs?: string[]
}

function parseInput(payload: unknown): BulkClinicInput[] {
  const raw = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { clinics?: unknown }).clinics)
      ? (payload as { clinics: unknown[] }).clinics
      : null

  if (!raw) {
    throw new Error('Ungültiges Format. Erwartet wird ein JSON-Array mit Kliniken.')
  }

  // ZERO VALIDATION - Only check clinicName, map everything else with defaults
  return raw.map((entry) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error('Eintrag ist kein gültiges Objekt.')
    }

    const record = entry as Record<string, unknown>
    const clinicName = record.clinicName

    // ONLY clinicName is required
    if (typeof clinicName !== 'string' || !String(clinicName).trim()) {
      throw new Error('Feld "clinicName" ist erforderlich.')
    }

    // Everything else: safe defaults
    const description = record.description ? String(record.description).trim() : ''
    const phone = record.phone ? String(record.phone).trim() : ''
    const email = record.email ? String(record.email).trim() : ''
    const rating = typeof record.rating === 'number' ? record.rating : 0
    const reviewsCount = typeof record.reviewsCount === 'number' ? record.reviewsCount : 0
    const image = record.image ? String(record.image).trim() : ''
    const googleMapsUrl = record.googleMapsUrl ? String(record.googleMapsUrl).trim() : ''
    const leadDoctor = record.leadDoctor ? String(record.leadDoctor).trim() : ''
    const categorySlugs = Array.isArray(record.categorySlugs)
      ? (record.categorySlugs as string[]).map((s) => String(s).trim())
      : []

    return {
      clinicName: String(clinicName).trim(),
      description: description || undefined,
      phone: phone || undefined,
      email: email || undefined,
      rating: rating || undefined,
      reviewsCount: reviewsCount || undefined,
      image: image || undefined,
      googleMapsUrl: googleMapsUrl || undefined,
      leadDoctor: leadDoctor || undefined,
      categorySlugs: categorySlugs.length > 0 ? categorySlugs : undefined,
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

  let clinicsToImport: BulkClinicInput[]

  try {
    clinicsToImport = parseInput(payload)
  } catch (parseError) {
    return NextResponse.json(
      { message: parseError instanceof Error ? parseError.message : 'Importdaten sind ungültig.' },
      { status: 400 },
    )
  }

  if (clinicsToImport.length === 0) {
    return NextResponse.json({ message: 'Das JSON-Array ist leer.' }, { status: 400 })
  }

  const db = await readDb()

  // Create slug map for category lookup
  const categorySlugMap = new Map(db.categories.map((cat) => [cat.slug.toLowerCase(), cat.id]))

  const existingClinicNames = new Set(db.clinics.map((clinic) => clinic.name.toLowerCase()))
  let warningCount = 0

  const newClinics: CmsClinic[] = []

  for (const clinicInput of clinicsToImport) {
    // Check for duplicate clinic names
    if (existingClinicNames.has(clinicInput.clinicName.toLowerCase())) {
      return NextResponse.json(
        { message: `Klinik mit dem Namen "${clinicInput.clinicName}" existiert bereits.` },
        { status: 409 },
      )
    }

    // Map category slugs to category IDs
    const categoryIds: string[] = []

    if (clinicInput.categorySlugs && Array.isArray(clinicInput.categorySlugs)) {
      for (const slug of clinicInput.categorySlugs) {
        const categoryId = categorySlugMap.get(slug.toLowerCase())

        if (categoryId) {
          categoryIds.push(categoryId)
        } else {
          // Log warning but continue
          warningCount++
          console.warn(`Category slug not found: "${slug}" for clinic "${clinicInput.clinicName}"`)
        }
      }
    }

    // Create new clinic with optional fields
    const newClinic: CmsClinic = {
      id: `clinic-${crypto.randomUUID()}`,
      name: clinicInput.clinicName,
      ...(clinicInput.description && { description: clinicInput.description }),
      ...(clinicInput.phone && { phone: clinicInput.phone }),
      ...(clinicInput.email && { email: clinicInput.email }),
      ...(clinicInput.rating && { rating: clinicInput.rating }),
      ...(clinicInput.reviewsCount && { reviewsCount: clinicInput.reviewsCount }),
      ...(clinicInput.image && { imageUrl: clinicInput.image }),
      ...(clinicInput.googleMapsUrl && { googleMapsUrl: clinicInput.googleMapsUrl }),
      ...(categoryIds.length > 0 && { categoryIds }),
      specialization: 'Zahnmedizin',
      address: 'Cuxhaven',
      ...(clinicInput.leadDoctor && { leadDoctor: clinicInput.leadDoctor }),
      ...(clinicInput.image && { doctorAvatar: clinicInput.image }),
    }

    newClinics.push(newClinic)
    existingClinicNames.add(clinicInput.clinicName.toLowerCase())
  }

  // Add all new clinics to database
  db.clinics.unshift(...newClinics)
  await writeDb(db)

  return NextResponse.json(
    { addedCount: newClinics.length, warningCount, clinics: newClinics },
    { status: 201 },
  )
}
