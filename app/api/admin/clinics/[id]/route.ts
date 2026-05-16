import { NextResponse } from 'next/server'

import { readDb, writeDb } from '@/lib/db'
import type { CmsClinic } from '@/lib/cms'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const payload = (await request.json()) as Partial<CmsClinic>

  const name = payload.name?.trim() ?? ''
  const description = payload.description?.trim() ?? ''
  const phone = payload.phone?.trim() ?? ''
  const email = payload.email?.trim() ?? ''
  const rating = Number(payload.rating)
  const reviewsCount = Number(payload.reviewsCount)
  const imageUrl = payload.imageUrl?.trim() ?? ''

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
  const index = db.clinics.findIndex((clinic) => clinic.id === id)

  if (index === -1) {
    return NextResponse.json({ message: 'Klinik nicht gefunden.' }, { status: 404 })
  }

  const googleMapsUrl = payload.googleMapsUrl?.trim() ?? db.clinics[index].googleMapsUrl ?? ''

  const updated: CmsClinic = {
    ...db.clinics[index],
    id,
    name,
    description,
    phone,
    email,
    rating,
    reviewsCount,
    imageUrl,
    googleMapsUrl,
    categoryIds: Array.isArray(payload.categoryIds) ? payload.categoryIds : [],
    specialization: payload.specialization?.trim() || db.clinics[index].specialization || 'Zahnmedizin',
    address: payload.address?.trim() || db.clinics[index].address || 'Cuxhaven',
    leadDoctor: payload.leadDoctor?.trim() || db.clinics[index].leadDoctor || 'Lead Doctor',
    doctorAvatar: payload.doctorAvatar?.trim() || db.clinics[index].doctorAvatar || imageUrl,
  }

  db.clinics[index] = updated
  await writeDb(db)

  return NextResponse.json({ clinic: updated })
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  const db = await readDb()
  const exists = db.clinics.some((clinic) => clinic.id === id)

  if (!exists) {
    return NextResponse.json({ message: 'Klinik nicht gefunden.' }, { status: 404 })
  }

  db.clinics = db.clinics.filter((clinic) => clinic.id !== id)
  await writeDb(db)

  return NextResponse.json({ ok: true })
}
