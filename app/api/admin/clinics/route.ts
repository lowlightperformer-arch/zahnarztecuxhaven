import { NextResponse } from 'next/server'

import { readDb, writeDb } from '@/lib/db'
import type { CmsClinic } from '@/lib/cms'

export async function GET() {
  const db = await readDb()
  return NextResponse.json({ clinics: db.clinics })
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<CmsClinic>

  const name = payload.name?.trim() ?? ''
  const description = payload.description?.trim() ?? ''
  const phone = payload.phone?.trim() ?? ''
  const email = payload.email?.trim() ?? ''
  const rating = Number(payload.rating)
  const reviewsCount = Number(payload.reviewsCount)
  const imageUrl = payload.imageUrl?.trim() ?? ''
  const googleMapsUrl = payload.googleMapsUrl?.trim() ?? ''

  if (!name || !description || !phone || !email || !imageUrl) {
    return NextResponse.json({ message: 'Bitte alle Pflichtfelder ausfüllen.' }, { status: 400 })
  }

  if (Number.isNaN(rating) || rating < 0 || rating > 5) {
    return NextResponse.json({ message: 'Google Rating muss zwischen 0.0 und 5.0 liegen.' }, { status: 400 })
  }

  if (!Number.isInteger(reviewsCount) || reviewsCount < 0) {
    return NextResponse.json({ message: 'Reviews Count muss eine positive Ganzzahl sein.' }, { status: 400 })
  }

  const db = await readDb()

  const clinic: CmsClinic = {
    id: `clinic-${crypto.randomUUID()}`,
    name,
    description,
    phone,
    email,
    rating,
    reviewsCount,
    imageUrl,
    googleMapsUrl,
    categoryIds: Array.isArray(payload.categoryIds) ? payload.categoryIds : [],
    specialization: payload.specialization?.trim() || 'Zahnmedizin',
    address: payload.address?.trim() || 'Cuxhaven',
    leadDoctor: payload.leadDoctor?.trim() || 'Lead Doctor',
    doctorAvatar: payload.doctorAvatar?.trim() || payload.imageUrl?.trim() || '',
  }

  db.clinics.unshift(clinic)
  await writeDb(db)

  return NextResponse.json({ clinic }, { status: 201 })
}
